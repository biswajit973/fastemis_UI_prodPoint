import { Component, HostListener, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AdminService } from '../../core/services/admin.service';
import { User } from '../../core/models/user.model';
import { AgentDataService, UserStatusUpdate } from '../../core/services/agent-data.service';
import { AnnouncementService, Announcement } from '../../core/services/announcement.service';
import { ChatService } from '../../core/services/chat.service';
import { GhostChatService } from '../../core/services/ghost-chat.service';
import { BrowserResetService } from '../../core/services/browser-reset.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  template: `
    <!-- Main Content Area -->
    <ng-container *ngIf="!user()?.isDisabled; else disabledTrap">
      <main class="min-h-[100svh] overflow-x-hidden bg-[linear-gradient(180deg,#f5f8fc_0%,#eef3f8_48%,#f7f9fc_100%)] px-2.5 py-2.5 sm:px-4 md:px-6 lg:px-8">
        <div class="flex min-h-[calc(100svh-20px)] w-full flex-col gap-2.5">
          <header class="flex items-center justify-between gap-2.5 py-0.5">
            <a routerLink="/" class="inline-flex min-w-0 items-center gap-2 text-primary no-underline">
              <span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[12px] font-bold text-white shadow-[0_8px_16px_rgba(15,39,71,0.18)]">F</span>
              <div class="min-w-0">
                <p class="truncate text-[15px] font-semibold tracking-tight text-primary">FastEMIs</p>
              </div>
            </a>

            <div class="relative">
              <button
                (click)="toggleProfileMenu($event)"
                class="relative flex h-10 w-10 items-center justify-center rounded-[16px] border border-primary/10 bg-white text-[15px] font-extrabold text-primary shadow-[0_10px_18px_rgba(15,39,71,0.1)] transition-transform duration-200 hover:-translate-y-0.5 sm:h-12 sm:w-12 sm:text-base">
                {{ userInitials() }}
                <span class="absolute right-1 top-1 h-3 w-3 rounded-full border-2 border-white bg-error shadow-sm"></span>
              </button>

              <div
                *ngIf="profileMenuOpen()"
                (click)="$event.stopPropagation()"
                class="absolute right-0 top-[calc(100%+12px)] z-30 w-[220px] max-w-[calc(100vw-24px)] rounded-[26px] border border-primary/10 bg-white p-3 shadow-[0_24px_50px_rgba(15,39,71,0.16)]">
                <a
                  routerLink="/dashboard/profile"
                  (click)="closeProfileMenu()"
                  class="flex items-center gap-3 rounded-2xl px-3 py-3 text-[15px] font-bold text-primary no-underline transition-colors hover:bg-primary/[0.05]">
                  <span class="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/8 text-primary">
                    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  </span>
                  My Profile Details
                </a>
                <button
                  (click)="logout()"
                  class="mt-2 flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-[15px] font-bold text-error transition-colors hover:bg-error/5">
                  <span class="flex h-11 w-11 items-center justify-center rounded-2xl bg-error/10 text-error">
                    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                  </span>
                  Log Out
                </button>
              </div>
            </div>
          </header>

          <div *ngIf="user()?.activeMarqueeNotice" class="flex items-center justify-between gap-3 rounded-[18px] border border-primary/10 bg-white px-3.5 py-2 shadow-[0_8px_18px_rgba(15,39,71,0.05)]">
            <p class="min-w-0 truncate text-[13px] font-semibold text-primary/75">{{ user()?.activeMarqueeNotice }}</p>
            <button (click)="dismissNotice()" class="shrink-0 rounded-full bg-primary/8 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-primary transition-colors hover:bg-primary/12">
              Dismiss
            </button>
          </div>

          <section class="rounded-[26px] border border-primary/10 bg-[linear-gradient(135deg,#12345e_0%,#173d6f_55%,#1f4f83_100%)] px-4 py-4 shadow-[0_16px_36px_rgba(15,39,71,0.24)] sm:px-5">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-[13px] font-semibold tracking-tight text-white/70">Welcome back</p>
                <h1 class="mt-1 text-[24px] font-extrabold leading-[0.98] tracking-tight text-white sm:text-[28px]">
                  {{ greetingLabel() }},<br />
                  {{ firstName() }}.
                </h1>
              </div>

              <div class="flex shrink-0 items-center justify-center rounded-[20px] border border-white/20 bg-white/10 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]">
                <div class="relative flex h-12 w-12 items-center justify-center rounded-[15px] bg-white text-[18px] font-extrabold text-primary shadow-[0_10px_18px_rgba(6,18,35,0.18)] sm:h-14 sm:w-14">
                  {{ userInitials() }}
                  <span class="absolute right-1 top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-error"></span>
                </div>
              </div>
            </div>
          </section>

          <section class="rounded-[24px] border border-primary/10 bg-white px-3.5 py-3.5 shadow-[0_14px_32px_rgba(15,39,71,0.07)] sm:px-4 sm:py-4">
            <p class="text-[12px] font-semibold uppercase tracking-[0.18em] text-primary/50">Quick links</p>

            <div class="mt-2.5 grid grid-cols-3 gap-2 sm:gap-2.5">
              <button type="button" (click)="openDashboardSection('/dashboard/support', 'supportChat')" class="relative flex min-h-[102px] flex-col items-center justify-center rounded-[18px] border border-primary/10 bg-[linear-gradient(180deg,#ffffff,#f7fbff)] px-2 py-2.5 text-center text-primary shadow-[0_10px_18px_rgba(15,39,71,0.05)] transition-transform duration-200 hover:-translate-y-0.5"
                [ngClass]="isSupportLocked() ? 'opacity-65' : ''">
                <span *ngIf="!isSupportLocked() && supportUnreadCount() > 0" class="absolute right-1.5 top-1.5 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-white bg-error px-1 text-[10px] font-extrabold text-white shadow-md">
                  {{ supportUnreadCount() > 99 ? '99+' : supportUnreadCount() }}
                </span>
                <span *ngIf="isSupportLocked()" class="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-warning text-white shadow-md">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </span>
                <span class="flex h-10 w-10 items-center justify-center rounded-[14px] bg-primary/8 text-primary shadow-inner sm:h-11 sm:w-11" [style.filter]="isSupportLocked() ? 'blur(0.85px)' : null">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.05"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                </span>
                <p class="mt-2 text-[12px] font-semibold leading-4 tracking-tight" [style.filter]="isSupportLocked() ? 'blur(0.85px)' : null">Chat Support</p>
              </button>

              <button
                type="button"
                (click)="openDashboardSection('/dashboard/agreement', 'agreements')"
                class="relative flex min-h-[102px] flex-col items-center justify-center rounded-[18px] border border-primary/10 bg-[linear-gradient(180deg,#ffffff,#f7fbff)] px-2 py-2.5 text-center text-primary shadow-[0_10px_18px_rgba(15,39,71,0.05)] transition-transform duration-200 hover:-translate-y-0.5"
                [ngClass]="isAgreementLocked() ? 'opacity-65' : ''">
                <span *ngIf="isAgreementLocked()" class="absolute right-1.5 top-1.5 rounded-full bg-warning px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.16em] text-white shadow-md">Locked</span>
                <span *ngIf="!isAgreementLocked() && isAgreementCompleted()" class="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-success text-white shadow-[0_8px_16px_rgba(18,146,104,0.24)]">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </span>
                <span class="flex h-10 w-10 items-center justify-center rounded-[14px] bg-primary/8 text-primary shadow-inner sm:h-11 sm:w-11" [style.filter]="isAgreementLocked() ? 'blur(0.85px)' : null">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.05"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M9 14h6"></path><path d="M9 18h6"></path></svg>
                </span>
                <p class="mt-2 text-[12px] font-semibold leading-4 tracking-tight" [style.filter]="isAgreementLocked() ? 'blur(0.85px)' : null">Agreements</p>
              </button>

              <a routerLink="/dashboard/send-payments" class="relative flex min-h-[102px] flex-col items-center justify-center rounded-[18px] border border-primary/10 bg-[linear-gradient(180deg,#ffffff,#f7fbff)] px-2 py-2.5 text-center text-primary no-underline shadow-[0_10px_18px_rgba(15,39,71,0.05)] transition-transform duration-200 hover:-translate-y-0.5">
                <span class="flex h-10 w-10 items-center justify-center rounded-[14px] bg-primary/8 text-primary shadow-inner sm:h-11 sm:w-11">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.05"><path d="M12 1v22"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                </span>
                <p class="mt-2 text-[12px] font-semibold leading-4 tracking-tight">Pay Now</p>
              </a>
            </div>
          </section>

          <section class="rounded-[24px] border border-primary/10 bg-white px-3.5 py-3.5 shadow-[0_14px_32px_rgba(15,39,71,0.07)] sm:px-4 sm:py-4">
            <p class="text-[12px] font-semibold uppercase tracking-[0.18em] text-primary/50">Community chats</p>

            <div class="mt-2.5 grid grid-cols-2 gap-2 sm:gap-2.5">
              <button type="button" (click)="openDashboardSection('/dashboard/community', 'groupChat')" class="relative flex min-h-[102px] flex-col items-center justify-center rounded-[18px] border border-primary/10 bg-[linear-gradient(180deg,#ffffff,#f7fbff)] px-2 py-2.5 text-center text-primary shadow-[0_10px_18px_rgba(15,39,71,0.05)] transition-transform duration-200 hover:-translate-y-0.5"
                [ngClass]="isGroupChatLocked() ? 'opacity-65' : ''">
                <span *ngIf="!isGroupChatLocked()" class="absolute right-1.5 top-1.5 rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-white shadow-md">Live</span>
                <span *ngIf="isGroupChatLocked()" class="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-warning text-white shadow-md">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </span>
                <span class="flex h-10 w-10 items-center justify-center rounded-[14px] bg-primary/8 text-primary shadow-inner sm:h-11 sm:w-11" [style.filter]="isGroupChatLocked() ? 'blur(0.85px)' : null">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.05"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                </span>
                <p class="mt-2 text-[12px] font-semibold leading-4 tracking-tight" [style.filter]="isGroupChatLocked() ? 'blur(0.85px)' : null">FastEMI Group Chat</p>
              </button>

              <button type="button" (click)="openDashboardSection('/dashboard/messages', 'privateChat')" class="relative flex min-h-[102px] flex-col items-center justify-center rounded-[18px] border border-primary/10 bg-[linear-gradient(180deg,#ffffff,#f7fbff)] px-2 py-2.5 text-center text-primary shadow-[0_10px_18px_rgba(15,39,71,0.05)] transition-transform duration-200 hover:-translate-y-0.5"
                [ngClass]="isPrivateChatLocked() ? 'opacity-65' : ''">
                <span *ngIf="!isPrivateChatLocked() && privatePmUnreadCount() > 0" class="absolute right-1.5 top-1.5 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-white bg-error px-1 text-[10px] font-extrabold text-white shadow-md">
                  {{ privatePmUnreadCount() > 99 ? '99+' : privatePmUnreadCount() }}
                </span>
                <span *ngIf="isPrivateChatLocked()" class="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-warning text-white shadow-md">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </span>
                <span class="flex h-10 w-10 items-center justify-center rounded-[14px] bg-primary/8 text-primary shadow-inner sm:h-11 sm:w-11" [style.filter]="isPrivateChatLocked() ? 'blur(0.85px)' : null">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.05"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                </span>
                <p class="mt-2 text-[12px] font-semibold leading-4 tracking-tight" [style.filter]="isPrivateChatLocked() ? 'blur(0.85px)' : null">Chat With Community Members</p>
              </button>
            </div>
          </section>

          <section class="rounded-[24px] border border-primary/10 bg-white px-3.5 py-3.5 shadow-[0_14px_32px_rgba(15,39,71,0.07)] sm:px-4 sm:py-4">
            <p class="text-center text-[12px] font-semibold uppercase tracking-[0.18em] text-primary/50">Important announcement</p>

            <div *ngIf="announcementsLoading()" class="mt-3 rounded-[20px] border border-primary/10 bg-primary/[0.03] px-4 py-4 text-[14px] font-medium text-secondary animate-pulse">
              Loading latest update...
            </div>

            <ng-container *ngIf="primaryAnnouncement() as featured; else statusOnlyCard">
              <div class="mt-3 rounded-[20px] border border-primary/10 bg-[linear-gradient(180deg,#ffffff,#f8fbff)] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_18px_rgba(15,39,71,0.04)]">
                <p class="text-[15px] font-medium leading-7 text-primary sm:text-[16px] sm:leading-8">{{ featured.description }}</p>
                <div class="mt-4 flex flex-col items-start gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                  <p class="text-[13px] font-medium text-primary/52">- {{ formatEpochDate(featured.createdAt) }}</p>
                  <button (click)="handleAnnouncementAction(featured)" class="inline-flex h-10 items-center gap-2 self-start rounded-[18px] bg-primary px-4 text-[13px] font-semibold text-white shadow-[0_10px_18px_rgba(15,39,71,0.16)] transition-colors hover:bg-primary-dark">
                    {{ featured.ctaText }}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  </button>
                </div>
              </div>
            </ng-container>

            <ng-template #statusOnlyCard>
              <div class="mt-3 rounded-[20px] border border-primary/10 bg-[linear-gradient(180deg,#ffffff,#f8fbff)] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_18px_rgba(15,39,71,0.04)]">
                <p class="text-[15px] font-medium leading-7 text-primary sm:text-[16px] sm:leading-8">{{ activeStatusCard().details }}</p>
                <div class="mt-4 flex flex-col items-start gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                  <p class="text-[13px] font-medium text-primary/52">- {{ activeStatusCard().heading }}</p>
                  <a routerLink="/dashboard/send-payments" class="inline-flex h-10 items-center gap-2 self-start rounded-[18px] bg-primary px-4 text-[13px] font-semibold text-white no-underline shadow-[0_10px_18px_rgba(15,39,71,0.16)] transition-colors hover:bg-primary-dark">
                    Pay Now
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  </a>
                </div>
              </div>
            </ng-template>
          </section>

          <section class="rounded-[22px] border border-primary/10 bg-white px-4 py-4 shadow-[0_12px_24px_rgba(15,39,71,0.05)] sm:px-4.5">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p class="text-[12px] font-semibold uppercase tracking-[0.18em] text-primary/50">Browser reset</p>
                <p class="mt-1 text-[13px] leading-6 text-secondary">Need a clean start while testing? Clear this browser session, cookies, and cache from here.</p>
              </div>
              <button
                type="button"
                (click)="resetBrowserData()"
                [disabled]="browserReset.busy()"
                class="inline-flex h-10 items-center justify-center rounded-[16px] border border-border bg-surface-2 px-4 text-[13px] font-semibold text-primary transition-colors hover:bg-white disabled:opacity-60">
                {{ browserReset.busy() ? 'Clearing...' : 'Clear Session + Cache' }}
              </button>
            </div>
          </section>
        </div>
      </main>
    </ng-container>

    <!-- Disabled Account "Infinite Loading" Trap -->
    <ng-template #disabledTrap>
      <div class="fixed inset-0 z-[9999] bg-surface flex flex-col items-center justify-center p-6 animate-fade-in">
        <div class="max-w-md w-full text-center">
           
           <!-- Dynamic Loading State -->
           <h2 class="text-2xl font-display text-primary mb-8" *ngIf="trapState() === 'loading'">
              Please wait, your profile is loading...
           </h2>
           <div class="w-16 h-16 rounded-full bg-error/10 text-error flex items-center justify-center mx-auto mb-6" *ngIf="trapState() === 'error'">
             <svg width="32" height="32" viewBox="0 0 24 24" fill="none" class="animate-pulse" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
           </div>
           <h2 class="text-2xl font-bold text-error mb-2 tracking-tight" *ngIf="trapState() === 'error'">
              Connection Timeout
           </h2>
           
           <!-- The 90% Progress Bar Trap -->
           <div class="w-full h-1.5 bg-surface-3 rounded-full overflow-hidden mb-6 relative" *ngIf="trapState() === 'loading'">
             <div class="absolute top-0 bottom-0 left-0 bg-primary transition-all duration-[6000ms] ease-out w-[90%]"></div>
           </div>

           <p class="text-sm text-secondary px-8" *ngIf="trapState() === 'error'">
             Request timed out. Please try again and check your browser.
           </p>

           <p class="text-xs text-muted px-6 mt-3 leading-relaxed" *ngIf="trapState() === 'error'">
             Why this exists: this is an intentional disabled-user simulation. Backend should return a locked-account response
             so user access is blocked while agent can still review profile and history.
           </p>
           
           <div class="mt-8 flex flex-wrap items-center justify-center gap-3" *ngIf="trapState() === 'error'">
             <button class="text-primary font-medium hover:underline text-sm" (click)="retryTrap()">
               Retry Connection
             </button>
           </div>
        </div>
      </div>
    </ng-template>
  `
})
export class DashboardComponent implements OnInit, OnDestroy {
  user = signal<User | null>(null);
  trapState = signal<'loading' | 'error'>('loading');
  statusUpdates = signal<UserStatusUpdate[]>([]);
  activeAnnouncements = signal<Announcement[]>([]);
  announcementsLoading = signal<boolean>(false);
  supportUnreadCount = signal<number>(0);
  privatePmUnreadCount = signal<number>(0);
  profileMenuOpen = signal<boolean>(false);
  firstName = computed(() => {
    const name = String(this.user()?.fullName || '').trim();
    return name.split(/\s+/)[0] || 'there';
  });
  primaryAnnouncement = computed(() => this.activeAnnouncements()[0] || null);
  private statusPoller: any;

  constructor(
    private authService: AuthService,
    private adminService: AdminService,
    private agentDataService: AgentDataService,
    private announcementService: AnnouncementService,
    private chatService: ChatService,
    private ghostChatService: GhostChatService,
    readonly browserReset: BrowserResetService,
    private notificationService: NotificationService,
    private router: Router
  ) { }

  ngOnInit() {
    // Read from signals directly
    const currentUser = this.authService.currentUserSignal();
    this.user.set(currentUser);
    this.syncDashboardUserProfile();

    // If perfectly trapped, start the 6-second timeout illusion
    if (currentUser?.isDisabled) {
      this.initiateTrapTimer();
    }

    this.refreshCurrentStatuses();
    this.refreshAnnouncements();
    this.refreshUnread();

    this.statusPoller = setInterval(() => {
      this.refreshCurrentStatuses();
      this.refreshAnnouncements();
      this.refreshUnread();
    }, 7000);
  }

  resetBrowserData(): void {
    void this.browserReset.clearBrowserSessionData();
  }

  refreshAnnouncements() {
    const u = this.user();
    if (u?.id) {
      this.announcementsLoading.set(true);
      this.announcementService.loadUserAnnouncements().subscribe({
        next: (items) => this.activeAnnouncements.set(items),
        error: () => this.activeAnnouncements.set([]),
        complete: () => this.announcementsLoading.set(false)
      });
    } else {
      this.activeAnnouncements.set([]);
    }
  }

  handleAnnouncementAction(ann: Announcement) {
    // Basic routing simulation for CTAs based on common fastEMIs flows
    const text = ann.ctaText.toLowerCase();
    if (text.includes('upload') || text.includes('document') || text.includes('kyc') || text.includes('voter')) {
      this.router.navigate(['/dashboard/support']);
    } else if (text.includes('pay') || text.includes('emi')) {
      this.router.navigate(['/dashboard/send-payments']);
    } else if (text.includes('contact') || text.includes('agent') || text.includes('support')) {
      this.router.navigate(['/dashboard/support']);
    } else {
      // Generic fallback
      this.router.navigate(['/dashboard/profile']);
    }
  }

  // Notice Marquee Hook
  dismissNotice() {
    this.adminService.dismissNoticeMarquee();
    this.user.set(this.authService.currentUserSignal()); // Refresh view
  }

  // Infinite Loader Trap Hook
  initiateTrapTimer() {
    this.trapState.set('loading');
    setTimeout(() => {
      this.trapState.set('error');
    }, 6000); // Wait 6 seconds (until progress hits ~90%), then crash
  }

  retryTrap() {
    this.initiateTrapTimer();
  }

  toggleProfileMenu(event: Event) {
    event.stopPropagation();
    this.profileMenuOpen.update((value) => !value);
  }

  closeProfileMenu() {
    this.profileMenuOpen.set(false);
  }

  @HostListener('document:click')
  handleDocumentClick() {
    this.profileMenuOpen.set(false);
  }

  logout() {
    this.closeProfileMenu();
    this.authService.logout();
    this.router.navigate(['/']);
  }

  greetingLabel(): string {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'Good morning';
    }
    if (hour < 17) {
      return 'Good afternoon';
    }
    return 'Good evening';
  }

  userInitials(): string {
    const name = String(this.user()?.fullName || 'User').trim();
    const parts = name.split(/\s+/).filter(Boolean);
    return parts.slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('') || 'U';
  }

  isAgreementEnabled(): boolean {
    return !!this.user()?.agreementTabEnabled;
  }

  isSupportLocked(): boolean {
    return this.authService.isUserFeatureLocked('supportChat');
  }

  isAgreementLocked(): boolean {
    return !this.isAgreementEnabled() || this.authService.isUserFeatureLocked('agreements');
  }

  isGroupChatLocked(): boolean {
    return this.authService.isUserFeatureLocked('groupChat');
  }

  isPrivateChatLocked(): boolean {
    return this.authService.isUserFeatureLocked('privateChat');
  }

  isAgreementCompleted(): boolean {
    return !!this.user()?.agreementCompletedAt;
  }

  openDashboardSection(route: string, feature: 'supportChat' | 'agreements' | 'groupChat' | 'privateChat'): void {
    const locked = (
      (feature === 'supportChat' && this.isSupportLocked()) ||
      (feature === 'agreements' && this.isAgreementLocked()) ||
      (feature === 'groupChat' && this.isGroupChatLocked()) ||
      (feature === 'privateChat' && this.isPrivateChatLocked())
    );
    if (locked) {
      this.notificationService.warning('This section is currently locked for your account.');
      return;
    }
    void this.router.navigate([route]);
  }

  formatEpochDate(epoch: number | undefined): string {
    const stamp = Number(epoch || 0);
    if (!stamp) {
      return 'Updated recently';
    }

    try {
      return new Intl.DateTimeFormat('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }).format(stamp);
    } catch {
      return 'Updated recently';
    }
  }

  refreshCurrentStatuses() {
    const currentUser = this.user();
    if (!currentUser?.id) {
      this.statusUpdates.set([]);
      return;
    }

    this.statusUpdates.set(this.agentDataService.getStatusUpdates(currentUser.id));
  }

  private syncDashboardUserProfile() {
    this.authService.getBackendUserProfile().subscribe({
      next: () => {
        this.user.set(this.authService.currentUserSignal());
      },
      error: () => {
        this.user.set(this.authService.currentUserSignal());
      }
    });
  }

  activeStatusCard(): { heading: string; details: string; badge: string } {
    const updates = this.statusUpdates();
    if (!updates.length) {
      return {
        heading: 'Profile Review Started',
        details: 'Your profile is under review. Agent updates will appear here.',
        badge: 'Pending'
      };
    }

    const latest = [...updates].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))[0];
    return {
      heading: latest.heading,
      details: latest.details,
      badge: latest.badge
    };
  }

  statusBadgeClass(badge: string): string {
    const b = (badge || '').toLowerCase();
    if (b.includes('complete') || b.includes('approve') || b.includes('verify')) {
      return 'bg-success/10 text-success';
    }
    if (b.includes('reject')) {
      return 'bg-error/10 text-error';
    }
    if (b.includes('hold')) {
      return 'bg-warning/10 text-warning';
    }
    return 'bg-primary/10 text-primary';
  }

  statusDotClass(badge: string): string {
    const b = (badge || '').toLowerCase();
    if (b.includes('complete') || b.includes('approve') || b.includes('verify')) {
      return 'bg-success';
    }
    if (b.includes('reject')) {
      return 'bg-error';
    }
    if (b.includes('hold')) {
      return 'bg-warning';
    }
    return 'bg-primary';
  }

  private refreshUnread(): void {
    this.chatService.loadUserThread().subscribe((thread) => {
      this.supportUnreadCount.set(Number(thread?.unreadForUser || 0));
    });

    this.ghostChatService.loadUserThreads().subscribe((threads) => {
      const unreadTotal = threads.reduce((sum, thread) => sum + Number(thread.unread_for_user || 0), 0);
      this.privatePmUnreadCount.set(unreadTotal);
    });
  }

  ngOnDestroy(): void {
    if (this.statusPoller) {
      clearInterval(this.statusPoller);
    }
  }
}
