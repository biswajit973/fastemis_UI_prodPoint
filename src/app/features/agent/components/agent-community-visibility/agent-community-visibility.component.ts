import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AgentUserSummary } from '../../../../core/models/agent-user.model';
import { AgentUserApiService } from '../../../../core/services/agent-user-api.service';
import { CommunityVisibilityApiService } from '../../../../core/services/community-visibility-api.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-agent-community-visibility',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto w-full max-w-7xl px-3 pb-10 sm:px-5 lg:px-8">
      <section class="rounded-[28px] border border-white/60 bg-[linear-gradient(135deg,#f8fbff_0%,#eef5fb_52%,#e7eef8_100%)] p-4 shadow-[0_18px_52px_rgba(15,23,42,0.08)] sm:p-5">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="min-w-0">
            <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Community Visibility</p>
            <div class="mt-2 flex flex-wrap items-center gap-2">
              <h1 class="text-[24px] leading-none font-display text-primary sm:text-[26px]">User Visibility</h1>
              <span class="inline-flex rounded-full border border-border bg-white/85 px-3 py-1 text-[12px] font-medium text-secondary">
                {{ users().length }} users
              </span>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <button
              type="button"
              (click)="refreshUsers()"
              [disabled]="usersLoading()"
              class="inline-flex h-10 items-center justify-center rounded-full border border-border bg-white/85 px-4 text-[13px] font-semibold text-primary shadow-sm transition hover:bg-white disabled:opacity-60">
              {{ usersLoading() ? 'Refreshing...' : 'Refresh' }}
            </button>
            <a
              routerLink="/agent/chats-home"
              class="inline-flex h-10 items-center justify-center rounded-full border border-border bg-white/85 px-4 text-[13px] font-semibold text-primary no-underline shadow-sm transition hover:bg-white">
              Back to Chats Home
            </a>
          </div>
        </div>
      </section>

      <section class="mt-4 rounded-[28px] border border-border bg-surface p-3 shadow-[0_16px_44px_rgba(15,23,42,0.06)] sm:p-4">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex min-w-0 flex-wrap items-center gap-2">
            <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">User list</p>
            <span class="inline-flex rounded-full border border-border bg-surface-2 px-2.5 py-0.5 text-[11px] font-medium text-secondary">
              {{ filteredUsers().length }} rows
            </span>
          </div>

          <div class="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[20rem] sm:flex-row">
            <input
              type="text"
              [ngModel]="searchQuery()"
              (ngModelChange)="searchQuery.set(($event || '').toString())"
              placeholder="Search by name, email, or mobile"
              class="h-10 min-w-0 flex-1 rounded-[16px] border border-border bg-surface px-3 text-[13px] text-primary outline-none transition focus:border-primary/20 focus:ring-2 focus:ring-primary/10 sm:min-w-[18rem]" />
            <button
              *ngIf="searchQuery().trim()"
              type="button"
              (click)="searchQuery.set('')"
              class="inline-flex h-10 items-center justify-center rounded-[16px] border border-border bg-white px-4 text-[12px] font-semibold text-primary transition hover:bg-surface-2">
              Clear
            </button>
          </div>
        </div>

        <div class="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-secondary">
          <span class="inline-flex rounded-full border border-border bg-surface-2 px-3 py-1">
            {{ users().length }} total users loaded
          </span>
          <span *ngIf="filteredUsers().length !== users().length" class="inline-flex rounded-full border border-border bg-surface-2 px-3 py-1">
            {{ filteredUsers().length }} match current search
          </span>
        </div>

        <div *ngIf="usersLoading() && !users().length" class="mt-3 rounded-[20px] border border-border bg-surface-2/70 px-4 py-8 text-center text-[13px] text-secondary">
          Loading users...
        </div>

        <div *ngIf="!usersLoading() && !filteredUsers().length" class="mt-3 rounded-[20px] border border-dashed border-border bg-surface-2/50 px-4 py-8 text-center">
          <p class="text-[15px] font-semibold text-primary">No users found</p>
          <p class="mt-1 text-[13px] leading-6 text-secondary">Try clearing the search box or refresh the user list.</p>
        </div>

        <div *ngIf="filteredUsers().length" class="mt-3 overflow-hidden rounded-[20px] border border-border">
          <div class="max-h-[72vh] overflow-auto">
            <table class="min-w-[18rem] w-full border-collapse">
              <thead class="sticky top-0 z-10 bg-surface-2/95 backdrop-blur">
                <tr>
                  <th class="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">User</th>
                  <th class="px-3 py-2.5 text-right text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Toggle</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let user of filteredUsers(); trackBy: trackByUserId" class="border-t border-border bg-white/70">
                  <td class="px-3 py-2.5 align-middle">
                    <div class="min-w-0">
                      <p class="truncate text-[13px] font-semibold text-primary">{{ displayUserName(user) }}</p>
                      <p class="truncate text-[10px] text-secondary">{{ user.mobile_number || 'No mobile' }}</p>
                    </div>
                  </td>
                  <td class="px-3 py-2.5 align-middle text-right">
                    <label class="inline-flex cursor-pointer items-center gap-2">
                      <span class="text-[10px] font-medium text-secondary">{{ savingUserId() === userId(user) ? 'Saving' : (isVisibleToAll(user) ? 'On' : 'Off') }}</span>
                      <input
                        type="checkbox"
                        class="peer sr-only"
                        [checked]="isVisibleToAll(user)"
                        [disabled]="savingUserId() === userId(user)"
                        (change)="toggleVisibility(user, $event)" />
                      <span class="relative flex h-7 w-[3rem] items-center rounded-full border border-primary/10 bg-slate-200/90 p-1 transition peer-checked:bg-primary peer-disabled:opacity-60">
                        <span class="h-5 w-5 rounded-full bg-white shadow-[0_4px_10px_rgba(15,23,42,0.12)] transition-transform peer-checked:translate-x-[1.1rem]"></span>
                      </span>
                    </label>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  `
})
export class AgentCommunityVisibilityComponent implements OnInit {
  private readonly agentUsersApi = inject(AgentUserApiService);
  private readonly communityVisibilityApi = inject(CommunityVisibilityApiService);
  private readonly notification = inject(NotificationService);

  readonly users = this.agentUsersApi.users;
  readonly usersLoading = this.agentUsersApi.loading;
  readonly searchQuery = signal<string>('');
  readonly savingUserId = signal<string>('');
  readonly visibilityOverrides = signal<Record<string, boolean>>({});

  readonly filteredUsers = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const items = this.users();
    if (!query) {
      return items;
    }
    return items.filter((user) => {
      const haystack = [user.full_name, user.email, user.mobile_number].join(' ').toLowerCase();
      return haystack.includes(query);
    });
  });

  ngOnInit(): void {
    this.refreshUsers();
  }

  refreshUsers(): void {
    this.agentUsersApi.loadUsers(true).subscribe({
      next: (users) => {
        if (!users.length) {
          this.notification.warning('No users loaded. Check the applicants list if you expected users here.');
        }
      }
    });
  }

  toggleVisibility(user: AgentUserSummary, event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const userId = this.userId(user);
    const previous = this.isVisibleToAll(user);
    const nextVisibleToAll = !!input?.checked;

    if (!userId || this.savingUserId() === userId || previous === nextVisibleToAll) {
      return;
    }

    this.savingUserId.set(userId);
    this.visibilityOverrides.update((current) => ({
      ...current,
      [userId]: nextVisibleToAll
    }));

    this.communityVisibilityApi.updateUserConfig(userId, nextVisibleToAll).subscribe({
      next: (detail) => {
        this.savingUserId.set('');
        if (!detail) {
          this.revertVisibilityOverride(userId, previous);
          this.notification.error('Unable to update community visibility right now.');
          return;
        }

        this.visibilityOverrides.update((current) => ({
          ...current,
          [userId]: detail.config.visibleToRealUsers
        }));
        this.agentUsersApi.loadUsers(true).subscribe();
        this.notification.success(
          detail.config.visibleToRealUsers
            ? 'This user is now visible to all community users.'
            : 'This user is now visible only to self and agents in community chat.'
        );
      },
      error: () => {
        this.savingUserId.set('');
        this.revertVisibilityOverride(userId, previous);
        this.notification.error('Unable to update community visibility right now.');
      }
    });
  }

  isVisibleToAll(user: AgentUserSummary): boolean {
    const userId = this.userId(user);
    const override = this.visibilityOverrides()[userId];
    if (typeof override === 'boolean') {
      return override;
    }
    return !user.community_posts_agent_only;
  }

  revertVisibilityOverride(userId: string, fallbackVisibleToAll: boolean): void {
    this.visibilityOverrides.update((current) => ({
      ...current,
      [userId]: fallbackVisibleToAll
    }));
  }

  trackByUserId = (_index: number, user: AgentUserSummary): string => this.userId(user);

  userId(user: AgentUserSummary): string {
    return String(user.id || '').trim();
  }

  displayUserName(user: AgentUserSummary): string {
    return String(user.full_name || '').trim() || String(user.email || '').trim() || `User ${this.userId(user)}`;
  }
}
