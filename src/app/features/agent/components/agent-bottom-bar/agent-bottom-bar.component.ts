import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

interface AgentBottomItem {
  label: string;
  route: string;
  icon: 'home' | 'chat' | 'wallet' | 'file';
  exactRoutes: string[];
  prefixRoutes: string[];
}

@Component({
  selector: 'app-agent-bottom-bar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="md:hidden fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-3 right-3 z-40 rounded-[28px] border border-white/50 bg-surface/88 px-2 py-2 backdrop-blur-2xl shadow-[0_14px_40px_rgba(15,23,42,0.16)]">
      <div class="grid grid-cols-4 gap-1.5">
        <a
          *ngFor="let item of items"
          [routerLink]="item.route"
          class="group flex min-h-[58px] flex-col items-center justify-center rounded-[22px] px-1.5 py-2 text-secondary no-underline transition-all duration-200 active:scale-[0.98]"
          [ngClass]="isActive(item) ? 'bg-primary text-white shadow-[0_10px_20px_rgba(15,38,75,0.2)]' : 'bg-surface-2/70'">
          <span class="flex h-8 w-8 items-center justify-center rounded-2xl border border-white/60 bg-white/80 shadow-sm transition-colors">
            <ng-container [ngSwitch]="item.icon">
              <svg *ngSwitchCase="'home'" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 11.5 12 4l9 7.5"></path>
                <path d="M5 10.5V20h14v-9.5"></path>
              </svg>
              <svg *ngSwitchCase="'chat'" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <svg *ngSwitchCase="'wallet'" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"></path>
                <path d="M16 12h.01"></path>
                <path d="M3 9h18"></path>
              </svg>
              <svg *ngSwitchCase="'file'" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <path d="M14 2v6h6"></path>
                <path d="M16 13H8"></path>
                <path d="M16 17H8"></path>
                <path d="M10 9H8"></path>
              </svg>
            </ng-container>
          </span>
          <span class="mt-1.5 max-w-[4.5rem] text-center text-[10px] font-semibold leading-[1.05] tracking-tight">{{ item.label }}</span>
        </a>
      </div>
    </nav>
  `
})
export class AgentBottomBarComponent {
  private readonly router = inject(Router);

  readonly items: AgentBottomItem[] = [
    {
      label: 'Home',
      route: '/agent',
      icon: 'home',
      exactRoutes: ['/agent'],
      prefixRoutes: ['/agent/applicants', '/agent/applications']
    },
    {
      label: 'Chats Home',
      route: '/agent/chats-home',
      icon: 'chat',
      exactRoutes: ['/agent/chats-home'],
      prefixRoutes: ['/agent/support-chats', '/agent/chats', '/agent/community', '/agent/announcements', '/agent/ghost-setup']
    },
    {
      label: 'Payment Home',
      route: '/agent/payments',
      icon: 'wallet',
      exactRoutes: ['/agent/payments'],
      prefixRoutes: []
    },
    {
      label: 'Agreements Home',
      route: '/agent/agreements',
      icon: 'file',
      exactRoutes: ['/agent/agreements'],
      prefixRoutes: []
    }
  ];

  isActive(item: AgentBottomItem): boolean {
    const currentPath = this.router.url.split('?')[0].replace(/\/+$/, '') || '/';
    if (item.exactRoutes.includes(currentPath)) {
      return true;
    }
    return item.prefixRoutes.some((prefix) => currentPath === prefix || currentPath.startsWith(`${prefix}/`));
  }
}
