import { Component, input, computed } from '@angular/core';
import { SubscriptionState } from '../../../core/models/subscription.model';
import { InvoiceState } from '../../../core/models/invoice.model';

type BadgeState = SubscriptionState | InvoiceState;

export interface BadgeConfig {
  label: string;
  color: string;
  background: string;
}

const BADGE_MAP: Record<BadgeState, BadgeConfig> = {
  active: {
    label: 'Active',
    color: 'var(--accent-success)',
    background: 'var(--accent-success-dim)',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'var(--accent-error)',
    background: 'var(--accent-error-dim)',
  },
  expired: {
    label: 'Expired',
    color: 'var(--text-secondary)',
    background: 'rgba(122,139,160,0.1)',
  },
  on_hold: {
    label: 'On Hold',
    color: 'var(--accent-warning)',
    background: 'var(--accent-warning-dim)',
  },
  created: { label: 'Created', color: 'var(--accent-info)', background: 'var(--accent-info-dim)' },
  pending: {
    label: 'Pending',
    color: 'var(--accent-warning)',
    background: 'var(--accent-warning-dim)',
  },
  settled: {
    label: 'Settled',
    color: 'var(--accent-success)',
    background: 'var(--accent-success-dim)',
  },
  authorized: {
    label: 'Authorized',
    color: 'var(--accent-purple)',
    background: 'var(--accent-purple-dim)',
  },
  failed: { label: 'Failed', color: 'var(--accent-error)', background: 'var(--accent-error-dim)' },
  unknown: { label: 'Unknown', color: 'var(--text-muted)', background: 'rgba(122,139,160,0.08)' },
};

@Component({
  selector: 'app-state-badge',
  standalone: true,
  templateUrl: './state-badge.component.html',
  styleUrl: './state-badge.component.scss',
})
export class StateBadgeComponent {
  readonly state = input.required<string>();

  readonly config = computed<BadgeConfig>(() => {
    const s = this.state() as BadgeState;
    return BADGE_MAP[s] ?? BADGE_MAP['unknown'];
  });
}
