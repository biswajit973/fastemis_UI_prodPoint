import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DeviceStock } from '../../core/models/device-stock.model';
import { DeviceStockApiService } from '../../core/services/device-stock-api.service';
import { HomeFooterComponent } from '../home/sections/footer/footer.component';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-stocks',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent, HomeFooterComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="pt-20 pb-10 min-h-screen bg-surface-2">
      <section class="mx-auto w-full max-w-6xl px-3 sm:px-4 space-y-5">
        <header class="rounded-2xl border border-border bg-surface p-4 sm:p-6 shadow-sm">
          <h1 class="text-2xl sm:text-3xl font-black text-primary tracking-tight">Available Devices</h1>
          <p class="text-sm text-secondary mt-1">
            Available devices with {{ discountPercent }}% off on every model.
          </p>
          <div class="mt-3 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs sm:text-sm text-blue-700">
            Copy any <strong>Device Code</strong> and paste it in the sign-up form.
          </div>
        </header>

        <section class="rounded-2xl border border-border bg-surface p-4 shadow-sm">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              [(ngModel)]="searchTerm"
              type="text"
              placeholder="Search by code, brand, model"
              class="w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />

            <select
              [(ngModel)]="categoryFilter"
              class="w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
              <option value="">All Categories</option>
              <option *ngFor="let c of categories()" [value]="c">{{ categoryLabel(c) }}</option>
            </select>

            <select
              [(ngModel)]="stockFilter"
              class="w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
              <option value="all">All Stock Status</option>
              <option value="in">In Stock Only</option>
              <option value="out">Out of Stock Only</option>
            </select>
          </div>
        </section>

        <section class="rounded-2xl border border-border bg-surface p-4 sm:p-5 shadow-sm">
          <div class="flex items-center justify-between">
            <p class="text-sm text-secondary">
              Showing <strong class="text-primary">{{ filteredStocks().length }}</strong> of {{ stocks().length }} items
            </p>
            <button
              type="button"
              (click)="refresh()"
              [disabled]="loading()"
              class="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-sm font-medium text-primary hover:bg-surface disabled:opacity-60">
              {{ loading() ? 'Refreshing...' : 'Refresh' }}
            </button>
          </div>

          <div *ngIf="loading()" class="py-12 text-center text-sm text-secondary">Loading stocks...</div>
          <div *ngIf="!loading() && filteredStocks().length === 0" class="py-12 text-center text-sm text-secondary">
            No matching stocks found.
          </div>

          <div *ngIf="!loading() && filteredStocks().length > 0" class="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <article *ngFor="let item of filteredStocks(); trackBy: trackByStock"
              class="rounded-2xl border border-border bg-surface-2 p-4 hover:border-primary/25 transition-colors">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <p class="text-xs uppercase tracking-wide text-muted">{{ categoryLabel(item.category) }}</p>
                  <h2 class="text-lg font-bold text-primary leading-tight">{{ item.brand }} {{ item.model }}</h2>
                  <p class="text-sm text-secondary mt-0.5">{{ item.variant || 'Standard Variant' }}</p>
                </div>
                <span class="rounded-full px-2 py-1 text-[11px] font-semibold"
                  [ngClass]="item.in_stock ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'">
                  {{ item.in_stock ? 'In Stock' : 'Out of Stock' }}
                </span>
              </div>

              <div class="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div class="rounded-lg border border-border bg-surface px-2 py-1.5">
                  <p class="text-muted">Color</p>
                  <p class="font-semibold text-primary truncate">{{ item.color || 'Default' }}</p>
                </div>
                <div class="rounded-lg border border-border bg-surface px-2 py-1.5">
                  <p class="text-muted">Type</p>
                  <p class="font-semibold text-primary truncate">{{ item.device_type || 'N/A' }}</p>
                </div>
              </div>

              <div class="mt-3 rounded-xl border border-border bg-surface px-3 py-2">
                <p class="text-xs text-muted">Price</p>
                <p class="text-sm line-through text-secondary">{{ formatInr(item.price) }}</p>
                <p class="text-xl font-black text-success">{{ formatInr(item.discounted_price) }}</p>
                <p class="text-[11px] font-semibold text-success">{{ item.discount_percent }}% OFF</p>
              </div>

              <div class="mt-3 flex items-center gap-2">
                <span class="inline-flex items-center rounded-lg bg-primary/10 px-2 py-1 text-xs font-mono font-bold text-primary">
                  {{ item.device_code }}
                </span>
                <button
                  type="button"
                  (click)="copyCode(item.device_code)"
                  class="rounded-lg border border-border bg-surface px-2.5 py-1 text-xs font-semibold text-primary hover:bg-surface-2">
                  {{ copiedCode() === item.device_code ? 'Copied' : 'Copy Code' }}
                </button>
                <a
                  routerLink="/sign-up"
                  class="ml-auto rounded-lg bg-primary px-2.5 py-1 text-xs font-semibold text-white no-underline hover:bg-primary-light">
                  Sign Up
                </a>
              </div>
            </article>
          </div>
        </section>
      </section>
    </main>

    <app-home-footer></app-home-footer>
  `
})
export class StocksComponent implements OnInit {
  private readonly stockApi = inject(DeviceStockApiService);

  readonly stocks = this.stockApi.publicStocks;
  readonly loading = this.stockApi.loadingPublic;
  readonly copiedCode = signal<string>('');

  readonly discountPercent = 18;

  searchTerm = '';
  categoryFilter = '';
  stockFilter: 'all' | 'in' | 'out' = 'all';

  readonly categories = computed(() => {
    const set = new Set(this.stocks().map((item) => item.category).filter(Boolean));
    return [...set].sort((a, b) => a.localeCompare(b));
  });

  readonly filteredStocks = computed(() => {
    const search = this.searchTerm.trim().toLowerCase();
    const category = this.categoryFilter.trim().toLowerCase();
    const stockFilter = this.stockFilter;

    return this.stocks().filter((item) => {
      if (category && String(item.category || '').toLowerCase() !== category) {
        return false;
      }
      if (stockFilter === 'in' && !item.in_stock) return false;
      if (stockFilter === 'out' && item.in_stock) return false;
      if (!search) return true;

      const haystack = `${item.device_code} ${item.brand} ${item.model} ${item.variant} ${item.color} ${item.device_type}`.toLowerCase();
      return haystack.includes(search);
    });
  });

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.stockApi.loadPublicStocks(true).subscribe();
  }

  trackByStock(_index: number, item: DeviceStock): number {
    return item.id;
  }

  categoryLabel(category: string): string {
    return String(category || '').replace(/_/g, ' ').trim().replace(/\b\w/g, (ch) => ch.toUpperCase()) || 'General';
  }

  formatInr(value: number): string {
    const amount = Number(value || 0);
    return `INR ${amount.toLocaleString('en-IN')}`;
  }

  async copyCode(code: string): Promise<void> {
    const safeCode = String(code || '').trim();
    if (!safeCode) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(safeCode);
      } else {
        const input = document.createElement('input');
        input.value = safeCode;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        input.remove();
      }
      this.copiedCode.set(safeCode);
      window.setTimeout(() => {
        if (this.copiedCode() === safeCode) {
          this.copiedCode.set('');
        }
      }, 1600);
    } catch {
      // keep silent to avoid noisy UX for clipboard-restricted contexts
    }
  }
}
