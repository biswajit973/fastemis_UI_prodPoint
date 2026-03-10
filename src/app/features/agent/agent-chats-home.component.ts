import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface AgentChatHomeAction {
  label: string;
  helper: string;
  route: string;
  icon: 'support' | 'community' | 'ghost' | 'alerts' | 'setup' | 'visibility';
}

@Component({
  selector: 'app-agent-chats-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto w-full max-w-6xl px-3 pb-10 sm:px-5 lg:px-8">
      <section class="rounded-[28px] border border-white/60 bg-gradient-to-br from-[#f7fbff] via-[#edf4fb] to-[#e8eff8] p-4 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:p-5">
        <div class="flex flex-col gap-3">
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Chats Home</p>
            <h1 class="mt-2 text-[28px] leading-[1.02] font-display text-primary">Conversation control</h1>
            <p class="mt-2 max-w-2xl text-[14px] leading-6 text-secondary">
              Open support, ghost, and community conversation tools from one clean mobile-first workspace.
            </p>
          </div>
        </div>
      </section>

      <section class="mt-4 rounded-[28px] border border-border bg-surface p-4 shadow-[0_16px_44px_rgba(15,23,42,0.06)] sm:p-5">
        <div class="flex items-end justify-between gap-3">
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Quick Actions</p>
            <h2 class="mt-2 text-[24px] leading-tight font-display text-primary">Open a chat workflow</h2>
            <p class="mt-1 text-[14px] leading-6 text-secondary">Each route below is focused on one communication flow, so agents do not lose context while switching tasks.</p>
          </div>
        </div>

        <div class="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          <a
            *ngFor="let action of actions"
            [routerLink]="action.route"
            class="group rounded-[24px] border border-border bg-surface-2/60 p-4 no-underline shadow-sm transition hover:border-primary/20 hover:bg-white hover:shadow-[0_14px_28px_rgba(15,23,42,0.08)]">
            <div class="flex h-11 w-11 items-center justify-center rounded-[18px] border border-white/70 bg-white text-primary shadow-sm">
              <ng-container [ngSwitch]="action.icon">
                <svg *ngSwitchCase="'support'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <svg *ngSwitchCase="'community'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                </svg>
                <svg *ngSwitchCase="'ghost'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 10h.01"></path>
                  <path d="M15 10h.01"></path>
                  <path d="M12 2a8 8 0 0 0-8 8v10l3-3 2 3 3-3 3 3 2-3 3 3V10a8 8 0 0 0-8-8z"></path>
                </svg>
                <svg *ngSwitchCase="'alerts'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5"></path>
                  <path d="M9 17a3 3 0 0 0 6 0"></path>
                </svg>
                <svg *ngSwitchCase="'setup'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c0 .66.26 1.3.73 1.77.47.47 1.11.73 1.77.73H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
                <svg *ngSwitchCase="'visibility'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </ng-container>
            </div>
            <p class="mt-4 text-[16px] font-semibold leading-5 text-primary">{{ action.label }}</p>
            <p class="mt-2 text-[13px] leading-6 text-secondary">{{ action.helper }}</p>
          </a>
        </div>
      </section>
    </div>
  `
})
export class AgentChatsHomeComponent {
  readonly actions: AgentChatHomeAction[] = [
    {
      label: 'Support Chats',
      helper: 'Direct one-to-one support threads with real users.',
      route: '/agent/support-chats',
      icon: 'support'
    },
    {
      label: 'Community Chat',
      helper: 'Monitor and reply inside the public community flow.',
      route: '/agent/community',
      icon: 'community'
    },
    {
      label: 'Ghost Chat',
      helper: 'Handle masked chat flows and identity-based replies.',
      route: '/agent/chats',
      icon: 'ghost'
    },
    {
      label: 'Announcements',
      helper: 'Push alerts that support conversations and BGV updates.',
      route: '/agent/announcements',
      icon: 'alerts'
    },
    {
      label: 'Ghost Setup',
      helper: 'Manage ghost identities used across community and ghost chat.',
      route: '/agent/ghost-setup',
      icon: 'setup'
    },
    {
      label: 'Community Visibility',
      helper: 'Decide whether one user stays public to everyone or is visible only to self and agents.',
      route: '/agent/community-visibility',
      icon: 'visibility'
    }
  ];
}
