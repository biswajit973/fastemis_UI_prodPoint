import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AgentUserSummary } from '../../core/models/agent-user.model';
import { AgentUserApiService } from '../../core/services/agent-user-api.service';

interface AgentQuickAction {
  label: string;
  helper: string;
  route: string;
  icon: 'users' | 'chat' | 'bell' | 'wallet' | 'file';
  queryParams?: Record<string, string>;
}

@Component({
  selector: 'app-agent-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full max-w-6xl mx-auto pb-8 space-y-4 sm:space-y-5">
      <section class="rounded-[28px] border border-white/60 bg-gradient-to-br from-[#f7fbff] via-[#edf4fb] to-[#e9eef8] p-4 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:p-5">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Agent Desk</p>
            <h1 class="mt-2 text-[28px] leading-[1.02] font-display text-primary">Applicants Queue</h1>
            <p class="mt-2 max-w-xl text-[14px] leading-6 text-secondary">
              Review sign-ups, jump into profile checks, and keep operations moving from one clean workspace.
            </p>
          </div>

          <button
            type="button"
            (click)="refresh()"
            [disabled]="loading()"
            class="shrink-0 rounded-full border border-white/80 bg-white/85 px-3.5 py-2 text-[13px] font-semibold text-primary shadow-sm backdrop-blur-sm transition hover:bg-white disabled:opacity-60">
            {{ loading() ? 'Refreshing...' : 'Refresh' }}
          </button>
        </div>

        <div class="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
          <div class="rounded-[22px] border border-white/80 bg-white/80 px-3.5 py-3.5 shadow-sm backdrop-blur-sm">
            <p class="text-[11px] uppercase tracking-[0.18em] text-slate-400">Total Users</p>
            <p class="mt-2 text-[28px] font-semibold leading-none text-primary">{{ stats().total }}</p>
          </div>

          <div class="rounded-[22px] border border-white/80 bg-white/80 px-3.5 py-3.5 shadow-sm backdrop-blur-sm">
            <p class="text-[11px] uppercase tracking-[0.18em] text-slate-400">Profile Complete</p>
            <p class="mt-2 text-[28px] font-semibold leading-none text-success">{{ stats().complete }}</p>
          </div>

          <div class="rounded-[22px] border border-white/80 bg-white/80 px-3.5 py-3.5 shadow-sm backdrop-blur-sm">
            <p class="text-[11px] uppercase tracking-[0.18em] text-slate-400">Needs Follow-up</p>
            <p class="mt-2 text-[28px] font-semibold leading-none text-warning">{{ stats().incomplete }}</p>
          </div>

          <div class="rounded-[22px] border border-white/80 bg-white/80 px-3.5 py-3.5 shadow-sm backdrop-blur-sm">
            <p class="text-[11px] uppercase tracking-[0.18em] text-slate-400">Disabled</p>
            <p class="mt-2 text-[28px] font-semibold leading-none text-error">{{ stats().disabled }}</p>
          </div>
        </div>
      </section>

      <section class="rounded-[28px] border border-border bg-surface p-4 shadow-[0_16px_44px_rgba(15,23,42,0.06)] sm:p-5">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Quick Menu</p>
            <p class="mt-1 text-[14px] leading-6 text-secondary">Jump to the tools you use most during verification.</p>
          </div>
          <span class="hidden sm:inline-flex rounded-full border border-border bg-surface-2 px-3 py-1 text-[12px] font-medium text-secondary">
            Fast actions
          </span>
        </div>

        <div class="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <a
            *ngFor="let action of quickActions; trackBy: trackByRoute"
            [routerLink]="action.route"
            [queryParams]="action.queryParams || null"
            class="group rounded-[24px] border border-border bg-surface-2/60 px-3.5 py-4 no-underline shadow-sm transition hover:border-primary/20 hover:bg-white hover:shadow-[0_14px_28px_rgba(15,23,42,0.08)]">
            <div class="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/70 bg-white text-primary shadow-sm">
              <ng-container [ngSwitch]="action.icon">
                <svg *ngSwitchCase="'users'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <svg *ngSwitchCase="'chat'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <svg *ngSwitchCase="'bell'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5"></path>
                  <path d="M9 17a3 3 0 0 0 6 0"></path>
                </svg>
                <svg *ngSwitchCase="'wallet'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"></path>
                  <path d="M16 12h.01"></path>
                  <path d="M3 9h18"></path>
                </svg>
                <svg *ngSwitchCase="'file'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <path d="M14 2v6h6"></path>
                  <path d="M16 13H8"></path>
                  <path d="M16 17H8"></path>
                  <path d="M10 9H8"></path>
                </svg>
              </ng-container>
            </div>
            <p class="mt-3 text-[15px] font-semibold leading-5 text-primary">{{ action.label }}</p>
            <p class="mt-1 text-[12px] leading-5 text-secondary">{{ action.helper }}</p>
          </a>
        </div>
      </section>

      <section class="rounded-[28px] border border-border bg-surface p-4 shadow-[0_16px_44px_rgba(15,23,42,0.06)] sm:p-5">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Verification Flow</p>
            <h2 class="mt-2 text-[24px] leading-tight font-display text-primary">Recent applicants</h2>
            <p class="mt-1 text-[14px] leading-6 text-secondary">Open a profile to review details or jump straight into management actions.</p>
          </div>

          <span class="inline-flex w-fit rounded-full border border-border bg-surface-2 px-3 py-1 text-[12px] font-medium text-secondary">
            {{ loading() ? 'Updating list...' : users().length + ' applicants loaded' }}
          </span>
        </div>

      <div *ngIf="loading() && users().length === 0" class="mt-4 rounded-[24px] border border-border bg-surface-2/60 p-8 flex items-center justify-center">
        <div class="w-8 h-8 rounded-full border-2 border-surface-3 border-t-primary animate-spin"></div>
      </div>

      <div *ngIf="!loading() && users().length === 0" class="mt-4 rounded-[24px] border border-border bg-surface-2/60 p-6 text-center text-secondary">
        No signed-up users found yet.
      </div>

      <div class="mt-4 md:hidden space-y-3" *ngIf="users().length > 0">
        <article *ngFor="let user of users(); trackBy: trackByUserId" class="rounded-[24px] border border-border bg-surface-2/60 p-4 shadow-sm">
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="flex items-center gap-2">
                <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-[14px] font-semibold text-white shadow-sm">
                  {{ getInitials(user.full_name) }}
                </div>
                <div>
                  <h3 class="text-[15px] font-semibold leading-5 text-primary">{{ displayValue(user.full_name) }}</h3>
                  <p class="text-[12px] text-secondary">ID: {{ user.id }} <span *ngIf="formatLastSeen(user.last_login)">• {{ formatLastSeen(user.last_login) }}</span></p>
                </div>
              </div>
            </div>

            <div class="flex flex-col items-end gap-2">
              <span class="px-2.5 py-1 rounded-full text-[11px] font-semibold"
                [ngClass]="user.profile_complete ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'">
                {{ user.profile_complete ? 'Filled' : 'Pending' }}
              </span>
              <span *ngIf="user.agreement_completed_at" class="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
                Agreement done
              </span>
            </div>
          </div>

          <div class="mt-3 grid grid-cols-2 gap-2.5 text-[12px]">
            <div class="rounded-2xl border border-border bg-white/70 p-3">
              <span class="block text-[11px] uppercase tracking-[0.16em] text-slate-400">Email</span>
              <p class="mt-1 break-all text-primary">{{ displayValue(user.email) }}</p>
            </div>
            <div class="rounded-2xl border border-border bg-white/70 p-3">
              <span class="block text-[11px] uppercase tracking-[0.16em] text-slate-400">Mobile</span>
              <p class="mt-1 text-primary">{{ displayValue(user.mobile_number) }}</p>
            </div>
            <div class="rounded-2xl border border-border bg-white/70 p-3">
              <span class="block text-[11px] uppercase tracking-[0.16em] text-slate-400">Requested</span>
              <p class="mt-1 text-primary">{{ formatRequestedAmount(user.requested_amount) }}</p>
            </div>
            <div class="rounded-2xl border border-border bg-white/70 p-3">
              <span class="block text-[11px] uppercase tracking-[0.16em] text-slate-400">Missing Fields</span>
              <p class="mt-1 text-primary">{{ user.missing_fields.length }}</p>
            </div>
          </div>

          <div class="mt-3 grid grid-cols-2 gap-2">
            <a [routerLink]="['/agent/applications', user.id]" [queryParams]="{ tab: 'profile' }"
              class="text-center px-3 py-2.5 rounded-2xl border border-border bg-white/80 text-[12px] font-semibold text-primary no-underline shadow-sm transition hover:bg-white">
              Profile Details
            </a>
            <a [routerLink]="['/agent/applications', user.id]" [queryParams]="{ tab: 'management' }"
              class="text-center px-3 py-2.5 rounded-2xl bg-primary text-[12px] font-semibold text-white no-underline shadow-sm transition hover:bg-primary/90">
              Management
            </a>
          </div>
        </article>
      </div>

      <div class="hidden md:block mt-4 overflow-x-auto rounded-[26px] border border-border bg-surface shadow-sm" *ngIf="users().length > 0">
        <table class="min-w-full text-sm">
          <thead class="bg-surface-2/70 border-b border-border text-secondary">
            <tr>
              <th class="px-4 py-3 text-left font-medium">User</th>
              <th class="px-4 py-3 text-left font-medium">Contact</th>
              <th class="px-4 py-3 text-left font-medium">Requested Amount</th>
              <th class="px-4 py-3 text-left font-medium">Profile Status</th>
              <th class="px-4 py-3 text-left font-medium">Filled</th>
              <th class="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr *ngFor="let user of users(); trackBy: trackByUserId" class="hover:bg-surface-2/50">
              <td class="px-4 py-3 align-top">
                <div class="flex items-center gap-3">
                  <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-[14px] font-semibold text-white shadow-sm">
                    {{ getInitials(user.full_name) }}
                  </div>
                  <div>
                    <p class="font-semibold text-primary">{{ displayValue(user.full_name) }}</p>
                    <p class="text-xs text-secondary">ID: {{ user.id }} <span *ngIf="formatLastSeen(user.last_login)">• {{ formatLastSeen(user.last_login) }}</span></p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 align-top">
                <p class="text-primary">{{ displayValue(user.mobile_number) }}</p>
                <p class="text-xs text-secondary break-all">{{ displayValue(user.email) }}</p>
              </td>
              <td class="px-4 py-3 align-top text-primary">{{ formatRequestedAmount(user.requested_amount) }}</td>
              <td class="px-4 py-3 align-top">
                <span class="px-2 py-1 rounded-full text-xs font-semibold"
                  [ngClass]="user.profile_complete ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'">
                  {{ user.profile_complete ? 'Filled' : 'Pending' }}
                </span>
                <p class="mt-1 text-xs text-secondary">
                  {{ user.profile_progress }}% complete • {{ user.missing_fields.length }} missing
                </p>
                <p *ngIf="user.agreement_completed_at" class="mt-1 text-[11px] font-medium text-primary">
                  Agreement completed
                </p>
              </td>
              <td class="px-4 py-3 align-top text-primary">
                {{ user.filled_fields_count }}/{{ user.total_required_fields }}
              </td>
              <td class="px-4 py-3 align-top text-right">
                <div class="inline-flex gap-2">
                  <a [routerLink]="['/agent/applications', user.id]" [queryParams]="{ tab: 'profile' }"
                    class="px-3 py-1.5 rounded-xl border border-border text-xs font-medium text-primary no-underline hover:bg-surface-2">
                    Profile Details
                  </a>
                  <a [routerLink]="['/agent/applications', user.id]" [queryParams]="{ tab: 'management' }"
                    class="px-3 py-1.5 rounded-xl bg-primary text-xs font-medium text-white no-underline hover:bg-primary/90">
                    Management
                  </a>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      </section>
    </div>
  `
})
export class AgentDashboardComponent implements OnInit {
  private readonly agentUsersApi = inject(AgentUserApiService);

  readonly quickActions: AgentQuickAction[] = [
    {
      label: 'Agent Home',
      helper: 'Back to main operations desk',
      route: '/agent',
      icon: 'users'
    },
    {
      label: 'Chats Home',
      helper: 'Support, community, ghost, and alerts',
      route: '/agent/chats-home',
      icon: 'chat'
    },
    {
      label: 'Announcements',
      helper: 'Push status updates',
      route: '/agent/announcements',
      icon: 'bell'
    },
    {
      label: 'Payment Home',
      helper: 'QR, templates, overrides, and logs',
      route: '/agent/payments',
      icon: 'wallet'
    },
    {
      label: 'Agreements Home',
      helper: 'Enable, disable, or reset signed flows',
      route: '/agent/agreements',
      icon: 'file'
    }
  ];

  readonly users = this.agentUsersApi.users;
  readonly loading = this.agentUsersApi.loading;
  readonly stats = computed(() => {
    const users = this.users();
    let complete = 0;
    let disabled = 0;
    for (const user of users) {
      if (user.profile_complete) complete += 1;
      if (!user.is_active) disabled += 1;
    }
    return {
      total: users.length,
      complete,
      incomplete: users.length - complete,
      disabled
    };
  });

  private readonly initialized = signal(false);

  ngOnInit(): void {
    if (this.initialized()) {
      return;
    }
    this.initialized.set(true);
    this.agentUsersApi.loadUsers(true).subscribe();
  }

  refresh(): void {
    this.agentUsersApi.loadUsers(true).subscribe();
  }

  trackByUserId(_index: number, user: AgentUserSummary): string {
    return String(user.id);
  }

  trackByRoute(_index: number, item: AgentQuickAction): string {
    return item.route;
  }

  displayValue(value: string): string {
    const raw = String(value || '').trim();
    return raw || 'Not filled yet';
  }

  getInitials(value: string): string {
    const raw = this.displayValue(value);
    if (raw === 'Not filled yet') {
      return 'U';
    }
    return raw
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('');
  }

  formatLastSeen(value: string | null): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date);
  }

  formatRequestedAmount(value: string): string {
    const raw = String(value || '').trim();
    if (!raw || raw.toLowerCase() === 'not filled yet') {
      return 'Not filled yet';
    }

    const asNumber = Number(raw);
    if (!Number.isFinite(asNumber) || asNumber <= 0) {
      return raw;
    }

    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(asNumber);
  }
}
