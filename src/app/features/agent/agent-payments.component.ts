import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentConfigService } from '../../core/services/payment-config.service';
import { AgentDataService } from '../../core/services/agent-data.service';
import {
  PaymentDisplayLog,
  PaymentSet,
  PaymentSetStatus,
  PaymentTemplate,
  PaymentTransaction
} from '../../core/models/payment-config.model';
import { UploadZoneComponent } from '../../shared/components/upload-zone/upload-zone.component';
import { AgentUserApiService } from '../../core/services/agent-user-api.service';
import { Subscription } from 'rxjs';

interface AgentUserOption {
  id: string;
  fullName: string;
}

type TemplateAction = 'implement' | 'delete';
type PaymentTab = 'global' | 'templates' | 'transactions' | 'user' | 'logs';
type PaymentView = 'home' | PaymentTab;

interface PaymentTabOption {
  key: PaymentTab;
  label: string;
  helper: string;
}

interface PaymentHomeAction {
  key: PaymentTab;
  label: string;
  helper: string;
  icon: 'globe' | 'layers' | 'receipt' | 'user' | 'clock';
}

@Component({
  selector: 'app-agent-payments',
  standalone: true,
  imports: [CommonModule, FormsModule, UploadZoneComponent],
  template: `
    <div class="mx-auto w-full max-w-7xl px-3 pb-10 sm:px-5 lg:px-8">
      <section class="rounded-[28px] border border-white/60 bg-gradient-to-br from-[#f7fbff] via-[#edf4fb] to-[#e8eff8] p-4 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:p-5">
        <div class="flex flex-col gap-3">
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Payments Control</p>
            <h1 class="mt-2 text-[28px] leading-[1.02] font-display text-primary">Payments Home</h1>
            <p class="mt-2 max-w-2xl text-[14px] leading-6 text-secondary">
              Manage global payment sets, user-specific overrides, reusable templates, and transaction approvals from one clean workspace.
            </p>
          </div>
        </div>
      </section>

      <section *ngIf="isPaymentHome(); else paymentWorkspaceHeader" class="mt-4 rounded-[28px] border border-border bg-surface p-4 shadow-[0_16px_44px_rgba(15,23,42,0.06)] sm:p-5">
        <div class="flex items-end justify-between gap-3">
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Payments Home</p>
            <h2 class="mt-2 text-[24px] leading-tight font-display text-primary">Choose a payment workspace</h2>
            <p class="mt-1 text-[14px] leading-6 text-secondary">Open one focused flow instead of stacking every payment tool on the same screen.</p>
          </div>
          <span class="hidden sm:inline-flex rounded-full border border-border bg-surface-2 px-3 py-1 text-[12px] font-medium text-secondary">
            5 quick actions
          </span>
        </div>

        <div class="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          <button
            *ngFor="let action of homeActions()"
            type="button"
            (click)="openPaymentAction(action.key)"
            class="group rounded-[24px] border border-border bg-surface-2/60 p-4 text-left shadow-sm transition hover:border-primary/20 hover:bg-white hover:shadow-[0_14px_28px_rgba(15,23,42,0.08)]">
            <div class="flex items-start gap-3">
              <div class="flex h-11 w-11 items-center justify-center rounded-[18px] border border-white/70 bg-white text-primary shadow-sm">
                <ng-container [ngSwitch]="action.icon">
                  <svg *ngSwitchCase="'globe'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M2 12h20"></path>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                  </svg>
                  <svg *ngSwitchCase="'layers'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                    <polyline points="2 17 12 22 22 17"></polyline>
                    <polyline points="2 12 12 17 22 12"></polyline>
                  </svg>
                  <svg *ngSwitchCase="'receipt'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 3h16v18l-3-2-3 2-3-2-3 2-3-2-3 2V3z"></path>
                    <path d="M8 7h8"></path>
                    <path d="M8 11h8"></path>
                    <path d="M8 15h5"></path>
                  </svg>
                  <svg *ngSwitchCase="'user'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21a8 8 0 0 0-16 0"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <svg *ngSwitchCase="'clock'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </ng-container>
              </div>
            </div>
            <p class="mt-4 text-[16px] font-semibold leading-5 text-primary">{{ action.label }}</p>
            <p class="mt-2 text-[13px] leading-6 text-secondary">{{ action.helper }}</p>
          </button>
        </div>
      </section>

      <ng-template #paymentWorkspaceHeader>
        <section class="mt-4 rounded-[28px] border border-border bg-surface p-3 shadow-[0_16px_44px_rgba(15,23,42,0.06)] sm:p-4">
          <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <button
              type="button"
              (click)="openPaymentHome()"
              class="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface-2/70 px-3 py-2 text-[13px] font-semibold text-primary transition hover:bg-white">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Payment Home
            </button>

            <div class="no-scrollbar overflow-x-auto">
              <div class="flex min-w-max gap-2">
                <button
                  *ngFor="let tab of tabOptions"
                  type="button"
                  (click)="setActiveTab(tab.key)"
                  class="rounded-2xl border px-3.5 py-2.5 text-left transition-colors"
                  [ngClass]="activeTab() === tab.key ? 'border-primary bg-primary text-white shadow-sm' : 'border-border bg-surface-2/60 text-secondary hover:text-primary'">
                  <p class="text-[13px] font-semibold leading-4">{{ tab.label }}</p>
                  <p class="mt-1 text-[11px] leading-4 opacity-80">{{ tab.helper }}</p>
                </button>
              </div>
            </div>
          </div>
        </section>
      </ng-template>

      <section *ngIf="activeTab() === 'global'" class="space-y-6">
        <article class="bg-surface border border-border rounded-xl shadow-sm p-5">
          <h2 class="text-lg font-semibold text-primary mb-1">Update Global Payment Details</h2>
          <p class="text-xs text-secondary mb-4">
            You can update QR only, bank only, or both. New global config stays active for 5 minutes.
          </p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="md:col-span-2 mb-2">
              <label class="block text-sm font-medium text-secondary mb-2">QR Code (Optional)</label>
              <app-upload-zone
                label="Upload QR code image"
                hint="PNG or JPG"
                accept="image/*"
                [uploading]="globalUploading()"
                [progress]="globalProgress()"
                (fileDropped)="onGlobalQrSelected($event)">
              </app-upload-zone>
              <p *ngIf="globalQrFile" class="text-xs text-success mt-2">QR file selected: {{ globalQrFile.name }}</p>
            </div>

            <input [(ngModel)]="globalForm.accountHolderName" type="text" placeholder="Account holder name (optional)" class="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm focus:outline-none focus:border-primary">
            <input [(ngModel)]="globalForm.bankName" type="text" placeholder="Bank name (optional)" class="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm focus:outline-none focus:border-primary">
            <input [(ngModel)]="globalForm.accountNumber" type="text" placeholder="Account number (optional)" class="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm focus:outline-none focus:border-primary">
            <input [(ngModel)]="globalForm.ifsc" type="text" placeholder="IFSC (optional)" class="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm focus:outline-none focus:border-primary">
            <input [(ngModel)]="globalForm.branch" type="text" placeholder="Branch (optional)" class="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm focus:outline-none focus:border-primary">
          </div>

          <div class="mt-4 flex flex-wrap items-center gap-2">
            <button
              (click)="createGlobalSet()"
              [disabled]="globalSyncing()"
              class="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-light transition-colors disabled:opacity-60">
              {{ globalSyncing() ? 'Saving...' : 'Save Global Settings' }}
            </button>
            <button
              (click)="clearGlobalForm()"
              [disabled]="globalSyncing()"
              class="px-4 py-2 rounded-lg border border-border text-sm text-secondary hover:text-primary disabled:opacity-60">
              Clear
            </button>
          </div>

          <p *ngIf="globalMessage()" class="mt-3 text-sm" [ngClass]="globalError() ? 'text-error' : 'text-success'">
            {{ globalMessage() }}
          </p>
        </article>

        <article class="rounded-[28px] bg-surface border border-border shadow-[0_16px_44px_rgba(15,23,42,0.06)] overflow-hidden">
          <div class="px-5 py-3 border-b border-border bg-surface-2 font-semibold text-primary flex items-center justify-between">
            <span>Active Global Sets</span>
            <div *ngIf="globalLoading()" class="w-4 h-4 rounded-full border-2 border-surface-3 border-t-primary animate-spin"></div>
          </div>
          <div class="space-y-3 p-4 md:hidden">
            <article *ngFor="let set of globalSets()" class="rounded-[22px] border border-border bg-surface-2/60 p-4 shadow-sm">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="font-mono text-[13px] text-primary">{{ set.id }}</p>
                  <p class="mt-1 text-[12px] text-secondary">{{ setMethodLabel(set) }}</p>
                </div>
                <span class="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide"
                  [ngClass]="statusClass(setStatus(set))">{{ setStatus(set) }}</span>
              </div>
              <div class="mt-3 grid grid-cols-2 gap-2 text-[12px]">
                <div class="rounded-2xl border border-border bg-white/80 p-3">
                  <span class="block text-[11px] uppercase tracking-[0.16em] text-slate-400">Uploaded</span>
                  <p class="mt-1 text-primary">{{ formatDateTime(set.startsAt) }}</p>
                </div>
                <div class="rounded-2xl border border-border bg-white/80 p-3">
                  <span class="block text-[11px] uppercase tracking-[0.16em] text-slate-400">Expires</span>
                  <p class="mt-1 text-primary">{{ formatDateTime(setExpiresAt(set)) }}</p>
                </div>
              </div>
              <button (click)="deleteSet(set.id)" class="mt-3 w-full rounded-2xl border border-error px-3 py-2.5 text-[12px] font-semibold text-error hover:bg-error/10 transition-colors">
                Delete
              </button>
            </article>

            <div *ngIf="globalSets().length === 0" class="rounded-[22px] border border-border bg-surface-2/60 px-4 py-6 text-center text-[14px] text-secondary">
              No global sets configured.
            </div>
          </div>

          <div class="hidden overflow-x-auto md:block">
            <table class="w-full text-left text-sm whitespace-nowrap">
              <thead class="text-secondary bg-surface">
                <tr>
                  <th class="px-4 py-3">Set ID</th>
                  <th class="px-4 py-3">Methods</th>
                  <th class="px-4 py-3">Uploaded At</th>
                  <th class="px-4 py-3">Expires At</th>
                  <th class="px-4 py-3">Status</th>
                  <th class="px-4 py-3 text-right">Delete</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                <tr *ngFor="let set of globalSets()">
                  <td class="px-4 py-3 font-mono text-primary">{{ set.id }}</td>
                  <td class="px-4 py-3 text-secondary">{{ setMethodLabel(set) }}</td>
                  <td class="px-4 py-3 text-secondary">{{ formatDateTime(set.startsAt) }}</td>
                  <td class="px-4 py-3 text-secondary">{{ formatDateTime(setExpiresAt(set)) }}</td>
                  <td class="px-4 py-3">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide"
                      [ngClass]="statusClass(setStatus(set))">{{ setStatus(set) }}</span>
                  </td>
                  <td class="px-4 py-3 text-right">
                    <button (click)="deleteSet(set.id)" class="px-3 py-1.5 rounded border border-error text-error hover:bg-error/10 text-xs font-medium transition-colors">
                      Delete
                    </button>
                  </td>
                </tr>
                <tr *ngIf="globalSets().length === 0">
                  <td colspan="6" class="px-4 py-6 text-center text-secondary">No global sets configured.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section *ngIf="activeTab() === 'templates'" class="space-y-4">
        <article class="bg-surface border border-border rounded-xl shadow-sm p-4 flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold text-primary">Reusable Templates (Last 24 Hours)</h2>
            <p class="text-xs text-secondary">View, implement, or delete previous payment configurations.</p>
          </div>
          <button (click)="loadTemplates()" [disabled]="templatesLoading()" class="px-3 py-2 rounded border border-border text-sm text-primary hover:bg-surface-2 disabled:opacity-60">
            {{ templatesLoading() ? 'Loading...' : 'Refresh' }}
          </button>
        </article>

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <article *ngFor="let tpl of templates(); trackBy: trackByTemplateId" class="bg-surface border border-border rounded-xl p-4 shadow-sm">
            <div class="text-xs text-secondary mb-2">{{ formatDateTime(tpl.createdAt) }}</div>

            <div *ngIf="tpl.hasQr" class="mb-3 rounded-lg border border-border bg-surface-2 p-2">
              <img [src]="tpl.qrImageUrl" alt="Template QR" loading="lazy" decoding="async" class="w-full h-36 object-contain rounded bg-white">
            </div>
            <div *ngIf="tpl.hasBank" class="mb-3 rounded-lg border border-border bg-surface-2 p-3 text-xs text-secondary space-y-1">
              <p class="truncate"><span class="text-muted">Holder:</span> {{ tpl.accountHolderName || '-' }}</p>
              <p class="truncate"><span class="text-muted">Bank:</span> {{ tpl.bankName || '-' }}</p>
              <p class="truncate"><span class="text-muted">A/C:</span> {{ tpl.accountNumber || '-' }}</p>
              <p class="truncate"><span class="text-muted">IFSC:</span> {{ tpl.ifsc || '-' }}</p>
            </div>
            <div *ngIf="!tpl.hasQr && !tpl.hasBank" class="mb-3 rounded-lg border border-border bg-surface-2 p-3 text-xs text-secondary">
              Empty template payload.
            </div>

            <div class="flex items-center gap-2">
              <button (click)="openTemplateView(tpl)" class="px-3 py-1.5 rounded border border-border text-xs text-secondary hover:text-primary">View</button>
              <button (click)="openTemplateConfirm(tpl, 'implement')" class="px-3 py-1.5 rounded border border-success text-success hover:bg-success/10 text-xs">Implement</button>
              <button (click)="openTemplateConfirm(tpl, 'delete')" class="px-3 py-1.5 rounded border border-error text-error hover:bg-error/10 text-xs">Delete</button>
            </div>
          </article>
        </div>

        <div *ngIf="templates().length === 0 && !templatesLoading()" class="bg-surface border border-border rounded-xl p-6 text-center text-secondary">
          No templates found in the last 24 hours.
        </div>
      </section>

      <section *ngIf="activeTab() === 'transactions'" class="space-y-4">
        <article class="bg-surface border border-border rounded-xl shadow-sm p-4">
          <div class="flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
            <div>
              <h2 class="text-lg font-semibold text-primary">Transaction Logs</h2>
              <p class="text-xs text-secondary">Approve, deny, or delete user payment submissions.</p>
            </div>
            <div class="flex items-center gap-2">
              <input
                [(ngModel)]="transactionSearch"
                (ngModelChange)="onTransactionSearchChange()"
                placeholder="Search user/number/txn"
                type="text"
                class="w-56 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm focus:outline-none focus:border-primary" />
              <button (click)="loadTransactions()" [disabled]="transactionsLoading()" class="px-3 py-2 rounded border border-border text-sm text-primary hover:bg-surface-2 disabled:opacity-60">
                {{ transactionsLoading() ? 'Loading...' : 'Refresh' }}
              </button>
            </div>
          </div>
        </article>

        <article class="rounded-[28px] bg-surface border border-border shadow-[0_16px_44px_rgba(15,23,42,0.06)] overflow-hidden">
          <div class="space-y-3 p-4 md:hidden">
            <article *ngFor="let tx of transactions(); trackBy: trackByTransactionId" class="rounded-[22px] border border-border bg-surface-2/60 p-4 shadow-sm">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="text-[15px] font-semibold text-primary">{{ tx.userName || tx.userId }}</p>
                  <p class="mt-1 text-[12px] text-secondary">{{ tx.userNumber || '-' }}</p>
                </div>
                <span class="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide"
                  [ngClass]="tx.status === 'verified' ? 'bg-success/10 text-success' : tx.status === 'rejected' ? 'bg-error/10 text-error' : 'bg-warning/10 text-warning'">
                  {{ tx.status }}
                </span>
              </div>
              <div class="mt-3 flex items-center gap-3">
                <a [href]="tx.proofImageUrl" target="_blank" rel="noopener noreferrer" class="inline-block rounded-2xl border border-border bg-white/80 p-1">
                  <img [src]="tx.proofImageUrl" alt="Proof" loading="lazy" decoding="async" class="h-16 w-16 rounded-xl object-cover" />
                </a>
                <div class="min-w-0 flex-1">
                  <p class="truncate font-mono text-[12px] text-primary">{{ tx.transactionId }}</p>
                  <p class="mt-1 text-[12px] text-secondary">{{ formatInr(tx.amountInr) }}</p>
                  <p class="mt-1 text-[12px] text-secondary">{{ formatDateTime(tx.createdAt) }}</p>
                </div>
              </div>
              <div class="mt-3 grid grid-cols-4 gap-2">
                <button (click)="copyText(tx.transactionId)" class="rounded-2xl border border-border px-2 py-2 text-[11px] font-semibold text-secondary hover:text-primary">Copy</button>
                <button
                  (click)="updateTransactionStatus(tx, 'verified')"
                  [disabled]="txActionBusyId() === tx.id"
                  class="rounded-2xl border border-success px-2 py-2 text-[11px] font-semibold text-success hover:bg-success/10 disabled:opacity-60">
                  Approve
                </button>
                <button
                  (click)="updateTransactionStatus(tx, 'rejected')"
                  [disabled]="txActionBusyId() === tx.id"
                  class="rounded-2xl border border-warning px-2 py-2 text-[11px] font-semibold text-warning hover:bg-warning/10 disabled:opacity-60">
                  Deny
                </button>
                <button
                  (click)="deleteTransaction(tx)"
                  [disabled]="txActionBusyId() === tx.id"
                  class="rounded-2xl border border-error px-2 py-2 text-[11px] font-semibold text-error hover:bg-error/10 disabled:opacity-60">
                  Delete
                </button>
              </div>
            </article>

            <div *ngIf="transactions().length === 0" class="rounded-[22px] border border-border bg-surface-2/60 px-4 py-6 text-center text-[14px] text-secondary">
              No transaction logs found.
            </div>
          </div>

          <div class="hidden overflow-x-auto md:block">
            <table class="w-full text-left text-sm whitespace-nowrap">
              <thead class="bg-surface-2 text-secondary">
                <tr>
                  <th class="px-4 py-3">User</th>
                  <th class="px-4 py-3">Proof</th>
                  <th class="px-4 py-3">Txn ID</th>
                  <th class="px-4 py-3">Amount</th>
                  <th class="px-4 py-3">Status</th>
                  <th class="px-4 py-3">Time</th>
                  <th class="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                <tr *ngFor="let tx of transactions(); trackBy: trackByTransactionId">
                  <td class="px-4 py-3">
                    <div class="text-primary font-medium">{{ tx.userName || tx.userId }}</div>
                    <div class="text-xs text-secondary">{{ tx.userNumber || '-' }}</div>
                  </td>
                  <td class="px-4 py-3">
                    <a [href]="tx.proofImageUrl" target="_blank" rel="noopener noreferrer" class="inline-block border border-border rounded bg-surface-2 p-1">
                      <img [src]="tx.proofImageUrl" alt="Proof" loading="lazy" decoding="async" class="w-16 h-16 object-cover rounded" />
                    </a>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                      <span class="font-mono text-primary">{{ tx.transactionId }}</span>
                      <button (click)="copyText(tx.transactionId)" class="text-xs px-2 py-1 border border-border rounded text-secondary hover:text-primary">Copy</button>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-secondary">{{ formatInr(tx.amountInr) }}</td>
                  <td class="px-4 py-3">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide"
                      [ngClass]="tx.status === 'verified' ? 'bg-success/10 text-success' : tx.status === 'rejected' ? 'bg-error/10 text-error' : 'bg-warning/10 text-warning'">
                      {{ tx.status }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-secondary">{{ formatDateTime(tx.createdAt) }}</td>
                  <td class="px-4 py-3 text-right">
                    <div class="inline-flex gap-1">
                      <button
                        (click)="updateTransactionStatus(tx, 'verified')"
                        [disabled]="txActionBusyId() === tx.id"
                        class="px-2 py-1 text-xs rounded border border-success text-success hover:bg-success/10 disabled:opacity-60">
                        Approve
                      </button>
                      <button
                        (click)="updateTransactionStatus(tx, 'rejected')"
                        [disabled]="txActionBusyId() === tx.id"
                        class="px-2 py-1 text-xs rounded border border-warning text-warning hover:bg-warning/10 disabled:opacity-60">
                        Deny
                      </button>
                      <button
                        (click)="deleteTransaction(tx)"
                        [disabled]="txActionBusyId() === tx.id"
                        class="px-2 py-1 text-xs rounded border border-error text-error hover:bg-error/10 disabled:opacity-60">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="transactions().length === 0">
                  <td colspan="7" class="px-4 py-6 text-center text-secondary">No transaction logs found.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section *ngIf="activeTab() === 'user'" class="space-y-6">
        <article class="rounded-[28px] border border-border bg-surface p-4 shadow-[0_16px_44px_rgba(15,23,42,0.06)] sm:p-5">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">User Override</p>
              <h2 class="mt-2 text-[24px] leading-tight font-display text-primary">Create user-specific payment set</h2>
              <p class="mt-1 text-[14px] leading-6 text-secondary">Pick a user, add a dedicated QR, bank details, or both, and control exactly when that override becomes active.</p>
            </div>
            <span class="inline-flex w-fit rounded-full border border-border bg-surface-2 px-3 py-1 text-[12px] font-medium text-secondary">
              {{ userSets().length }} active records for selected user
            </span>
          </div>

          <div class="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div class="md:col-span-2">
              <label class="mb-2 block text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-400">Target user account</label>
              <button
                type="button"
                (click)="openUserPicker()"
                class="flex w-full items-center justify-between rounded-[22px] border border-border bg-surface-2/70 px-4 py-3 text-left shadow-sm transition hover:bg-white">
                <div>
                  <p class="text-[15px] font-semibold text-primary">{{ selectedUserLabel() }}</p>
                  <p class="mt-1 text-[12px] text-secondary">Search by applicant name or user ID</p>
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-secondary">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>

            <div class="md:col-span-2 rounded-[24px] border border-border bg-surface-2/50 p-3">
              <label class="mb-2 block text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-400">User override QR code (optional)</label>
              <app-upload-zone
                label="Upload target QR code image"
                hint="PNG or JPG recommended"
                accept="image/*"
                [uploading]="userUploading()"
                [progress]="userProgress()"
                (fileDropped)="onUserQrSelected($event)">
              </app-upload-zone>
            </div>

            <div class="rounded-[22px] border border-border bg-surface-2/70 p-3">
              <label class="mb-2 block text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-400">Account holder</label>
              <input [(ngModel)]="userForm.accountHolderName" type="text" placeholder="Account holder name" class="w-full rounded-2xl border border-border bg-white/80 px-3 py-2.5 text-[14px] text-primary focus:outline-none focus:border-primary">
            </div>
            <div class="rounded-[22px] border border-border bg-surface-2/70 p-3">
              <label class="mb-2 block text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-400">Bank name</label>
              <input [(ngModel)]="userForm.bankName" type="text" placeholder="Bank name" class="w-full rounded-2xl border border-border bg-white/80 px-3 py-2.5 text-[14px] text-primary focus:outline-none focus:border-primary">
            </div>
            <div class="rounded-[22px] border border-border bg-surface-2/70 p-3">
              <label class="mb-2 block text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-400">Account number</label>
              <input [(ngModel)]="userForm.accountNumber" type="text" placeholder="Account number" class="w-full rounded-2xl border border-border bg-white/80 px-3 py-2.5 text-[14px] text-primary focus:outline-none focus:border-primary">
            </div>
            <div class="rounded-[22px] border border-border bg-surface-2/70 p-3">
              <label class="mb-2 block text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-400">IFSC</label>
              <input [(ngModel)]="userForm.ifsc" type="text" placeholder="IFSC" class="w-full rounded-2xl border border-border bg-white/80 px-3 py-2.5 text-[14px] text-primary focus:outline-none focus:border-primary">
            </div>
            <div class="rounded-[22px] border border-border bg-surface-2/70 p-3">
              <label class="mb-2 block text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-400">Branch</label>
              <input [(ngModel)]="userForm.branch" type="text" placeholder="Branch optional" class="w-full rounded-2xl border border-border bg-white/80 px-3 py-2.5 text-[14px] text-primary focus:outline-none focus:border-primary">
            </div>
            <div class="rounded-[22px] border border-border bg-surface-2/70 p-3">
              <label class="mb-2 block text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-400">Start time</label>
              <input [(ngModel)]="userForm.startsAtLocal" type="datetime-local" class="w-full rounded-2xl border border-border bg-white/80 px-3 py-2.5 text-[14px] text-primary focus:outline-none focus:border-primary">
            </div>
            <div class="rounded-[22px] border border-border bg-surface-2/70 p-3 md:col-span-2">
              <label class="mb-2 block text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-400">Validity period in minutes</label>
              <input [(ngModel)]="userForm.validForMinutes" type="number" min="1" placeholder="e.g. 10" class="w-full rounded-2xl border border-border bg-white/80 px-3 py-2.5 text-[14px] text-primary focus:outline-none focus:border-primary">
            </div>
          </div>

          <div class="mt-4 flex flex-wrap items-center gap-2">
            <button (click)="createUserSet()" class="rounded-full bg-primary px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm transition hover:bg-primary-light">
              Add user-specific set
            </button>
            <span class="text-[12px] text-secondary">Each override stays isolated to the selected applicant.</span>
          </div>
          <p *ngIf="userMessage()" class="mt-3 text-sm" [ngClass]="userError() ? 'text-error' : 'text-success'">
            {{ userMessage() }}
          </p>
        </article>

        <article class="rounded-[28px] border border-border bg-surface p-4 shadow-[0_16px_44px_rgba(15,23,42,0.06)] sm:p-5">
          <div class="flex items-end justify-between gap-3">
            <div>
              <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Override records</p>
              <h3 class="mt-2 text-[22px] leading-tight font-display text-primary">User-specific sets</h3>
            </div>
            <span class="rounded-full border border-border bg-surface-2 px-3 py-1 text-[12px] font-medium text-secondary">
              {{ selectedUserLabel() }}
            </span>
          </div>

          <div class="mt-4 space-y-3 md:hidden">
            <article *ngFor="let set of userSets()" class="rounded-[22px] border border-border bg-surface-2/60 p-4 shadow-sm">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="font-mono text-[13px] text-primary">{{ set.id }}</p>
                  <p class="mt-1 text-[12px] text-secondary">{{ formatDateTime(set.startsAt) }}</p>
                </div>
                <span class="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
                  [ngClass]="statusClass(setStatus(set))">{{ setStatus(set) }}</span>
              </div>
              <div class="mt-3 grid grid-cols-2 gap-2 text-[12px]">
                <div class="rounded-2xl border border-border bg-white/80 p-3">
                  <span class="block text-[11px] uppercase tracking-[0.16em] text-slate-400">Start</span>
                  <p class="mt-1 text-primary">{{ formatDateTime(set.startsAt) }}</p>
                </div>
                <div class="rounded-2xl border border-border bg-white/80 p-3">
                  <span class="block text-[11px] uppercase tracking-[0.16em] text-slate-400">Valid for</span>
                  <p class="mt-1 text-primary">{{ set.validForMinutes }} min</p>
                </div>
              </div>
              <div class="mt-3 grid grid-cols-2 gap-2">
                <button (click)="toggleSet(set)" class="rounded-2xl border px-3 py-2.5 text-[12px] font-semibold transition-colors"
                  [ngClass]="set.isActive ? 'border-warning text-warning hover:bg-warning/10' : 'border-success text-success hover:bg-success/10'">
                  {{ set.isActive ? 'Deactivate' : 'Activate' }}
                </button>
                <button (click)="deleteSet(set.id)" class="rounded-2xl border border-error px-3 py-2.5 text-[12px] font-semibold text-error hover:bg-error/10 transition-colors">
                  Delete
                </button>
              </div>
            </article>

            <div *ngIf="userSets().length === 0" class="rounded-[22px] border border-border bg-surface-2/60 px-4 py-6 text-center text-[14px] text-secondary">
              No user-specific sets configured for this user yet.
            </div>
          </div>

          <div class="mt-4 hidden overflow-x-auto md:block">
            <table class="w-full text-left text-sm whitespace-nowrap">
              <thead class="text-secondary bg-surface">
                <tr>
                  <th class="px-4 py-3">Set ID</th>
                  <th class="px-4 py-3">Start Time</th>
                  <th class="px-4 py-3">Valid For</th>
                  <th class="px-4 py-3">Status</th>
                  <th class="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                <tr *ngFor="let set of userSets()">
                  <td class="px-4 py-3 font-mono text-primary">{{ set.id }}</td>
                  <td class="px-4 py-3 text-secondary">{{ formatDateTime(set.startsAt) }}</td>
                  <td class="px-4 py-3 text-secondary">{{ set.validForMinutes }} min</td>
                  <td class="px-4 py-3">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide"
                      [ngClass]="statusClass(setStatus(set))">{{ setStatus(set) }}</span>
                  </td>
                  <td class="px-4 py-3 text-right">
                    <div class="inline-flex items-center gap-2">
                      <button (click)="toggleSet(set)" class="px-3 py-1.5 rounded border text-xs font-medium transition-colors"
                        [ngClass]="set.isActive ? 'border-warning text-warning hover:bg-warning/10' : 'border-success text-success hover:bg-success/10'">
                        {{ set.isActive ? 'Deactivate' : 'Activate' }}
                      </button>
                      <button (click)="deleteSet(set.id)" class="px-3 py-1.5 rounded border border-error text-error hover:bg-error/10 text-xs font-medium transition-colors">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="userSets().length === 0">
                  <td colspan="5" class="px-4 py-6 text-center text-secondary">No user-specific sets configured for selected user.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section *ngIf="activeTab() === 'logs'" class="space-y-4">
        <article class="rounded-[28px] bg-surface border border-border shadow-[0_16px_44px_rgba(15,23,42,0.06)] overflow-hidden">
          <div class="px-5 py-3 border-b border-border bg-surface-2 font-semibold text-primary">Display Logs</div>
          <div class="space-y-3 p-4 md:hidden">
            <article *ngFor="let log of logs(); trackBy: trackByLogId" class="rounded-[22px] border border-border bg-surface-2/60 p-4 shadow-sm">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="text-[15px] font-semibold text-primary">{{ userName(log.userId) }}</p>
                  <p class="mt-1 font-mono text-[12px] text-secondary">{{ log.setId }}</p>
                </div>
                <span class="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide"
                  [ngClass]="log.scope === 'user' ? 'bg-primary/10 text-primary' : 'bg-success/10 text-success'">
                  {{ log.scope }}
                </span>
              </div>
              <div class="mt-3 grid grid-cols-2 gap-2 text-[12px]">
                <div class="rounded-2xl border border-border bg-white/80 p-3">
                  <span class="block text-[11px] uppercase tracking-[0.16em] text-slate-400">Shown</span>
                  <p class="mt-1 text-primary">{{ formatDateTime(log.shownAt) }}</p>
                </div>
                <div class="rounded-2xl border border-border bg-white/80 p-3">
                  <span class="block text-[11px] uppercase tracking-[0.16em] text-slate-400">Expires</span>
                  <p class="mt-1 text-primary">{{ formatDateTime(log.expiresAt) }}</p>
                </div>
              </div>
            </article>

            <div *ngIf="logs().length === 0" class="rounded-[22px] border border-border bg-surface-2/60 px-4 py-6 text-center text-[14px] text-secondary">
              No display logs found.
            </div>
          </div>

          <div class="hidden overflow-x-auto md:block">
            <table class="w-full text-left text-sm whitespace-nowrap">
              <thead class="text-secondary bg-surface">
                <tr>
                  <th class="px-4 py-3">Shown At</th>
                  <th class="px-4 py-3">User</th>
                  <th class="px-4 py-3">Set ID</th>
                  <th class="px-4 py-3">Scope</th>
                  <th class="px-4 py-3">Expires At</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                <tr *ngFor="let log of logs(); trackBy: trackByLogId">
                  <td class="px-4 py-3 text-secondary">{{ formatDateTime(log.shownAt) }}</td>
                  <td class="px-4 py-3 text-primary">{{ userName(log.userId) }}</td>
                  <td class="px-4 py-3 font-mono text-primary">{{ log.setId }}</td>
                  <td class="px-4 py-3">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide"
                      [ngClass]="log.scope === 'user' ? 'bg-primary/10 text-primary' : 'bg-success/10 text-success'">
                      {{ log.scope }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-secondary">{{ formatDateTime(log.expiresAt) }}</td>
                </tr>
                <tr *ngIf="logs().length === 0">
                  <td colspan="5" class="px-4 py-6 text-center text-secondary">No display logs found.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </div>

    <div *ngIf="userPickerOpen()" class="fixed inset-0 z-[88] bg-black/40 backdrop-blur-[2px]">
      <div class="absolute inset-x-0 bottom-0 rounded-t-[32px] border border-border bg-surface p-4 shadow-[0_-18px_60px_rgba(15,23,42,0.18)] md:left-1/2 md:top-1/2 md:bottom-auto md:w-full md:max-w-xl md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[32px] md:shadow-[0_24px_80px_rgba(15,23,42,0.2)]">
        <div class="mx-auto mb-4 h-1.5 w-16 rounded-full bg-surface-3"></div>
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">Choose User</p>
            <h3 class="mt-2 text-[22px] font-display text-primary">Target applicant</h3>
          </div>
          <button (click)="closeUserPicker()" class="flex h-9 w-9 items-center justify-center rounded-2xl border border-border bg-surface-2 text-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="mt-4 rounded-[22px] border border-border bg-surface-2/70 p-3">
          <input
            [ngModel]="userPickerQuery()"
            (ngModelChange)="userPickerQuery.set($event)"
            type="text"
            placeholder="Search by name or ID"
            class="w-full rounded-2xl border border-border bg-white/85 px-3 py-2.5 text-[14px] text-primary focus:outline-none focus:border-primary">
        </div>

        <div class="mt-4 max-h-[50vh] space-y-2 overflow-y-auto pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <button
            *ngFor="let user of filteredUserOptions()"
            type="button"
            (click)="selectUserOption(user.id)"
            class="flex w-full items-center justify-between rounded-[22px] border border-border bg-surface-2/60 px-4 py-3 text-left shadow-sm transition hover:bg-white">
            <div>
              <p class="text-[15px] font-semibold text-primary">{{ user.fullName }}</p>
              <p class="mt-1 text-[12px] text-secondary">User ID {{ user.id }}</p>
            </div>
            <span *ngIf="selectedUserId === user.id" class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </span>
          </button>

          <div *ngIf="filteredUserOptions().length === 0" class="rounded-[22px] border border-border bg-surface-2/60 px-4 py-6 text-center text-[14px] text-secondary">
            No users found for this search.
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="viewTemplate()" class="fixed inset-0 z-[90] bg-black/45 backdrop-blur-[1px] flex items-center justify-center p-4">
      <div class="w-full max-w-lg rounded-2xl border border-border bg-surface p-5 shadow-xl">
        <div class="flex items-start justify-between gap-3 mb-4">
          <div>
            <h3 class="text-lg font-semibold text-primary">Template Details</h3>
            <p class="text-xs text-secondary">{{ formatDateTime(viewTemplate()!.createdAt) }}</p>
          </div>
          <button (click)="viewTemplate.set(null)" class="w-8 h-8 rounded-lg border border-border text-secondary hover:text-primary">✕</button>
        </div>
        <div class="space-y-3 text-sm">
          <div *ngIf="viewTemplate()!.hasQr" class="border border-border rounded-lg bg-surface-2 p-2">
            <img [src]="viewTemplate()!.qrImageUrl" alt="Template QR" class="w-full max-h-60 object-contain rounded bg-white">
          </div>
          <div class="rounded-lg border border-border bg-surface-2 p-3 space-y-1 text-xs text-secondary">
            <p><span class="text-muted">Account Holder:</span> {{ viewTemplate()!.accountHolderName || '-' }}</p>
            <p><span class="text-muted">Bank:</span> {{ viewTemplate()!.bankName || '-' }}</p>
            <p><span class="text-muted">Account Number:</span> {{ viewTemplate()!.accountNumber || '-' }}</p>
            <p><span class="text-muted">IFSC:</span> {{ viewTemplate()!.ifsc || '-' }}</p>
            <p><span class="text-muted">Branch:</span> {{ viewTemplate()!.branch || '-' }}</p>
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="confirmTemplateAction()" class="fixed inset-0 z-[95] bg-black/45 backdrop-blur-[1px] flex items-center justify-center p-4">
      <div class="w-full max-w-md rounded-2xl border border-border bg-surface p-5 shadow-xl">
        <h3 class="text-lg font-semibold text-primary mb-1">
          {{ confirmTemplateAction()!.action === 'implement' ? 'Implement template?' : 'Delete template?' }}
        </h3>
        <p class="text-sm text-secondary mb-4">Please confirm this action.</p>
        <div class="flex justify-end gap-2">
          <button (click)="confirmTemplateAction.set(null)" class="px-3 py-2 rounded-lg border border-border text-secondary hover:text-primary">Cancel</button>
          <button
            (click)="runTemplateAction()"
            [disabled]="templateActionBusy()"
            class="px-3 py-2 rounded-lg text-white disabled:opacity-60"
            [ngClass]="confirmTemplateAction()!.action === 'implement' ? 'bg-success hover:bg-success/90' : 'bg-error hover:bg-error/90'">
            {{ templateActionBusy() ? 'Working...' : (confirmTemplateAction()!.action === 'implement' ? 'Implement' : 'Delete') }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class AgentPaymentsComponent implements OnInit, OnDestroy {
  activeTab = signal<PaymentView>('home');
  userOptions = signal<AgentUserOption[]>([]);
  userPickerOpen = signal<boolean>(false);
  userPickerQuery = signal<string>('');
  templates = signal<PaymentTemplate[]>([]);
  templatesLoading = signal<boolean>(false);
  viewTemplate = signal<PaymentTemplate | null>(null);
  confirmTemplateAction = signal<{ template: PaymentTemplate; action: TemplateAction } | null>(null);
  templateActionBusy = signal<boolean>(false);
  transactions = signal<PaymentTransaction[]>([]);
  transactionsLoading = signal<boolean>(false);
  txActionBusyId = signal<string>('');

  selectedUserId = '';
  transactionSearch = '';
  private transactionSearchTimer: number | null = null;

  globalForm = {
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    ifsc: '',
    branch: ''
  };

  userForm = {
    qrImageUrl: '',
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    ifsc: '',
    branch: '',
    startsAtLocal: this.defaultLocalDateTime(),
    validForMinutes: 10
  };

  globalUploading = signal<boolean>(false);
  globalProgress = signal<number>(0);
  userUploading = signal<boolean>(false);
  userProgress = signal<number>(0);
  globalSyncing = signal<boolean>(false);
  globalLoading = signal<boolean>(false);
  globalMessage = signal<string>('');
  globalError = signal<boolean>(false);
  userMessage = signal<string>('');
  userError = signal<boolean>(false);

  globalQrFile: File | null = null;
  userQrFile: File | null = null;
  private globalRefreshTimer: number | null = null;
  private queryParamsSub: Subscription | null = null;

  readonly tabOptions: PaymentTabOption[] = [
    { key: 'global', label: 'Global', helper: 'Main payment setup' },
    { key: 'templates', label: 'Templates', helper: 'Last 24h presets' },
    { key: 'transactions', label: 'Transactions', helper: 'Approvals and proofs' },
    { key: 'user', label: 'User Override', helper: 'Per-user payment sets' },
    { key: 'logs', label: 'Display Logs', helper: 'Shown payment history' }
  ];

  readonly selectedUserOption = computed(() =>
    this.userOptions().find((option) => option.id === this.selectedUserId) || null
  );

  readonly filteredUserOptions = computed(() => {
    const query = this.userPickerQuery().trim().toLowerCase();
    if (!query) {
      return this.userOptions();
    }
    return this.userOptions().filter((user) =>
      user.fullName.toLowerCase().includes(query) || user.id.toLowerCase().includes(query)
    );
  });

  readonly homeActions = computed<PaymentHomeAction[]>(() => [
    {
      key: 'global',
      label: 'Global Payment Settings',
      helper: 'Main QR and bank details used across the platform',
      icon: 'globe'
    },
    {
      key: 'templates',
      label: 'Reusable Templates',
      helper: 'Fast re-use of the last 24 hours of payment setups',
      icon: 'layers'
    },
    {
      key: 'transactions',
      label: 'Transaction Logs',
      helper: 'Approve, deny, or remove submitted payment proofs',
      icon: 'receipt'
    },
    {
      key: 'user',
      label: 'User-Specific Override',
      helper: 'Create isolated payment windows for one selected applicant',
      icon: 'user'
    },
    {
      key: 'logs',
      label: 'Display Logs',
      helper: 'Check when and where payment sets were shown to users',
      icon: 'clock'
    }
  ]);

  readonly isPaymentHome = computed(() => this.activeTab() === 'home');

  constructor(
    private paymentConfigService: PaymentConfigService,
    private agentDataService: AgentDataService,
    private agentUserApiService: AgentUserApiService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.queryParamsSub = this.route.queryParamMap.subscribe((params) => {
      this.syncActiveTabFromQuery(params.get('tab'));
    });

    this.loadUserOptions();
    this.refreshGlobalSets();
    this.loadTemplates();
    this.loadTransactions();
    this.globalRefreshTimer = window.setInterval(() => {
      this.refreshGlobalSets();
      this.loadTemplates();
      if (this.activeTab() === 'user' && this.selectedUserId) {
        this.loadUserSetsForSelectedUser();
      }
      if (this.activeTab() === 'transactions') {
        this.loadTransactions();
      }
    }, 10_000);
  }

  ngOnDestroy(): void {
    this.queryParamsSub?.unsubscribe();
    this.queryParamsSub = null;
    if (this.globalRefreshTimer !== null) {
      window.clearInterval(this.globalRefreshTimer);
      this.globalRefreshTimer = null;
    }
    if (this.transactionSearchTimer !== null) {
      window.clearTimeout(this.transactionSearchTimer);
      this.transactionSearchTimer = null;
    }
  }

  globalSets(): PaymentSet[] {
    return this.paymentConfigService.getGlobalSets();
  }

  userSets(): PaymentSet[] {
    if (!this.selectedUserId) {
      return [];
    }
    return this.paymentConfigService.getUserSets(this.selectedUserId);
  }

  logs(): PaymentDisplayLog[] {
    return this.paymentConfigService.getDisplayLogs();
  }

  createGlobalSet(): void {
    this.globalMessage.set('');
    this.globalError.set(false);

    if (!this.globalQrFile && !this.hasAnyBankInput()) {
      this.globalError.set(true);
      this.globalMessage.set('Upload QR or provide bank details.');
      return;
    }

    if (this.hasAnyBankInput() && !this.isBankComplete(this.globalForm)) {
      this.globalError.set(true);
      this.globalMessage.set('To use bank details, fill holder, bank name, account number and IFSC.');
      return;
    }

    this.globalSyncing.set(true);
    this.paymentConfigService.createGlobalSetFromServer({
      qrFile: this.globalQrFile,
      bank: {
        accountHolderName: this.globalForm.accountHolderName,
        bankName: this.globalForm.bankName,
        accountNumber: this.globalForm.accountNumber,
        ifsc: this.globalForm.ifsc,
        branch: this.globalForm.branch || undefined
      }
    }).subscribe((created) => {
      this.globalSyncing.set(false);
      if (!created) {
        this.globalError.set(true);
        this.globalMessage.set('Global update failed. Please check fields and retry.');
        return;
      }
      this.globalError.set(false);
      this.globalMessage.set('Global payment configuration updated.');
      this.clearGlobalForm();
      this.refreshGlobalSets();
      this.loadTemplates();
    });
  }

  clearGlobalForm(): void {
    this.globalQrFile = null;
    this.globalForm = {
      accountHolderName: '',
      bankName: '',
      accountNumber: '',
      ifsc: '',
      branch: ''
    };
    this.globalUploading.set(false);
    this.globalProgress.set(0);
  }

  createUserSet(): void {
    this.userMessage.set('');
    this.userError.set(false);

    if (!this.selectedUserId) {
      this.userError.set(true);
      this.userMessage.set('Please select a user.');
      return;
    }

    const hasQr = !!this.userQrFile;
    const hasAnyBank = this.hasAnyUserBankInput();
    const hasCompleteBank = this.isBankComplete(this.userForm);

    if (!hasQr && !hasAnyBank) {
      this.userError.set(true);
      this.userMessage.set('Upload QR or provide bank details.');
      return;
    }

    if (hasAnyBank && !hasCompleteBank) {
      this.userError.set(true);
      this.userMessage.set('To use bank details, fill holder, bank name, account number and IFSC.');
      return;
    }

    if (!this.userForm.startsAtLocal) {
      this.userError.set(true);
      this.userMessage.set('Please select a start time.');
      return;
    }

    const validFor = Math.max(1, Number(this.userForm.validForMinutes || 10));
    this.userUploading.set(true);
    this.paymentConfigService.createUserSetFromServer({
      userId: this.selectedUserId,
      qrFile: this.userQrFile,
      bank: {
        accountHolderName: this.userForm.accountHolderName,
        bankName: this.userForm.bankName,
        accountNumber: this.userForm.accountNumber,
        ifsc: this.userForm.ifsc,
        branch: this.userForm.branch || undefined
      },
      validForMinutes: validFor,
      startsAt: this.localToIso(this.userForm.startsAtLocal)
    }).subscribe((created) => {
      this.userUploading.set(false);
      if (!created) {
        this.userError.set(true);
        this.userMessage.set('User-specific payment config failed. Please check fields and retry.');
        return;
      }
      this.userError.set(false);
      this.userMessage.set('User-specific payment config created.');
      this.clearUserForm();
      this.loadUserSetsForSelectedUser();
    });
  }

  toggleSet(set: PaymentSet): void {
    if (set.scope === 'user') {
      this.paymentConfigService.toggleUserSetFromServer(set.id, !set.isActive).subscribe((updated) => {
        if (!updated) return;
        this.loadUserSetsForSelectedUser();
      });
      return;
    }
    this.paymentConfigService.toggleSet(set.id, !set.isActive);
  }

  deleteSet(setId: string): void {
    const set = this.globalSets().find((item) => item.id === setId);
    if (set) {
      if (!confirm('Delete this global payment config?')) return;
      this.paymentConfigService.deleteGlobalSetFromServer(setId).subscribe(() => this.refreshGlobalSets());
      return;
    }
    if (!confirm('Delete this user-specific payment config?')) return;
    this.paymentConfigService.deleteUserSetFromServer(setId).subscribe(() => {
      this.loadUserSetsForSelectedUser();
    });
  }

  loadTemplates(): void {
    this.templatesLoading.set(true);
    this.paymentConfigService.loadTemplatesFromServer().subscribe((items) => {
      this.templates.set(items);
      this.templatesLoading.set(false);
    });
  }

  openTemplateView(template: PaymentTemplate): void {
    this.viewTemplate.set(template);
  }

  openTemplateConfirm(template: PaymentTemplate, action: TemplateAction): void {
    this.confirmTemplateAction.set({ template, action });
  }

  runTemplateAction(): void {
    const action = this.confirmTemplateAction();
    if (!action) return;

    this.templateActionBusy.set(true);
    if (action.action === 'implement') {
      this.paymentConfigService.implementTemplateFromServer(action.template.id).subscribe((set) => {
        this.templateActionBusy.set(false);
        this.confirmTemplateAction.set(null);
        if (set) {
          this.refreshGlobalSets();
        }
      });
      return;
    }

    this.paymentConfigService.deleteTemplateFromServer(action.template.id).subscribe(() => {
      this.templateActionBusy.set(false);
      this.confirmTemplateAction.set(null);
      this.loadTemplates();
    });
  }

  loadTransactions(): void {
    this.transactionsLoading.set(true);
    this.paymentConfigService.getAgentTransactionsFromServer(this.transactionSearch).subscribe((rows) => {
      this.transactions.set(rows);
      this.transactionsLoading.set(false);
    });
  }

  onTransactionSearchChange(): void {
    if (this.transactionSearchTimer !== null) {
      window.clearTimeout(this.transactionSearchTimer);
    }
    this.transactionSearchTimer = window.setTimeout(() => this.loadTransactions(), 250);
  }

  updateTransactionStatus(tx: PaymentTransaction, status: 'verified' | 'rejected'): void {
    this.txActionBusyId.set(tx.id);
    this.paymentConfigService.updateTransactionStatusFromServer(tx.id, status).subscribe((updated) => {
      this.txActionBusyId.set('');
      if (!updated) return;
      this.transactions.update((rows) => rows.map((item) => item.id === tx.id ? updated : item));
    });
  }

  deleteTransaction(tx: PaymentTransaction): void {
    if (!confirm('Delete this transaction history?')) return;
    this.txActionBusyId.set(tx.id);
    this.paymentConfigService.deleteTransactionFromServer(tx.id).subscribe((ok) => {
      this.txActionBusyId.set('');
      if (!ok) return;
      this.transactions.update((rows) => rows.filter((item) => item.id !== tx.id));
    });
  }

  copyText(value: string): void {
    navigator.clipboard.writeText(String(value || '')).catch(() => undefined);
  }

  setActiveTab(tab: PaymentTab): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge'
    });
  }

  openPaymentHome(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: null },
      queryParamsHandling: 'merge'
    });
  }

  openPaymentAction(tab: PaymentTab): void {
    this.setActiveTab(tab);
  }

  openUserPicker(): void {
    this.userPickerQuery.set('');
    this.userPickerOpen.set(true);
  }

  closeUserPicker(): void {
    this.userPickerOpen.set(false);
    this.userPickerQuery.set('');
  }

  selectUserOption(userId: string): void {
    this.selectedUserId = userId;
    this.closeUserPicker();
    this.loadUserSetsForSelectedUser();
  }

  selectedUserLabel(): string {
    const selected = this.selectedUserOption();
    if (!selected) {
      return 'Choose target user';
    }
    return `${selected.fullName} (${selected.id})`;
  }

  setStatus(set: PaymentSet): PaymentSetStatus {
    return this.paymentConfigService.getSetStatus(set);
  }

  statusClass(status: PaymentSetStatus): string {
    if (status === 'active') return 'bg-success/10 text-success';
    if (status === 'scheduled') return 'bg-warning/10 text-warning';
    if (status === 'expired') return 'bg-error/10 text-error';
    return 'bg-surface-3 text-secondary';
  }

  setMethodLabel(set: PaymentSet): string {
    const hasQr = !!String(set.qrImageUrl || '').trim();
    const hasBank = this.isBankComplete(set.bank);
    if (hasQr && hasBank) return 'QR + Bank';
    if (hasQr) return 'QR only';
    if (hasBank) return 'Bank only';
    return 'No method';
  }

  userName(userId: string): string {
    const found = this.userOptions().find((u) => u.id === userId);
    return found ? `${found.fullName} (${userId})` : userId;
  }

  formatDateTime(value: string): string {
    return new Date(value).toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatInr(value: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value || 0);
  }

  onGlobalQrSelected(file: File): void {
    this.globalQrFile = file;
    this.globalUploading.set(true);
    this.globalProgress.set(0);

    const interval = window.setInterval(() => {
      this.globalProgress.update((current) => {
        if (current >= 100) {
          window.clearInterval(interval);
          this.globalUploading.set(false);
          return 100;
        }
        return current + 25;
      });
    }, 120);
  }

  onUserQrSelected(file: File): void {
    this.userQrFile = file;
    this.userUploading.set(true);
    this.userProgress.set(0);

    const interval = window.setInterval(() => {
      this.userProgress.update((current) => {
        if (current >= 100) {
          window.clearInterval(interval);
          this.userUploading.set(false);
          return 100;
        }
        return current + 25;
      });
    }, 120);

    const reader = new FileReader();
    reader.onload = () => {
      this.userForm.qrImageUrl = String(reader.result || '');
    };
    reader.readAsDataURL(file);
  }

  setExpiresAt(set: PaymentSet): string {
    const startMs = new Date(set.startsAt).getTime();
    const expiresAtMs = startMs + (set.validForMinutes || 5) * 60_000;
    return new Date(expiresAtMs).toISOString();
  }

  trackByTemplateId(_index: number, item: PaymentTemplate): string {
    return item.id;
  }

  trackByTransactionId(_index: number, tx: PaymentTransaction): string {
    return tx.id;
  }

  trackByLogId(_index: number, log: PaymentDisplayLog): string {
    return log.id;
  }

  private refreshGlobalSets(): void {
    this.globalLoading.set(true);
    this.paymentConfigService.loadGlobalSetsFromServer().subscribe(() => {
      this.globalLoading.set(false);
    });
  }

  private loadUserOptions(): void {
    this.agentUserApiService.loadUsers(true).subscribe((apiUsers) => {
      const fromApi = apiUsers.map((user) => ({
        id: String(user.id),
        fullName: String(user.full_name || '').trim() || String(user.email || 'User')
      }));

      if (fromApi.length > 0) {
        const sorted = fromApi.sort((a, b) => a.fullName.localeCompare(b.fullName));
        this.userOptions.set(sorted);
        if (!sorted.some((item) => item.id === this.selectedUserId)) {
          this.selectedUserId = sorted[0]?.id || '';
        }
        this.loadUserSetsForSelectedUser();
        return;
      }

      const usersMap = new Map<string, AgentUserOption>();
      this.agentDataService.getApplications().forEach((app) => {
        const user = this.agentDataService.getUserById(app.userId);
        if (user) {
          usersMap.set(user.id, { id: user.id, fullName: user.fullName });
        }
      });
      const users = Array.from(usersMap.values()).sort((a, b) => a.fullName.localeCompare(b.fullName));
      this.userOptions.set(users);
      if (!users.some((item) => item.id === this.selectedUserId)) {
        this.selectedUserId = users[0]?.id || '';
      }
      this.loadUserSetsForSelectedUser();
    });
  }

  private loadUserSetsForSelectedUser(): void {
    if (!this.selectedUserId) {
      return;
    }
    this.paymentConfigService.loadUserSetsFromServer(this.selectedUserId).subscribe();
  }

  private hasAnyBankInput(): boolean {
    return !!(
      this.globalForm.accountHolderName.trim() ||
      this.globalForm.bankName.trim() ||
      this.globalForm.accountNumber.trim() ||
      this.globalForm.ifsc.trim()
    );
  }

  private hasAnyUserBankInput(): boolean {
    return !!(
      this.userForm.accountHolderName.trim() ||
      this.userForm.bankName.trim() ||
      this.userForm.accountNumber.trim() ||
      this.userForm.ifsc.trim()
    );
  }

  private isBankComplete(bank: {
    accountHolderName?: string;
    bankName?: string;
    accountNumber?: string;
    ifsc?: string;
  }): boolean {
    return !!String(bank.accountHolderName || '').trim()
      && !!String(bank.bankName || '').trim()
      && !!String(bank.accountNumber || '').trim()
      && !!String(bank.ifsc || '').trim();
  }

  private localToIso(localDateTime: string): string {
    return new Date(localDateTime).toISOString();
  }

  private clearUserForm(): void {
    this.userQrFile = null;
    this.userForm = {
      qrImageUrl: '',
      accountHolderName: '',
      bankName: '',
      accountNumber: '',
      ifsc: '',
      branch: '',
      startsAtLocal: this.defaultLocalDateTime(),
      validForMinutes: 10
    };
    this.userProgress.set(0);
    this.userUploading.set(false);
  }

  private defaultLocalDateTime(): string {
    const d = new Date();
    d.setSeconds(0, 0);
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60_000);
    return local.toISOString().slice(0, 16);
  }

  private syncActiveTabFromQuery(rawTab: string | null): void {
    const normalized = String(rawTab || '').trim().toLowerCase();
    if (!normalized) {
      this.activeTab.set('home');
      return;
    }

    if (normalized === 'user-config' || normalized === 'user') {
      this.activeTab.set('user');
      return;
    }

    if (normalized === 'global' || normalized === 'templates' || normalized === 'transactions' || normalized === 'logs') {
      this.activeTab.set(normalized as PaymentTab);
      return;
    }

    this.activeTab.set('home');
  }
}
