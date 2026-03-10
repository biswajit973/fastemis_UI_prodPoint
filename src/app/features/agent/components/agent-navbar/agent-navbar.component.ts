import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-agent-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <!-- Single Unified Top Nav -->
    <nav class="h-16 border-b border-white/70 bg-surface/92 px-3 sm:px-6 fixed top-0 left-0 right-0 z-40 backdrop-blur-xl shadow-[0_8px_32px_rgba(15,23,42,0.06)] flex items-center justify-between">
      
      <!-- Brand & Desktop Links -->
      <div class="flex items-center gap-4 sm:gap-6 h-full">
        <a routerLink="/agent" class="flex items-center gap-2.5 text-primary no-underline shrink-0">
          <span class="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary text-white shadow-sm ring-1 ring-primary/10">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </span>
          <span class="flex flex-col leading-none">
            <span class="text-[15px] sm:text-lg font-semibold tracking-tight text-primary">FastEMIs</span>
            <span class="text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-secondary">Partners</span>
          </span>
        </a>

        <!-- Desktop Navigation Items -->
        <div class="hidden lg:flex items-center gap-1 h-full font-medium text-sm text-secondary">
          
          <a routerLink="/agent" routerLinkActive="text-purple-600 bg-purple-50/50" [routerLinkActiveOptions]="{exact: true}"
             class="px-4 h-full flex items-center hover:text-purple-600 hover:bg-surface-2 transition-colors border-b-2 border-transparent"
             [ngClass]="{'border-purple-600 text-purple-600': isRouteActive('/agent', true)}">
            Home
          </a>

          <a routerLink="/agent/applicants" routerLinkActive="text-purple-600 bg-purple-50/50"
             class="px-4 h-full flex items-center hover:text-purple-600 hover:bg-surface-2 transition-colors border-b-2 border-transparent"
             [ngClass]="{'border-purple-600 text-purple-600': isRouteActive('/agent/applicants')}">
            Applicants
          </a>

          <a routerLink="/agent/support-chats" routerLinkActive="text-purple-600 bg-purple-50/50"
             class="px-4 h-full flex items-center hover:text-purple-600 hover:bg-surface-2 transition-colors border-b-2 border-transparent"
             [ngClass]="{'border-purple-600 text-purple-600': isRouteActive('/agent/support-chats')}">
            Support Chats
          </a>

          <a routerLink="/agent/community" routerLinkActive="text-purple-600 bg-purple-50/50"
             class="px-4 h-full flex items-center hover:text-purple-600 hover:bg-surface-2 transition-colors border-b-2 border-transparent"
             [ngClass]="{'border-purple-600 text-purple-600': isRouteActive('/agent/community')}">
            Community Chat
          </a>

          <a routerLink="/agent/announcements" routerLinkActive="text-purple-600 bg-purple-50/50"
             class="px-4 h-full flex items-center hover:text-purple-600 hover:bg-surface-2 transition-colors border-b-2 border-transparent"
             [ngClass]="{'border-purple-600 text-purple-600': isRouteActive('/agent/announcements')}">
            Announcements
          </a>

          <a routerLink="/agent/stocks" routerLinkActive="text-purple-600 bg-purple-50/50"
             class="px-4 h-full flex items-center hover:text-purple-600 hover:bg-surface-2 transition-colors border-b-2 border-transparent"
             [ngClass]="{'border-purple-600 text-purple-600': isRouteActive('/agent/stocks')}">
            Device Stocks
          </a>

          <a routerLink="/agent/ui-config" routerLinkActive="text-purple-600 bg-purple-50/50"
             class="px-4 h-full flex items-center hover:text-purple-600 hover:bg-surface-2 transition-colors border-b-2 border-transparent"
             [ngClass]="{'border-purple-600 text-purple-600': isRouteActive('/agent/ui-config')}">
            User UI Config
          </a>

          <!-- Dropdown: Ghost -->
          <div class="relative h-full top-nav-dropdown-wrapper" (mouseenter)="activeDropdown = 'ghost'" (mouseleave)="activeDropdown = null">
            <button class="px-4 h-full flex items-center gap-1.5 hover:text-purple-600 hover:bg-surface-2 transition-colors border-b-2 border-transparent"
                    [ngClass]="{'border-purple-600 text-purple-600': isRouteActive('/agent/chats') || isRouteActive('/agent/ghost-setup')}">
              Ghost
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
            <div *ngIf="activeDropdown === 'ghost'" class="absolute left-0 top-full mt-0 w-48 bg-surface border border-border shadow-md rounded-b-xl overflow-hidden animate-fade-in" style="animation-duration: 150ms;">
              <a routerLink="/agent/chats" class="block px-4 py-3 text-sm hover:bg-surface-2 hover:text-purple-600 transition-colors">Ghost Chat</a>
              <a routerLink="/agent/ghost-setup" class="block px-4 py-3 text-sm hover:bg-surface-2 hover:text-purple-600 transition-colors">Ghost Config</a>
            </div>
          </div>

          <!-- Dropdown: Payments -->
          <div class="relative h-full top-nav-dropdown-wrapper" (mouseenter)="activeDropdown = 'payments'" (mouseleave)="activeDropdown = null">
            <button class="px-4 h-full flex items-center gap-1.5 hover:text-purple-600 hover:bg-surface-2 transition-colors border-b-2 border-transparent"
                    [ngClass]="{'border-purple-600 text-purple-600': isRouteActive('/agent/payments')}">
              Payments
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
            <div *ngIf="activeDropdown === 'payments'" class="absolute left-0 top-full mt-0 w-56 bg-surface border border-border shadow-md rounded-b-xl overflow-hidden animate-fade-in" style="animation-duration: 150ms;">
              <a routerLink="/agent/payments" class="block px-4 py-3 text-sm hover:bg-surface-2 hover:text-purple-600 transition-colors">Payment Home</a>
              <a routerLink="/agent/payments" [queryParams]="{tab: 'global'}" class="block px-4 py-3 text-sm hover:bg-surface-2 hover:text-purple-600 transition-colors">Global Payment Settings</a>
              <a routerLink="/agent/payments" [queryParams]="{tab: 'templates'}" class="block px-4 py-3 text-sm hover:bg-surface-2 hover:text-purple-600 transition-colors">Templates</a>
              <a routerLink="/agent/payments" [queryParams]="{tab: 'transactions'}" class="block px-4 py-3 text-sm hover:bg-surface-2 hover:text-purple-600 transition-colors">User Transactions</a>
              <a routerLink="/agent/payments" [queryParams]="{tab: 'user-config'}" class="block px-4 py-3 text-sm hover:bg-surface-2 hover:text-purple-600 transition-colors">User Payment Settings</a>
              <a routerLink="/agent/payments" [queryParams]="{tab: 'logs'}" class="block px-4 py-3 text-sm hover:bg-surface-2 hover:text-purple-600 transition-colors">Display Logs</a>
            </div>
          </div>

          <!-- Dropdown: Agreements -->
          <div class="relative h-full top-nav-dropdown-wrapper" (mouseenter)="activeDropdown = 'agreements'" (mouseleave)="activeDropdown = null">
            <button class="px-4 h-full flex items-center gap-1.5 hover:text-purple-600 hover:bg-surface-2 transition-colors border-b-2 border-transparent"
                    [ngClass]="{'border-purple-600 text-purple-600': isRouteActive('/agent/agreements')}">
              Agreements
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
            <div *ngIf="activeDropdown === 'agreements'" class="absolute left-0 top-full mt-0 w-48 bg-surface border border-border shadow-md rounded-b-xl overflow-hidden animate-fade-in" style="animation-duration: 150ms;">
              <a routerLink="/agent/agreements" class="block px-4 py-3 text-sm hover:bg-surface-2 hover:text-purple-600 transition-colors">Agreement Control</a>
            </div>
          </div>

        </div>
      </div>

      <!-- Mobile Hamburger & Profile -->
      <div class="flex items-center gap-3 relative">
        <!-- Mobile Menu Toggle -->
        <button (click)="toggleMobileMenu()" class="lg:hidden flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-white/80 text-secondary shadow-sm transition-colors hover:text-primary hover:bg-white">
          <svg *ngIf="!mobileMenuOpen" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          <svg *ngIf="mobileMenuOpen" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <!-- Profile Widget -->
        <button
          (click)="toggleProfileMenu()"
          class="flex items-center gap-2 rounded-full border border-border bg-white/80 p-1 pr-1.5 shadow-sm transition-colors hover:bg-white">
          <div class="hidden sm:block text-right mr-1">
            <div class="text-xs font-bold leading-tight text-primary">{{ auth.currentUserSignal()?.fullName || 'Agent' }}</div>
          </div>
          <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm border bg-surface-2 text-primary border-border">
            {{ getInitials() }}
          </div>
        </button>

        <!-- Profile Dropdown -->
        <div
          *ngIf="profileMenuOpen"
          class="absolute right-0 top-full mt-2 w-48 bg-surface border border-border rounded-xl shadow-lg z-50 overflow-hidden animate-fade-in" style="animation-duration: 150ms;">
          <div class="block sm:hidden px-4 py-3 border-b border-border bg-surface-2">
            <div class="text-sm font-bold text-primary">{{ auth.currentUserSignal()?.fullName || 'Verification Desk' }}</div>
            <div class="text-xs text-secondary mt-0.5">{{ auth.currentUserSignal()?.id }}</div>
          </div>
          
          <a routerLink="/" (click)="closeMenus()" class="block px-4 py-3 text-sm text-primary hover:bg-surface-2 no-underline transition-colors border-b border-border">
            Public Home
          </a>
          <button
            (click)="logout()"
            class="w-full text-left px-4 py-3 text-sm text-error hover:bg-error/5 transition-colors font-medium">
            Sign Out
          </button>
        </div>
      </div>
    </nav>

    <!-- Mobile Dropdown Menu Drawer -->
    <div *ngIf="mobileMenuOpen" class="lg:hidden fixed top-16 left-0 right-0 bottom-0 bg-surface/96 z-30 overflow-y-auto border-t border-border animate-fade-in backdrop-blur-xl" style="animation-duration: 200ms;">
      <nav class="flex flex-col p-4 space-y-2 text-sm font-medium">
        <a routerLink="/agent" (click)="closeMenus()" class="px-4 py-3 rounded-2xl border border-border bg-white/70 text-secondary hover:text-purple-600">Home</a>
        <a routerLink="/agent/applicants" (click)="closeMenus()" class="px-4 py-3 rounded-2xl border border-border bg-white/70 text-secondary hover:text-purple-600">Applicants</a>
        <a routerLink="/agent/chats-home" (click)="closeMenus()" class="px-4 py-3 rounded-2xl border border-border bg-white/70 text-secondary hover:text-purple-600">Chats Home</a>
        <a routerLink="/agent/support-chats" (click)="closeMenus()" class="px-4 py-3 rounded-2xl border border-border bg-white/70 text-secondary hover:text-purple-600">Support Chats</a>
        <a routerLink="/agent/community" (click)="closeMenus()" class="px-4 py-3 rounded-2xl border border-border bg-white/70 text-secondary hover:text-purple-600">Community Chat</a>
        <a routerLink="/agent/announcements" (click)="closeMenus()" class="px-4 py-3 rounded-2xl border border-border bg-white/70 text-secondary hover:text-purple-600">Announcements</a>
        <a routerLink="/agent/stocks" (click)="closeMenus()" class="px-4 py-3 rounded-2xl border border-border bg-white/70 text-secondary hover:text-purple-600">Device Stocks</a>
        <a routerLink="/agent/ui-config" (click)="closeMenus()" class="px-4 py-3 rounded-2xl border border-border bg-white/70 text-secondary hover:text-purple-600">User UI Config</a>
        
        <div class="bg-surface-2 rounded-[22px] p-2 mt-4">
          <div class="px-2 py-2 text-xs font-bold text-muted uppercase tracking-wider">Ghost</div>
          <a routerLink="/agent/chats" (click)="closeMenus()" class="block px-3 py-2.5 rounded hover:bg-surface text-secondary hover:text-purple-600">1) Ghost Chat</a>
          <a routerLink="/agent/ghost-setup" (click)="closeMenus()" class="block px-3 py-2.5 rounded hover:bg-surface text-secondary hover:text-purple-600">2) Ghost Config</a>
        </div>

        <div class="bg-surface-2 rounded-[22px] p-2 mt-2">
          <div class="px-2 py-2 text-xs font-bold text-muted uppercase tracking-wider">Payments</div>
          <a routerLink="/agent/payments" (click)="closeMenus()" class="block px-3 py-2.5 rounded hover:bg-surface text-secondary hover:text-purple-600">1) Payment Home</a>
          <a routerLink="/agent/payments" [queryParams]="{tab: 'global'}" (click)="closeMenus()" class="block px-3 py-2.5 rounded hover:bg-surface text-secondary hover:text-purple-600">2) Global Payment Settings</a>
          <a routerLink="/agent/payments" [queryParams]="{tab: 'templates'}" (click)="closeMenus()" class="block px-3 py-2.5 rounded hover:bg-surface text-secondary hover:text-purple-600">3) Templates</a>
          <a routerLink="/agent/payments" [queryParams]="{tab: 'transactions'}" (click)="closeMenus()" class="block px-3 py-2.5 rounded hover:bg-surface text-secondary hover:text-purple-600">4) User Transactions</a>
          <a routerLink="/agent/payments" [queryParams]="{tab: 'user-config'}" (click)="closeMenus()" class="block px-3 py-2.5 rounded hover:bg-surface text-secondary hover:text-purple-600">5) User Payment Settings</a>
          <a routerLink="/agent/payments" [queryParams]="{tab: 'logs'}" (click)="closeMenus()" class="block px-3 py-2.5 rounded hover:bg-surface text-secondary hover:text-purple-600">6) Display Logs</a>
        </div>

        <div class="bg-surface-2 rounded-[22px] p-2 mt-2 mb-8">
          <div class="px-2 py-2 text-xs font-bold text-muted uppercase tracking-wider">Agreements</div>
          <a routerLink="/agent/agreements" (click)="closeMenus()" class="block px-3 py-2.5 rounded hover:bg-surface text-secondary hover:text-purple-600">Agreement Control</a>
        </div>
      </nav>
    </div>
  `
})
export class AgentNavbarComponent {
  profileMenuOpen = false;
  mobileMenuOpen = false;
  activeDropdown: 'ghost' | 'payments' | 'agreements' | null = null;

  constructor(
    public auth: AuthService,
    private router: Router
  ) { }

  getInitials(): string {
    const user = this.auth.currentUserSignal();
    if (!user || !user.fullName) return 'A';
    return user.fullName.charAt(0).toUpperCase();
  }

  toggleProfileMenu() {
    this.profileMenuOpen = !this.profileMenuOpen;
    if (this.profileMenuOpen) this.mobileMenuOpen = false;
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    if (this.mobileMenuOpen) this.profileMenuOpen = false;
  }

  closeMenus() {
    this.profileMenuOpen = false;
    this.mobileMenuOpen = false;
    this.activeDropdown = null;
  }

  isRouteActive(url: string, exact: boolean = false): boolean {
    return this.router.isActive(url, {
      paths: exact ? 'exact' : 'subset',
      queryParams: 'ignored',
      fragment: 'ignored',
      matrixParams: 'ignored'
    });
  }

  logout() {
    this.auth.logout();
    this.closeMenus();
    this.router.navigate(['/']);
  }
}
