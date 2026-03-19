import { Component, input, computed } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { SubscriptionState } from '../../../core/models/subscription.model';
import { InvoiceState } from '../../../core/models/invoice.model';

type BadgeState = SubscriptionState | InvoiceState;

interface BadgeConfig {
  label: string;
  cssClass: string;
}

const BADGE_MAP: Record<BadgeState, BadgeConfig> = {
  active: { label: 'Active', cssClass: 'badge--success' },
  cancelled: { label: 'Cancelled', cssClass: 'badge--error' },
  expired: { label: 'Expired', cssClass: 'badge--muted' },
  on_hold: { label: 'On Hold', cssClass: 'badge--warning' },
  created: { label: 'Created', cssClass: 'badge--info' },
  pending: { label: 'Pending', cssClass: 'badge--warning' },
  settled: { label: 'Settled', cssClass: 'badge--success' },
  authorized: { label: 'Authorized', cssClass: 'badge--purple' },
  failed: { label: 'Failed', cssClass: 'badge--error' },
  unknown: { label: 'Unknown', cssClass: 'badge--muted' },
};

@Component({
  selector: 'app-state-badge',
  standalone: true,
  imports: [MatChipsModule],
  template: `
    <mat-chip-set>
      <mat-chip [class]="config().cssClass" [highlighted]="false" disableRipple>
        {{ config().label }}
      </mat-chip>
    </mat-chip-set>
  `,
  styleUrl: './state-badge.component.scss',
})
export class StateBadgeComponent {
  readonly state = input.required<string>();
  readonly config = computed<BadgeConfig>(() => {
    const s = this.state() as BadgeState;
    return BADGE_MAP[s] ?? BADGE_MAP['unknown'];
  });
}
