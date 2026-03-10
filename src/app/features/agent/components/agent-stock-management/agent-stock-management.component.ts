import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DeviceStock } from '../../../../core/models/device-stock.model';
import { DeviceStockApiService } from '../../../../core/services/device-stock-api.service';

type StockFilter = 'all' | 'active' | 'inactive';
type StockWorkspace = 'home' | 'inventory' | 'form';

@Component({
  selector: 'app-agent-stock-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mx-auto max-w-7xl px-2 sm:px-4 pb-10">
      <div class="space-y-4 sm:space-y-5">
        <header class="rounded-[28px] border border-border bg-surface px-4 py-4 shadow-sm sm:px-5 sm:py-5">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted">Device Stock Home</p>
              <h1 class="mt-1 text-[1.9rem] leading-none text-primary sm:text-[2.1rem]">Manage device inventory</h1>
              <p class="mt-2 max-w-2xl text-[14px] leading-6 text-secondary sm:text-[15px]">
                Keep the stock list clean, add new models fast, and jump into editing without losing context on mobile.
              </p>
            </div>

            <button
              type="button"
              (click)="refresh()"
              [disabled]="loading() || actionBusy()"
              class="shrink-0 rounded-2xl border border-border bg-white/85 px-3 py-2 text-[13px] font-semibold text-primary shadow-sm transition hover:bg-surface-2 disabled:opacity-60">
              {{ loading() ? 'Refreshing...' : 'Refresh' }}
            </button>
          </div>

          <div class="mt-4 grid grid-cols-3 gap-2.5 sm:gap-3">
            <div class="rounded-2xl border border-border bg-white/75 px-3 py-3 shadow-sm">
              <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">Total</p>
              <p class="mt-1 text-xl font-bold text-primary sm:text-2xl">{{ stocks().length }}</p>
            </div>
            <div class="rounded-2xl border border-border bg-white/75 px-3 py-3 shadow-sm">
              <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">Active</p>
              <p class="mt-1 text-xl font-bold text-primary sm:text-2xl">{{ activeCount() }}</p>
            </div>
            <div class="rounded-2xl border border-border bg-white/75 px-3 py-3 shadow-sm">
              <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">In Stock</p>
              <p class="mt-1 text-xl font-bold text-primary sm:text-2xl">{{ inStockCount() }}</p>
            </div>
          </div>
        </header>

        <nav class="rounded-[26px] border border-border bg-surface px-3 py-3 shadow-sm sm:px-4">
          <div class="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            <button
              type="button"
              (click)="openWorkspace('home')"
              class="rounded-2xl border px-3 py-3 text-left transition"
              [ngClass]="workspaceCardClass('home')">
              <div class="flex items-center gap-3">
                <span class="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-white/80 text-primary shadow-sm">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 10.5 12 3l9 7.5"></path>
                    <path d="M5 9.5V21h14V9.5"></path>
                  </svg>
                </span>
                <div>
                  <div class="text-[14px] font-semibold text-primary">Stock Home</div>
                  <div class="text-[12px] text-secondary">Quick overview and actions</div>
                </div>
              </div>
            </button>

            <button
              type="button"
              (click)="openInventory()"
              class="rounded-2xl border px-3 py-3 text-left transition"
              [ngClass]="workspaceCardClass('inventory')">
              <div class="flex items-center gap-3">
                <span class="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-white/80 text-primary shadow-sm">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 7h18"></path>
                    <path d="M6 12h12"></path>
                    <path d="M9 17h6"></path>
                  </svg>
                </span>
                <div>
                  <div class="text-[14px] font-semibold text-primary">View Stocks</div>
                  <div class="text-[12px] text-secondary">Browse, edit, copy, delete</div>
                </div>
              </div>
            </button>

            <button
              type="button"
              (click)="openCreate()"
              class="rounded-2xl border px-3 py-3 text-left transition"
              [ngClass]="workspaceCardClass('form')">
              <div class="flex items-center gap-3">
                <span class="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-white/80 text-primary shadow-sm">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 5v14"></path>
                    <path d="M5 12h14"></path>
                  </svg>
                </span>
                <div>
                  <div class="text-[14px] font-semibold text-primary">Add New Stock</div>
                  <div class="text-[12px] text-secondary">Create a new device entry</div>
                </div>
              </div>
            </button>
          </div>
        </nav>

        <section *ngIf="workspace() === 'home'" class="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div class="rounded-[26px] border border-border bg-surface p-4 shadow-sm sm:p-5">
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">Fast Actions</p>
                <h2 class="mt-1 text-[1.3rem] leading-tight text-primary">Work fast on mobile</h2>
              </div>
              <span class="rounded-full border border-border bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-secondary">
                {{ stocks().length }} devices
              </span>
            </div>

            <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                (click)="openInventory()"
                class="rounded-2xl border border-border bg-white/80 px-4 py-4 text-left shadow-sm transition hover:bg-surface-2">
                <div class="text-[14px] font-semibold text-primary">View inventory</div>
                <div class="mt-1 text-[13px] leading-5 text-secondary">Check stock status, copy device codes, and open edit actions.</div>
              </button>
              <button
                type="button"
                (click)="openCreate()"
                class="rounded-2xl border border-border bg-white/80 px-4 py-4 text-left shadow-sm transition hover:bg-surface-2">
                <div class="text-[14px] font-semibold text-primary">Add a device</div>
                <div class="mt-1 text-[13px] leading-5 text-secondary">Create a fresh listing with price, stock state, and active state.</div>
              </button>
              <button
                type="button"
                (click)="refresh()"
                [disabled]="loading() || actionBusy()"
                class="rounded-2xl border border-border bg-white/80 px-4 py-4 text-left shadow-sm transition hover:bg-surface-2 disabled:opacity-60">
                <div class="text-[14px] font-semibold text-primary">Refresh list</div>
                <div class="mt-1 text-[13px] leading-5 text-secondary">Pull the latest stock inventory from backend.</div>
              </button>
              <button
                *ngIf="editId()"
                type="button"
                (click)="openEditForm()"
                class="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-4 text-left shadow-sm transition hover:bg-primary/10">
                <div class="text-[14px] font-semibold text-primary">Continue editing</div>
                <div class="mt-1 text-[13px] leading-5 text-secondary">Resume the stock item you already opened for update.</div>
              </button>
            </div>

            <div *ngIf="successMessage() || actionError()" class="mt-4 space-y-2">
              <p *ngIf="successMessage()" class="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[13px] font-medium text-emerald-700">
                {{ successMessage() }}
              </p>
              <p *ngIf="actionError()" class="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-[13px] font-medium text-rose-700">
                {{ actionError() }}
              </p>
            </div>
          </div>

          <div class="rounded-[26px] border border-border bg-surface p-4 shadow-sm sm:p-5">
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">Recent Devices</p>
                <h2 class="mt-1 text-[1.3rem] leading-tight text-primary">Quick edit access</h2>
              </div>
            </div>

            <div *ngIf="recentStocks().length === 0" class="mt-4 rounded-2xl border border-dashed border-border bg-white/70 px-4 py-6 text-center text-[13px] text-secondary">
              No devices loaded yet.
            </div>

            <div *ngIf="recentStocks().length > 0" class="mt-4 space-y-2.5">
              <button
                *ngFor="let stock of recentStocks(); trackBy: trackByStock"
                type="button"
                (click)="startEdit(stock)"
                class="flex w-full items-center justify-between gap-3 rounded-2xl border border-border bg-white/80 px-3 py-3 text-left shadow-sm transition hover:bg-surface-2">
                <div class="min-w-0">
                  <div class="truncate text-[14px] font-semibold text-primary">{{ stock.brand }} {{ stock.model }}</div>
                  <div class="mt-0.5 text-[12px] text-secondary">{{ stock.device_code }} · {{ stock.in_stock ? 'In stock' : 'Out of stock' }}</div>
                </div>
                <div class="text-right">
                  <div class="text-[13px] font-semibold text-success">{{ formatInr(stock.discounted_price) }}</div>
                  <div class="text-[11px] text-muted">Tap to edit</div>
                </div>
              </button>
            </div>
          </div>
        </section>

        <section
          *ngIf="workspace() === 'form'"
          id="stock-form-card"
          class="rounded-[26px] border border-border bg-surface p-4 shadow-sm sm:p-5">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">Stock Form</p>
              <h2 class="mt-1 text-[1.35rem] leading-tight text-primary">{{ editId() ? 'Edit device stock' : 'Add new device stock' }}</h2>
              <p class="mt-2 text-[13px] leading-5 text-secondary">
                Fill the stock details once. Device code stays locked after creation.
              </p>
            </div>
            <button
              *ngIf="editId()"
              type="button"
              (click)="cancelEdit()"
              class="shrink-0 rounded-2xl border border-border bg-white/80 px-3 py-2 text-[12px] font-semibold text-secondary shadow-sm transition hover:bg-surface-2">
              Cancel Edit
            </button>
          </div>

          <div class="mt-4 rounded-2xl border border-border bg-white/80 px-4 py-3 shadow-sm">
            <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">Price</p>
                <p class="mt-1 text-[15px] font-semibold text-primary">{{ formatInr(currentPrice()) }}</p>
              </div>
              <div>
                <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">Discounted</p>
                <p class="mt-1 text-[15px] font-semibold text-success">{{ formatInr(previewDiscountedPrice()) }}</p>
              </div>
              <div>
                <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">Stock</p>
                <p class="mt-1 text-[15px] font-semibold text-primary">{{ form.in_stock ? 'In Stock' : 'Out of Stock' }}</p>
              </div>
              <div>
                <p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">Listing</p>
                <p class="mt-1 text-[15px] font-semibold text-primary">{{ form.is_active ? 'Active' : 'Inactive' }}</p>
              </div>
            </div>
          </div>

          <div class="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label class="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Device Code *</label>
              <input
                [ngModel]="form.device_code"
                (ngModelChange)="onDeviceCodeChange($event)"
                [disabled]="!!editId()"
                maxlength="6"
                placeholder="Example: 100001"
                class="w-full rounded-2xl border border-border bg-white/85 px-3 py-3 text-[15px] text-primary shadow-sm focus:border-primary focus:outline-none disabled:opacity-60" />
            </div>
            <div>
              <label class="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Category</label>
              <input
                [(ngModel)]="form.category"
                placeholder="Example: ultra_premium_flagships"
                class="w-full rounded-2xl border border-border bg-white/85 px-3 py-3 text-[15px] text-primary shadow-sm focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label class="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Brand *</label>
              <input
                [(ngModel)]="form.brand"
                placeholder="Apple"
                class="w-full rounded-2xl border border-border bg-white/85 px-3 py-3 text-[15px] text-primary shadow-sm focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label class="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Model *</label>
              <input
                [(ngModel)]="form.model"
                placeholder="iPhone 17 Pro"
                class="w-full rounded-2xl border border-border bg-white/85 px-3 py-3 text-[15px] text-primary shadow-sm focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label class="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Variant</label>
              <input
                [(ngModel)]="form.variant"
                placeholder="256GB"
                class="w-full rounded-2xl border border-border bg-white/85 px-3 py-3 text-[15px] text-primary shadow-sm focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label class="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Color</label>
              <input
                [(ngModel)]="form.color"
                placeholder="Deep Blue"
                class="w-full rounded-2xl border border-border bg-white/85 px-3 py-3 text-[15px] text-primary shadow-sm focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label class="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Device Type</label>
              <input
                [(ngModel)]="form.device_type"
                placeholder="Brand New Sealed Pack"
                class="w-full rounded-2xl border border-border bg-white/85 px-3 py-3 text-[15px] text-primary shadow-sm focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label class="mb-1 block text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">Price (INR) *</label>
              <input
                [(ngModel)]="form.price"
                type="number"
                min="1"
                class="w-full rounded-2xl border border-border bg-white/85 px-3 py-3 text-[15px] text-primary shadow-sm focus:border-primary focus:outline-none" />
            </div>
          </div>

          <div class="mt-4 flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-white/80 px-4 py-3 shadow-sm">
            <label class="inline-flex items-center gap-2 text-[14px] font-medium text-primary">
              <input [(ngModel)]="form.in_stock" type="checkbox" class="h-4 w-4 rounded border-border">
              In Stock
            </label>
            <label class="inline-flex items-center gap-2 text-[14px] font-medium text-primary">
              <input [(ngModel)]="form.is_active" type="checkbox" class="h-4 w-4 rounded border-border">
              Active
            </label>
          </div>

          <div class="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              (click)="submit()"
              [disabled]="!formValid() || actionBusy()"
              class="rounded-2xl bg-primary px-4 py-3 text-[14px] font-semibold text-white shadow-sm transition hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60">
              {{ actionBusy() ? 'Saving...' : (editId() ? 'Update Stock' : 'Create Stock') }}
            </button>
            <button
              type="button"
              (click)="openInventory()"
              class="rounded-2xl border border-border bg-white/80 px-4 py-3 text-[14px] font-semibold text-secondary shadow-sm transition hover:bg-surface-2">
              View Inventory
            </button>
          </div>

          <div *ngIf="successMessage() || actionError()" class="mt-4 space-y-2">
            <p *ngIf="successMessage()" class="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[13px] font-medium text-emerald-700">
              {{ successMessage() }}
            </p>
            <p *ngIf="actionError()" class="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-[13px] font-medium text-rose-700">
              {{ actionError() }}
            </p>
          </div>
        </section>

        <section *ngIf="workspace() === 'inventory'" class="rounded-[26px] border border-border bg-surface shadow-sm overflow-hidden">
          <div class="border-b border-border px-4 py-4 sm:px-5">
            <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">Inventory</p>
                <h2 class="mt-1 text-[1.35rem] leading-tight text-primary">View and manage stocks</h2>
              </div>

              <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div class="relative min-w-0 sm:w-72">
                  <input
                    [ngModel]="searchTerm()"
                    (ngModelChange)="searchTerm.set($event)"
                    type="text"
                    placeholder="Search code, brand, model"
                    class="w-full rounded-2xl border border-border bg-white/85 px-3 py-3 pr-10 text-[14px] text-primary shadow-sm focus:border-primary focus:outline-none" />
                  <button
                    *ngIf="searchTerm()"
                    type="button"
                    (click)="searchTerm.set('')"
                    class="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted transition hover:bg-surface-2 hover:text-primary">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M18 6 6 18"></path>
                      <path d="m6 6 12 12"></path>
                    </svg>
                  </button>
                </div>

                <div class="inline-flex rounded-2xl border border-border bg-white/85 p-1 shadow-sm">
                  <button type="button" (click)="filterState.set('all')" [class]="filterBtnClass('all')">All</button>
                  <button type="button" (click)="filterState.set('active')" [class]="filterBtnClass('active')">Active</button>
                  <button type="button" (click)="filterState.set('inactive')" [class]="filterBtnClass('inactive')">Inactive</button>
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="loading()" class="px-4 py-10 text-center text-[14px] text-secondary">Loading stocks...</div>
          <div *ngIf="!loading() && filteredStocks().length === 0" class="px-4 py-10 text-center text-[14px] text-secondary">
            No stocks found for this filter.
          </div>

          <div *ngIf="!loading()" class="divide-y divide-border">
            <article *ngFor="let stock of filteredStocks(); trackBy: trackByStock" class="px-4 py-4 sm:px-5">
              <div class="rounded-[24px] border border-border bg-white/80 px-4 py-4 shadow-sm">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <div class="flex flex-wrap items-center gap-2">
                      <h3 class="text-[16px] font-semibold text-primary sm:text-[17px]">{{ stock.brand }} {{ stock.model }}</h3>
                      <span class="rounded-full border border-primary/15 bg-primary/6 px-2 py-0.5 text-[11px] font-semibold text-primary">
                        {{ stock.device_code }}
                      </span>
                    </div>
                    <p class="mt-1 text-[13px] leading-5 text-secondary">{{ stockMeta(stock) }}</p>
                    <p class="mt-1 text-[12px] text-muted">{{ stock.category_label || categoryLabel(stock.category) }}</p>
                  </div>

                  <div class="flex shrink-0 flex-col items-end gap-1">
                    <span class="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                      [ngClass]="stock.in_stock ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'">
                      {{ stock.in_stock ? 'In Stock' : 'Out of Stock' }}
                    </span>
                    <span class="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                      [ngClass]="stock.is_active ? 'bg-sky-100 text-sky-700' : 'bg-slate-200 text-slate-700'">
                      {{ stock.is_active ? 'Active' : 'Inactive' }}
                    </span>
                  </div>
                </div>

                <div class="mt-3 flex items-end justify-between gap-3">
                  <div>
                    <div class="text-[12px] line-through text-secondary">{{ formatInr(stock.price) }}</div>
                    <div class="mt-0.5 flex items-center gap-2">
                      <span class="text-[17px] font-bold text-success">{{ formatInr(stock.discounted_price) }}</span>
                      <span class="text-[11px] font-semibold text-success">{{ stock.discount_percent }}% OFF</span>
                    </div>
                  </div>
                  <div class="text-right text-[11px] text-muted">Updated {{ formatDate(stock.updated_at) }}</div>
                </div>

                <div class="mt-3 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    (click)="copyCode(stock.device_code)"
                    class="rounded-2xl border border-border bg-surface px-3 py-2.5 text-[12px] font-semibold text-primary shadow-sm transition hover:bg-surface-2">
                    {{ copiedCode() === stock.device_code ? 'Copied' : 'Copy' }}
                  </button>
                  <button
                    type="button"
                    (click)="startEdit(stock)"
                    class="rounded-2xl border border-blue-200 bg-blue-50 px-3 py-2.5 text-[12px] font-semibold text-blue-700 shadow-sm transition hover:bg-blue-100">
                    Edit
                  </button>
                  <button
                    type="button"
                    (click)="deleteStock(stock)"
                    [disabled]="actionBusy()"
                    class="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-[12px] font-semibold text-rose-700 shadow-sm transition hover:bg-rose-100 disabled:opacity-60">
                    Delete
                  </button>
                </div>
              </div>
            </article>
          </div>
        </section>
      </div>
    </div>
  `
})
export class AgentStockManagementComponent implements OnInit {
  private readonly stockApi = inject(DeviceStockApiService);

  readonly stocks = this.stockApi.agentStocks;
  readonly loading = this.stockApi.loadingAgent;
  readonly actionBusy = this.stockApi.actionBusy;
  readonly actionError = this.stockApi.actionError;

  readonly workspace = signal<StockWorkspace>('home');
  readonly filterState = signal<StockFilter>('all');
  readonly copiedCode = signal<string>('');
  readonly successMessage = signal<string>('');
  readonly editId = signal<number | null>(null);
  readonly searchTerm = signal<string>('');

  form = {
    device_code: '',
    category: '',
    brand: '',
    model: '',
    variant: '',
    color: '',
    device_type: '',
    price: 0,
    in_stock: true,
    is_active: true
  };

  readonly filteredStocks = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();
    const filter = this.filterState();
    return this.stocks().filter((stock) => {
      if (filter === 'active' && !stock.is_active) return false;
      if (filter === 'inactive' && stock.is_active) return false;
      if (!search) return true;
      const haystack = `${stock.device_code} ${stock.brand} ${stock.model} ${stock.variant} ${stock.color}`.toLowerCase();
      return haystack.includes(search);
    });
  });

  readonly recentStocks = computed(() => this.stocks().slice(0, 5));
  readonly activeCount = computed(() => this.stocks().filter((item) => item.is_active).length);
  readonly inStockCount = computed(() => this.stocks().filter((item) => item.in_stock).length);

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.stockApi.loadAgentStocks(true).subscribe();
  }

  openWorkspace(workspace: StockWorkspace): void {
    this.workspace.set(workspace);
  }

  openInventory(): void {
    this.workspace.set('inventory');
  }

  openCreate(): void {
    if (!this.editId()) {
      this.resetForm();
    }
    this.workspace.set('form');
  }

  openEditForm(): void {
    this.workspace.set('form');
    this.scrollToForm();
  }

  cancelEdit(): void {
    this.resetForm();
    this.workspace.set('home');
  }

  onDeviceCodeChange(value: string): void {
    const normalized = String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    this.form = {
      ...this.form,
      device_code: normalized
    };
  }

  formValid(): boolean {
    return (
      String(this.form.device_code || '').trim().length === 6 &&
      String(this.form.brand || '').trim().length > 0 &&
      String(this.form.model || '').trim().length > 0 &&
      Number(this.form.price || 0) > 0
    );
  }

  submit(): void {
    if (!this.formValid() || this.actionBusy()) return;
    this.successMessage.set('');

    const payload = {
      device_code: String(this.form.device_code || '').trim().toUpperCase(),
      category: String(this.form.category || '').trim(),
      brand: String(this.form.brand || '').trim(),
      model: String(this.form.model || '').trim(),
      variant: String(this.form.variant || '').trim(),
      color: String(this.form.color || '').trim(),
      device_type: String(this.form.device_type || '').trim(),
      price: Math.max(1, Math.floor(Number(this.form.price || 0))),
      in_stock: Boolean(this.form.in_stock),
      is_active: Boolean(this.form.is_active)
    };

    const id = this.editId();
    if (id) {
      this.stockApi.updateStock(id, payload).subscribe((updated) => {
        if (!updated) return;
        this.successMessage.set('Stock updated successfully.');
        this.resetForm();
        this.workspace.set('inventory');
      });
      return;
    }

    this.stockApi.createStock(payload).subscribe((created) => {
      if (!created) return;
      this.successMessage.set('Stock created successfully.');
      this.resetForm();
      this.workspace.set('inventory');
    });
  }

  startEdit(stock: DeviceStock): void {
    this.editId.set(stock.id);
    this.form = {
      device_code: stock.device_code,
      category: stock.category || '',
      brand: stock.brand || '',
      model: stock.model || '',
      variant: stock.variant || '',
      color: stock.color || '',
      device_type: stock.device_type || '',
      price: Number(stock.price || 0),
      in_stock: Boolean(stock.in_stock),
      is_active: Boolean(stock.is_active)
    };
    this.successMessage.set('');
    this.workspace.set('form');
    this.scrollToForm();
  }

  deleteStock(stock: DeviceStock): void {
    if (this.actionBusy()) return;
    const ok = window.confirm(`Delete stock ${stock.device_code} (${stock.brand} ${stock.model})?`);
    if (!ok) return;
    this.successMessage.set('');
    this.stockApi.deleteStock(stock.id).subscribe((deleted) => {
      if (!deleted) return;
      if (this.editId() === stock.id) {
        this.resetForm();
      }
      this.successMessage.set('Stock deleted successfully.');
    });
  }

  resetForm(): void {
    this.editId.set(null);
    this.form = {
      device_code: '',
      category: '',
      brand: '',
      model: '',
      variant: '',
      color: '',
      device_type: '',
      price: 0,
      in_stock: true,
      is_active: true
    };
  }

  workspaceCardClass(workspace: StockWorkspace): string {
    return this.workspace() === workspace
      ? 'border-primary/25 bg-primary/5 shadow-sm'
      : 'border-border bg-white/80 shadow-sm hover:bg-surface-2';
  }

  filterBtnClass(filter: StockFilter): string {
    const active = this.filterState() === filter;
    return active
      ? 'rounded-2xl bg-primary px-3 py-2 text-[12px] font-semibold text-white shadow-sm'
      : 'rounded-2xl px-3 py-2 text-[12px] font-semibold text-secondary transition hover:bg-surface hover:text-primary';
  }

  trackByStock(_index: number, stock: DeviceStock): number {
    return stock.id;
  }

  formatInr(value: number): string {
    return `INR ${Number(value || 0).toLocaleString('en-IN')}`;
  }

  formatDate(value: string | null): string {
    if (!value) return '--';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '--';
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }

  previewDiscountedPrice(): number {
    return Math.max(0, Math.round(Number(this.form.price || 0) * 0.82));
  }

  currentPrice(): number {
    return Math.max(0, Number(this.form.price || 0));
  }

  categoryLabel(category: string): string {
    return String(category || '').replace(/_/g, ' ').trim().replace(/\b\w/g, (ch) => ch.toUpperCase()) || 'General';
  }

  stockMeta(stock: DeviceStock): string {
    const parts = [stock.variant, stock.color, stock.device_type].filter((value) => String(value || '').trim().length > 0);
    return parts.length > 0 ? parts.join(' • ') : 'Standard variant';
  }

  async copyCode(code: string): Promise<void> {
    const safe = String(code || '').trim();
    if (!safe) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(safe);
      } else {
        const input = document.createElement('input');
        input.value = safe;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        input.remove();
      }
      this.copiedCode.set(safe);
      window.setTimeout(() => {
        if (this.copiedCode() === safe) this.copiedCode.set('');
      }, 1500);
    } catch {
      // ignore clipboard failures in restricted browsers
    }
  }

  private scrollToForm(): void {
    window.requestAnimationFrame(() => {
      document.getElementById('stock-form-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
}
