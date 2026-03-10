import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AgentUserSummary } from '../../../../core/models/agent-user.model';
import {
  AgentUserUiConfigDetail,
  AgentUserUiGlobalConfig,
  AgentUserUiOverrideConfig
} from '../../../../core/models/user-ui-config.model';
import { AgentUserApiService } from '../../../../core/services/agent-user-api.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { UserUiConfigApiService } from '../../../../core/services/user-ui-config-api.service';

type UiConfigKey = 'supportChatLocked' | 'agreementsLocked' | 'groupChatLocked' | 'privateChatLocked' | 'serverDown';

interface UiConfigCardMeta {
  key: UiConfigKey;
  title: string;
  helper: string;
  accent: string;
  icon: 'support' | 'agreement' | 'group' | 'private' | 'server';
}

@Component({
  selector: 'app-agent-user-ui-config',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto w-full max-w-6xl space-y-4 pb-8">
      <section class="rounded-[28px] border border-white/60 bg-[linear-gradient(135deg,#f8fbff_0%,#eef5fb_52%,#e7eef8_100%)] p-4 shadow-[0_18px_52px_rgba(15,23,42,0.08)] sm:p-5">
        <div class="flex flex-col gap-3">
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">User UI Config</p>
            <h1 class="mt-2 text-[28px] leading-[1.02] font-display text-primary">Control what each user can see</h1>
            <p class="mt-2 max-w-3xl text-[14px] leading-6 text-secondary">
              Lock support chat, agreements, group chat, private chat, or block login with one effective config layer. Users still see locked sections, but blurred and blocked.
            </p>
          </div>

          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              (click)="activeTab.set('global')"
              class="inline-flex h-10 items-center rounded-full px-4 text-[13px] font-semibold transition-all"
              [ngClass]="activeTab() === 'global' ? 'bg-primary text-white shadow-[0_12px_24px_rgba(15,39,71,0.16)]' : 'border border-border bg-white/80 text-primary'">
              Global config
            </button>
            <button
              type="button"
              (click)="activeTab.set('user')"
              class="inline-flex h-10 items-center rounded-full px-4 text-[13px] font-semibold transition-all"
              [ngClass]="activeTab() === 'user' ? 'bg-primary text-white shadow-[0_12px_24px_rgba(15,39,71,0.16)]' : 'border border-border bg-white/80 text-primary'">
              User specific
            </button>
          </div>
        </div>
      </section>

      <section *ngIf="activeTab() === 'global'" class="rounded-[28px] border border-border bg-surface p-4 shadow-[0_16px_44px_rgba(15,23,42,0.06)] sm:p-5">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Global config</p>
            <h2 class="mt-2 text-[24px] leading-tight font-display text-primary">Default lock state for all users</h2>
            <p class="mt-1 text-[14px] leading-6 text-secondary">These values apply to everyone unless a user-specific override is set.</p>
          </div>
          <span *ngIf="globalConfig() as global" class="inline-flex self-start rounded-full border border-border bg-surface-2 px-3 py-1 text-[12px] font-medium text-secondary">
            Updated {{ formatDateTime(global.updatedAt) }}
          </span>
        </div>

        <div *ngIf="globalLoading()" class="mt-4 rounded-[24px] border border-border bg-surface-2/70 px-4 py-6 text-[14px] text-secondary">
          Loading global config...
        </div>

        <div *ngIf="!globalLoading() && globalConfig() as global" class="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <article *ngFor="let item of configCards" class="rounded-[24px] border border-border bg-[linear-gradient(180deg,#ffffff,#f8fbff)] p-4 shadow-[0_12px_24px_rgba(15,23,42,0.05)]">
            <div class="flex items-start justify-between gap-3">
              <div class="flex min-w-0 items-start gap-3">
                <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] border border-white/70 bg-white text-primary shadow-sm" [ngClass]="item.accent">
                  <ng-container [ngSwitch]="item.icon">
                    <svg *ngSwitchCase="'support'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    <svg *ngSwitchCase="'agreement'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><path d="M14 2v6h6"></path><path d="M8 13h8"></path><path d="M8 17h8"></path></svg>
                    <svg *ngSwitchCase="'group'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    <svg *ngSwitchCase="'private'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 10h.01"></path><path d="M12 10h.01"></path><path d="M16 10h.01"></path><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    <svg *ngSwitchCase="'server'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"></rect><path d="M8 21h8"></path><path d="M12 17v4"></path><path d="M7 8h10"></path></svg>
                  </ng-container>
                </span>
                <div class="min-w-0">
                  <p class="text-[15px] font-semibold leading-5 text-primary">{{ item.title }}</p>
                  <p class="mt-1 text-[13px] leading-5 text-secondary">{{ item.helper }}</p>
                </div>
              </div>

              <label class="inline-flex shrink-0 cursor-pointer items-center">
                <input
                  type="checkbox"
                  class="peer sr-only"
                  [checked]="readGlobalState(global, item.key)"
                  [disabled]="savingGlobalKey() === item.key"
                  (change)="toggleGlobal(item.key, $event)">
                <span class="relative flex h-8 w-[3.35rem] items-center rounded-full border border-primary/10 bg-slate-200/90 p-1 transition peer-checked:bg-primary peer-disabled:opacity-60">
                  <span class="h-6 w-6 rounded-full bg-white shadow-[0_6px_14px_rgba(15,23,42,0.12)] transition-transform peer-checked:translate-x-[1.35rem]"></span>
                </span>
              </label>
            </div>

            <div class="mt-4 flex items-center justify-between rounded-[18px] border border-border bg-surface-2/70 px-3 py-2.5">
              <span class="text-[12px] font-semibold uppercase tracking-[0.14em]" [ngClass]="readGlobalState(global, item.key) ? 'text-error' : 'text-success'">
                {{ readGlobalState(global, item.key) ? 'Locked' : 'Unlocked' }}
              </span>
              <span class="text-[12px] text-secondary">{{ savingGlobalKey() === item.key ? 'Saving...' : 'Default for all users' }}</span>
            </div>
          </article>
        </div>
      </section>

      <section *ngIf="activeTab() === 'user'" class="rounded-[28px] border border-border bg-surface p-4 shadow-[0_16px_44px_rgba(15,23,42,0.06)] sm:p-5">
        <div class="flex flex-col gap-2">
          <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">User specific config</p>
          <h2 class="text-[24px] leading-tight font-display text-primary">Override one user without changing everyone else</h2>
          <p class="text-[14px] leading-6 text-secondary">Pick a user, then lock, unlock, or reset each section back to the global rule.</p>
        </div>

        <div class="mt-4 rounded-[24px] border border-border bg-[linear-gradient(180deg,#ffffff,#f8fbff)] p-4">
          <label class="text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-400">Select user</label>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange($event)"
            placeholder="Search by name, email, or mobile"
            class="mt-2 h-12 w-full rounded-[18px] border border-border bg-surface px-4 text-[14px] text-primary outline-none transition focus:border-primary/20 focus:ring-2 focus:ring-primary/10" />

          <div class="mt-3 max-h-[18rem] overflow-y-auto rounded-[20px] border border-border bg-surface-2/70 p-2">
              <button
              *ngFor="let user of filteredUsers(); trackBy: trackByUserId"
              type="button"
              (click)="selectUser(user)"
              class="flex w-full items-center justify-between gap-3 rounded-[16px] px-3 py-3 text-left transition"
              [ngClass]="selectedUserId() === userId(user) ? 'bg-primary text-white shadow-[0_12px_24px_rgba(15,39,71,0.12)]' : 'bg-white/80 text-primary hover:bg-white'">
              <div class="min-w-0">
                <p class="truncate text-[14px] font-semibold">{{ displayUserName(user) }}</p>
                <p class="truncate text-[12px]" [ngClass]="selectedUserId() === userId(user) ? 'text-white/70' : 'text-secondary'">{{ user.email }}</p>
              </div>
              <span class="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                [ngClass]="user.profile_complete ? 'bg-success/12 text-success' : 'bg-warning/12 text-warning'">
                {{ user.profile_complete ? 'Ready' : 'Pending' }}
              </span>
            </button>

            <div *ngIf="!filteredUsers().length" class="px-3 py-6 text-center text-[13px] text-secondary">
              No matching users found.
            </div>
          </div>
        </div>

        <ng-container *ngIf="selectedUserConfig() as detail; else selectUserState">
          <section class="mt-4 rounded-[24px] border border-border bg-[linear-gradient(180deg,#ffffff,#f9fbff)] p-4 shadow-[0_12px_24px_rgba(15,23,42,0.04)]">
            <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Selected user</p>
                <h3 class="mt-1 text-[20px] font-semibold leading-tight text-primary">{{ detail.user.fullName || detail.user.email }}</h3>
                <p class="mt-1 text-[13px] text-secondary">{{ detail.user.email }}</p>
              </div>
              <button
                type="button"
                (click)="resetAllOverrides()"
                [disabled]="savingUserKey() === '__all__'"
                class="inline-flex h-10 items-center justify-center rounded-full border border-border bg-surface-2 px-4 text-[12px] font-semibold text-primary transition hover:bg-white disabled:opacity-60">
                {{ savingUserKey() === '__all__' ? 'Resetting...' : 'Reset all to global' }}
              </button>
            </div>
          </section>

          <div class="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <article *ngFor="let item of configCards" class="rounded-[24px] border border-border bg-[linear-gradient(180deg,#ffffff,#f8fbff)] p-4 shadow-[0_12px_24px_rgba(15,23,42,0.05)]">
              <div class="flex items-start gap-3">
                <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] border border-white/70 bg-white text-primary shadow-sm" [ngClass]="item.accent">
                  <ng-container [ngSwitch]="item.icon">
                    <svg *ngSwitchCase="'support'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    <svg *ngSwitchCase="'agreement'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><path d="M14 2v6h6"></path><path d="M8 13h8"></path><path d="M8 17h8"></path></svg>
                    <svg *ngSwitchCase="'group'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    <svg *ngSwitchCase="'private'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 10h.01"></path><path d="M12 10h.01"></path><path d="M16 10h.01"></path><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    <svg *ngSwitchCase="'server'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"></rect><path d="M8 21h8"></path><path d="M12 17v4"></path><path d="M7 8h10"></path></svg>
                  </ng-container>
                </span>
                <div class="min-w-0">
                  <p class="text-[15px] font-semibold leading-5 text-primary">{{ item.title }}</p>
                  <p class="mt-1 text-[13px] leading-5 text-secondary">{{ item.helper }}</p>
                </div>
              </div>

              <div class="mt-4 rounded-[18px] border border-border bg-surface-2/70 px-3 py-2.5">
                <div class="flex items-center justify-between gap-2">
                  <span class="text-[12px] font-semibold uppercase tracking-[0.14em] text-primary/60">Current source</span>
                  <span class="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                    [ngClass]="readOverrideState(detail.override, item.key) === null ? 'bg-primary/10 text-primary' : 'bg-surface border border-border text-secondary'">
                    {{ readOverrideState(detail.override, item.key) === null ? 'Using global' : 'Custom override' }}
                  </span>
                </div>
                <div class="mt-2 flex items-center justify-between gap-2">
                  <span class="text-[13px] text-secondary">Effective state</span>
                  <span class="text-[13px] font-semibold" [ngClass]="readEffectiveState(detail, item.key) ? 'text-error' : 'text-success'">
                    {{ readEffectiveState(detail, item.key) ? 'Locked' : 'Unlocked' }}
                  </span>
                </div>
              </div>

              <div class="mt-3 grid grid-cols-3 gap-2">
                <button
                  type="button"
                  (click)="setUserOverride(item.key, true)"
                  [disabled]="savingUserKey() === item.key"
                  class="inline-flex h-10 items-center justify-center rounded-[16px] border px-2 text-[12px] font-semibold transition"
                  [ngClass]="readOverrideState(detail.override, item.key) === true ? 'border-error/20 bg-error/10 text-error' : 'border-border bg-white text-primary hover:bg-surface-2'">
                  Lock
                </button>
                <button
                  type="button"
                  (click)="setUserOverride(item.key, false)"
                  [disabled]="savingUserKey() === item.key"
                  class="inline-flex h-10 items-center justify-center rounded-[16px] border px-2 text-[12px] font-semibold transition"
                  [ngClass]="readOverrideState(detail.override, item.key) === false ? 'border-success/20 bg-success/10 text-success' : 'border-border bg-white text-primary hover:bg-surface-2'">
                  Unlock
                </button>
                <button
                  type="button"
                  (click)="setUserOverride(item.key, null)"
                  [disabled]="savingUserKey() === item.key"
                  class="inline-flex h-10 items-center justify-center rounded-[16px] border px-2 text-[12px] font-semibold transition"
                  [ngClass]="readOverrideState(detail.override, item.key) === null ? 'border-primary/20 bg-primary/10 text-primary' : 'border-border bg-white text-primary hover:bg-surface-2'">
                  Use global
                </button>
              </div>
            </article>
          </div>
        </ng-container>

        <ng-template #selectUserState>
          <div class="mt-4 rounded-[24px] border border-dashed border-border bg-surface-2/50 px-4 py-8 text-center text-[14px] text-secondary">
            Select one user to edit user-specific visibility and login rules.
          </div>
        </ng-template>
      </section>
    </div>
  `
})
export class AgentUserUiConfigComponent implements OnInit {
  private readonly agentUsersApi = inject(AgentUserApiService);
  private readonly userUiConfigApi = inject(UserUiConfigApiService);
  private readonly notification = inject(NotificationService);

  readonly users = this.agentUsersApi.users;

  readonly activeTab = signal<'global' | 'user'>('global');
  readonly globalLoading = signal<boolean>(false);
  readonly globalConfig = signal<AgentUserUiGlobalConfig | null>(null);
  readonly selectedUserId = signal<string>('');
  readonly selectedUserConfig = signal<AgentUserUiConfigDetail | null>(null);
  readonly savingGlobalKey = signal<UiConfigKey | ''>('');
  readonly savingUserKey = signal<UiConfigKey | '__all__' | ''>('');

  searchQuery = '';

  readonly filteredUsers = computed(() => {
    const query = this.searchQuery.trim().toLowerCase();
    const items = this.users();
    if (!query) {
      return items.slice(0, 24);
    }
    return items.filter((user) => {
      const haystack = [
        user.full_name,
        user.email,
        user.mobile_number
      ].join(' ').toLowerCase();
      return haystack.includes(query);
    }).slice(0, 24);
  });

  readonly configCards: UiConfigCardMeta[] = [
    {
      key: 'supportChatLocked',
      title: 'Chat Support',
      helper: 'Blur and block the direct support conversation.',
      accent: 'text-[#335CFF]',
      icon: 'support'
    },
    {
      key: 'agreementsLocked',
      title: 'Agreements',
      helper: 'Show the agreement entry as locked even if agreement access is enabled.',
      accent: 'text-[#0F6B57]',
      icon: 'agreement'
    },
    {
      key: 'groupChatLocked',
      title: 'Group Chat',
      helper: 'Block the public community feed while still showing the section as locked.',
      accent: 'text-[#5B4BFF]',
      icon: 'group'
    },
    {
      key: 'privateChatLocked',
      title: 'Private Chat',
      helper: 'Hide the conversation flow behind a blurred, locked state.',
      accent: 'text-[#0F3950]',
      icon: 'private'
    },
    {
      key: 'serverDown',
      title: 'Server Busy on Login',
      helper: 'Prevent login and show a server busy message for the affected users.',
      accent: 'text-[#E35B35]',
      icon: 'server'
    }
  ];

  ngOnInit(): void {
    this.globalLoading.set(true);
    this.agentUsersApi.loadUsers(false).subscribe();
    this.userUiConfigApi.getGlobalConfig().subscribe((config) => {
      this.globalConfig.set(config);
      this.globalLoading.set(false);
    });
  }

  onSearchChange(value: string): void {
    this.searchQuery = value;
  }

  selectUser(user: AgentUserSummary): void {
    const userId = String(user.id);
    this.selectedUserId.set(userId);
    this.selectedUserConfig.set(null);
    this.userUiConfigApi.getUserConfig(userId).subscribe((detail) => {
      this.selectedUserConfig.set(detail);
    });
  }

  toggleGlobal(key: UiConfigKey, event: Event): void {
    const target = event.target as HTMLInputElement | null;
    const checked = !!target?.checked;
    this.savingGlobalKey.set(key);
    this.userUiConfigApi.updateGlobalConfig({ [key]: checked }).subscribe((config) => {
      this.savingGlobalKey.set('');
      if (!config) {
        this.notification.error('Could not update global UI config.');
        return;
      }
      this.globalConfig.set(config);
      if (this.selectedUserId()) {
        this.reloadSelectedUserConfig();
      }
    });
  }

  setUserOverride(key: UiConfigKey, value: boolean | null): void {
    if (!this.selectedUserId()) {
      return;
    }
    this.savingUserKey.set(key);
    this.userUiConfigApi.updateUserConfig(this.selectedUserId(), { [key]: value }).subscribe((detail) => {
      this.savingUserKey.set('');
      if (!detail) {
        this.notification.error('Could not update user UI config.');
        return;
      }
      this.selectedUserConfig.set(detail);
      this.globalConfig.set(detail.global);
    });
  }

  resetAllOverrides(): void {
    if (!this.selectedUserId()) {
      return;
    }
    this.savingUserKey.set('__all__');
    this.userUiConfigApi.updateUserConfig(this.selectedUserId(), {
      supportChatLocked: null,
      agreementsLocked: null,
      groupChatLocked: null,
      privateChatLocked: null,
      serverDown: null
    }).subscribe((detail) => {
      this.savingUserKey.set('');
      if (!detail) {
        this.notification.error('Could not reset user UI config.');
        return;
      }
      this.selectedUserConfig.set(detail);
      this.globalConfig.set(detail.global);
    });
  }

  trackByUserId(_index: number, user: AgentUserSummary): string {
    return String(user.id);
  }

  userId(user: AgentUserSummary): string {
    return String(user.id);
  }

  displayUserName(user: AgentUserSummary): string {
    const name = String(user.full_name || '').trim();
    return name || user.email || 'User';
  }

  formatDateTime(value?: string | null): string {
    if (!value) {
      return 'just now';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return 'just now';
    }
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date);
  }

  readGlobalState(config: AgentUserUiGlobalConfig, key: UiConfigKey): boolean {
    return !!config[key];
  }

  readOverrideState(config: AgentUserUiOverrideConfig, key: UiConfigKey): boolean | null {
    return config[key];
  }

  readEffectiveState(detail: AgentUserUiConfigDetail, key: UiConfigKey): boolean {
    return !!detail.effective[key];
  }

  private reloadSelectedUserConfig(): void {
    if (!this.selectedUserId()) {
      return;
    }
    this.userUiConfigApi.getUserConfig(this.selectedUserId()).subscribe((detail) => {
      this.selectedUserConfig.set(detail);
    });
  }
}
