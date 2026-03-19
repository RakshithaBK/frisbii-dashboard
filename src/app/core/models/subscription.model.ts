/**
 * Const object — use for comparisons and template bindings:
 *   SUBSCRIPTION_STATES.active
 *   SUBSCRIPTION_STATES.on_hold
 */
export const SUBSCRIPTION_STATES = {
  active: 'active',
  cancelled: 'cancelled',
  expired: 'expired',
  on_hold: 'on_hold',
  unknown: 'unknown',
} as const;

/**
 * Type derived from the const — used for typing fields and parameters.
 */
export type SubscriptionState = (typeof SUBSCRIPTION_STATES)[keyof typeof SUBSCRIPTION_STATES];

/**
 * Subscription resource from Frisbii API.
 */
export interface Subscription {
  handle: string;
  state: SubscriptionState;
  plan: string;
  customer: string;
  quantity?: number;
  amount?: number;
  currency?: string;
  created: string;
  activated?: string;
  cancelled?: string;
  expired?: string;
  on_hold_from?: string;
  trial_from?: string;
  trial_to?: string;
  test?: boolean;
  metadata?: Record<string, string>;
}

/**
 * Normalise an unknown state string to a known SubscriptionState.
 */
export function normaliseSubscriptionState(raw: string | undefined): SubscriptionState {
  const known: SubscriptionState[] = [
    SUBSCRIPTION_STATES.active,
    SUBSCRIPTION_STATES.cancelled,
    SUBSCRIPTION_STATES.expired,
    SUBSCRIPTION_STATES.on_hold,
  ];
  return known.includes(raw as SubscriptionState)
    ? (raw as SubscriptionState)
    : SUBSCRIPTION_STATES.unknown;
}

export interface OnHoldRequest {
  on_hold_from?: string; // ISO 8601
}
