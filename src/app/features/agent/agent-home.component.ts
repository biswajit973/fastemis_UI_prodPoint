import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AgentUserSummary } from '../../core/models/agent-user.model';
import { AgentUserApiService } from '../../core/services/agent-user-api.service';
import { BrowserResetService } from '../../core/services/browser-reset.service';

interface AgentHomeAction {
  label: string;
  helper: string;
  route: string;
  icon: 'users' | 'chat' | 'bell' | 'wallet' | 'community' | 'video' | 'stock' | 'file' | 'sliders';
  queryParams?: Record<string, string>;
}

@Component({
  selector: 'app-agent-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full max-w-6xl mx-auto pb-8 space-y-4 sm:space-y-5">
      <section class="rounded-[28px] border border-white/60 bg-gradient-to-br from-[#f7fbff] via-[#edf4fb] to-[#e9eef8] p-4 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:p-5">
        <div class="flex flex-col gap-3">
          <div class="min-w-0">
            <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Agent Home</p>
            <h1 class="mt-2 text-[28px] leading-[1.02] font-display text-primary">FastEMIs operations desk</h1>
            <p class="mt-2 max-w-2xl text-[14px] leading-6 text-secondary">
              Start here after login. Use quick links to jump into applicants, support, payments, agreements, and moderation without losing context.
            </p>
          </div>
        </div>
      </section>

      <section class="rounded-[28px] border border-border bg-surface p-4 shadow-[0_16px_44px_rgba(15,23,42,0.06)] sm:p-5">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Quick Menu</p>
            <p class="mt-1 text-[14px] leading-6 text-secondary">Everything an agent needs, kept one tap away.</p>
          </div>
          <span class="hidden sm:inline-flex rounded-full border border-border bg-surface-2 px-3 py-1 text-[12px] font-medium text-secondary">
            Agent shortcuts
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
                <svg *ngSwitchCase="'community'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 11a4 4 0 0 1-4 4h-1"></path>
                </svg>
                <svg *ngSwitchCase="'video'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="6" width="15" height="12" rx="2"></rect>
                  <path d="m17 10 5-3v10l-5-3z"></path>
                </svg>
                <svg *ngSwitchCase="'stock'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 3v18h18"></path>
                  <path d="m7 13 4-4 3 3 5-5"></path>
                </svg>
                <svg *ngSwitchCase="'file'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <path d="M14 2v6h6"></path>
                  <path d="M16 13H8"></path>
                  <path d="M16 17H8"></path>
                  <path d="M10 9H8"></path>
                </svg>
                <svg *ngSwitchCase="'sliders'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="4" y1="21" x2="4" y2="14"></line>
                  <line x1="4" y1="10" x2="4" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12" y2="3"></line>
                  <line x1="20" y1="21" x2="20" y2="16"></line>
                  <line x1="20" y1="12" x2="20" y2="3"></line>
                  <line x1="1" y1="14" x2="7" y2="14"></line>
                  <line x1="9" y1="8" x2="15" y2="8"></line>
                  <line x1="17" y1="16" x2="23" y2="16"></line>
                </svg>
              </ng-container>
            </div>
            <p class="mt-3 text-[15px] font-semibold leading-5 text-primary">{{ action.label }}</p>
            <p class="mt-1 text-[12px] leading-5 text-secondary">{{ action.helper }}</p>
          </a>
        </div>
      </section>

      <section class="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <article class="rounded-[28px] border border-border bg-surface p-4 shadow-[0_16px_44px_rgba(15,23,42,0.06)] sm:p-5">
          <div class="flex items-end justify-between gap-3">
            <div>
              <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Applicants Queue</p>
              <h2 class="mt-2 text-[24px] leading-tight font-display text-primary">Jump into verification</h2>
              <p class="mt-1 text-[14px] leading-6 text-secondary">Open the full applicants screen for profile review and management actions.</p>
            </div>
            <a
              routerLink="/agent/applicants"
              class="shrink-0 rounded-full bg-primary px-4 py-2 text-[13px] font-semibold text-white no-underline shadow-sm transition hover:bg-primary/90">
              Open applicants
            </a>
          </div>

          <div class="mt-4 space-y-3">
            <article
              *ngFor="let user of previewUsers(); trackBy: trackByUserId"
              class="rounded-[22px] border border-border bg-surface-2/60 px-3.5 py-3.5 shadow-sm">
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-center gap-3 min-w-0">
                  <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-[14px] font-semibold text-white shadow-sm">
                    {{ getInitials(user.full_name) }}
                  </div>
                  <div class="min-w-0">
                    <p class="truncate text-[15px] font-semibold text-primary">{{ displayValue(user.full_name) }}</p>
                    <p class="text-[12px] text-secondary">{{ displayValue(user.mobile_number) }}<span *ngIf="formatLastSeen(user.last_login)"> • {{ formatLastSeen(user.last_login) }}</span></p>
                  </div>
                </div>

                <span class="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                  [ngClass]="user.profile_complete ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'">
                  {{ user.profile_complete ? 'Filled' : 'Pending' }}
                </span>
              </div>
            </article>

            <div *ngIf="!loading() && previewUsers().length === 0" class="rounded-[22px] border border-border bg-surface-2/60 px-4 py-6 text-center text-[14px] text-secondary">
              No applicants yet.
            </div>
          </div>
        </article>

        <article class="rounded-[28px] border border-border bg-surface p-4 shadow-[0_16px_44px_rgba(15,23,42,0.06)] sm:p-5">
          <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Today at a glance</p>
          <div class="mt-4 space-y-3">
            <div class="rounded-[22px] border border-border bg-surface-2/60 p-4">
              <p class="text-[13px] font-semibold text-primary">Support queue</p>
              <p class="mt-1 text-[14px] leading-6 text-secondary">Reply to direct customer chats and keep response times tight.</p>
              <a routerLink="/agent/support-chats" class="mt-3 inline-flex text-[13px] font-semibold text-primary no-underline">Open support chats</a>
            </div>

            <div class="rounded-[22px] border border-border bg-surface-2/60 p-4">
              <p class="text-[13px] font-semibold text-primary">Public operations</p>
              <p class="mt-1 text-[14px] leading-6 text-secondary">Handle announcements, community moderation, and ghost identities from one flow.</p>
              <div class="mt-3 flex flex-wrap gap-2">
                <a routerLink="/agent/announcements" class="rounded-full border border-border bg-white/80 px-3 py-1.5 text-[12px] font-medium text-primary no-underline">Announcements</a>
                <a routerLink="/agent/community" class="rounded-full border border-border bg-white/80 px-3 py-1.5 text-[12px] font-medium text-primary no-underline">Community</a>
                <a routerLink="/agent/ghost-setup" class="rounded-full border border-border bg-white/80 px-3 py-1.5 text-[12px] font-medium text-primary no-underline">Ghost Setup</a>
              </div>
            </div>

            <div class="rounded-[22px] border border-border bg-surface-2/60 p-4">
              <p class="text-[13px] font-semibold text-primary">Payments and agreements</p>
              <p class="mt-1 text-[14px] leading-6 text-secondary">Keep payment settings, templates, and agreement controls close during user onboarding.</p>
              <div class="mt-3 flex flex-wrap gap-2">
                <a routerLink="/agent/payments" class="rounded-full border border-border bg-white/80 px-3 py-1.5 text-[12px] font-medium text-primary no-underline">Payments</a>
                <a routerLink="/agent/agreements" class="rounded-full border border-border bg-white/80 px-3 py-1.5 text-[12px] font-medium text-primary no-underline">Agreements</a>
              </div>
            </div>
          </div>
        </article>
      </section>

      <section class="rounded-[24px] border border-border bg-surface p-4 shadow-[0_14px_30px_rgba(15,23,42,0.05)] sm:p-5">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Browser reset</p>
            <p class="mt-1 text-[14px] leading-6 text-secondary">Use this only when you need a complete clean browser state during agent-side testing.</p>
          </div>
          <button
            type="button"
            (click)="resetBrowserData()"
            [disabled]="browserReset.busy()"
            class="inline-flex h-11 items-center justify-center rounded-[18px] border border-border bg-surface-2 px-4 text-[13px] font-semibold text-primary transition-colors hover:bg-white disabled:opacity-60">
            {{ browserReset.busy() ? 'Clearing...' : 'Clear Session + Cache' }}
          </button>
        </div>
      </section>
    </div>
  `
})
export class AgentHomeComponent implements OnInit {
  private readonly agentUsersApi = inject(AgentUserApiService);
  readonly browserReset = inject(BrowserResetService);

  readonly users = this.agentUsersApi.users;
  readonly loading = this.agentUsersApi.loading;
  readonly previewUsers = computed(() => this.users().slice(0, 3));

  readonly quickActions: AgentHomeAction[] = [
    { label: 'Applicants', helper: 'Open full queue', route: '/agent/applicants', icon: 'users' },
    { label: 'Chats Home', helper: 'Support, community, ghost, and alerts', route: '/agent/chats-home', icon: 'chat' },
    { label: 'Community', helper: 'Moderate public feed', route: '/agent/community', icon: 'community' },
    { label: 'Announcements', helper: 'Push status updates', route: '/agent/announcements', icon: 'bell' },
    { label: 'Payment Home', helper: 'QR, templates, overrides, and logs', route: '/agent/payments', icon: 'wallet' },
    { label: 'User UI Config', helper: 'Lock sections or block login', route: '/agent/ui-config', icon: 'sliders' },
    { label: 'Agreements Home', helper: 'Control agreement access', route: '/agent/agreements', icon: 'file' },
    { label: 'Stocks', helper: 'Manage devices', route: '/agent/stocks', icon: 'stock' }
  ];

  private readonly initialized = signal(false);

  ngOnInit(): void {
    if (this.initialized()) {
      return;
    }
    this.initialized.set(true);
    this.agentUsersApi.loadUsers(false).subscribe();
  }

  trackByRoute(_index: number, item: AgentHomeAction): string {
    return item.route;
  }

  trackByUserId(_index: number, user: AgentUserSummary): string {
    return String(user.id);
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

  displayValue(value: string): string {
    const raw = String(value || '').trim();
    return raw || 'Not filled yet';
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

  resetBrowserData(): void {
    void this.browserReset.clearBrowserSessionData();
  }
}
