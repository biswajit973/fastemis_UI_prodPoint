import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AgentUserSummary } from '../../core/models/agent-user.model';
import { AgreementApiService } from '../../core/services/agreement-api.service';
import { AgentUserApiService } from '../../core/services/agent-user-api.service';

@Component({
  selector: 'app-agent-agreements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mx-auto max-w-6xl px-4 pb-10 sm:px-6 lg:px-8">
      <div class="mb-6">
        <h1 class="text-2xl md:text-3xl font-display font-bold text-primary mb-1">Agreement Control</h1>
        <p class="text-secondary text-sm">One fixed Fastemis agreement flow. Control user access, reset submissions, and manage the signed-document lifecycle.</p>
      </div>

      <section class="mb-6 rounded-[28px] border border-primary/10 bg-[linear-gradient(180deg,#0b2743_0%,#14395e_100%)] p-5 text-white shadow-[0_20px_60px_rgba(10,37,64,0.18)]">
        <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div class="min-w-0">
            <div class="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/75">
              Current Agreement Model
            </div>
            <h2 class="mt-3 text-[24px] font-black tracking-tight md:text-[28px]">Single signed agreement with one final document record</h2>
            <p class="mt-2 max-w-2xl text-[15px] leading-7 text-white/78">
              Users now complete one fixed 28-clause agreement, sign digitally, upload one consent video, and then see a final signed document view. There is no question bank and no Agreement 2 flow on the customer side anymore.
            </p>
          </div>
          <div class="rounded-[24px] border border-white/15 bg-white/10 p-4 md:min-w-[240px]">
            <div class="text-[11px] uppercase tracking-[0.16em] text-white/60">Agent controls left</div>
            <ul class="mt-2 space-y-2 text-[14px] leading-6 text-white/88">
              <li>Enable or disable agreement tab per user</li>
              <li>Reset a signed agreement when re-execution is needed</li>
              <li>Review final signed document in user profile details</li>
            </ul>
          </div>
        </div>
      </section>

      <section class="rounded-[28px] border border-border bg-surface p-5 shadow-[0_12px_36px_rgba(10,37,64,0.05)]">
        <div class="mb-5">
          <h2 class="text-[20px] font-bold tracking-tight text-primary">Per-user agreement access</h2>
          <p class="mt-1 text-[15px] leading-6 text-secondary">Choose a user, control whether they can open the agreement page, and reset the signed record if you need the user to sign again.</p>
        </div>

        <div class="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_320px]">
          <div class="space-y-4">
            <div>
              <label class="mb-2 block text-[13px] font-semibold text-secondary">Select User</label>
              <select
                [ngModel]="selectedUserId()"
                (ngModelChange)="selectedUserId.set($event)"
                class="w-full rounded-2xl border border-border bg-surface-2 px-4 py-3 text-[15px] text-primary focus:border-primary focus:outline-none">
                <option value="">Choose a user</option>
                <option *ngFor="let user of users()" [value]="user.id">
                  {{ displayName(user) }} ({{ user.id }})
                </option>
              </select>
            </div>

            <div *ngIf="selectedUser() as user" class="rounded-[24px] border border-border bg-surface-2 p-4">
              <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <div class="text-[18px] font-semibold text-primary">{{ displayName(user) }}</div>
                  <div class="mt-1 text-[14px] text-secondary">{{ user.email }}{{ user.mobile_number ? ' • ' + user.mobile_number : '' }}</div>
                </div>
                <div class="rounded-full px-3 py-1 text-[12px] font-semibold"
                  [ngClass]="selectedUserAgreementEnabled() ? 'border border-success/20 bg-success/10 text-success' : 'border border-warning/20 bg-warning/10 text-warning'">
                  {{ selectedUserAgreementEnabled() ? 'Agreement Enabled' : 'Agreement Disabled' }}
                </div>
              </div>

              <div class="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                <div class="rounded-2xl border border-border bg-surface px-4 py-4">
                  <div class="text-[11px] uppercase tracking-[0.14em] text-muted">Signed At</div>
                  <div class="mt-1 text-[15px] font-semibold text-primary">{{ formatDateTime(user.agreement_completed_at || null) }}</div>
                </div>
                <div class="rounded-2xl border border-border bg-surface px-4 py-4">
                  <div class="text-[11px] uppercase tracking-[0.14em] text-muted">Profile Progress</div>
                  <div class="mt-1 text-[15px] font-semibold text-primary">{{ user.profile_progress }}%</div>
                </div>
              </div>
            </div>
          </div>

          <div class="rounded-[24px] border border-border bg-surface-2 p-4">
            <div class="text-[16px] font-semibold text-primary">Actions</div>
            <p class="mt-1 text-[14px] leading-6 text-secondary">These actions affect only the selected user.</p>

            <div class="mt-4 flex flex-col gap-3">
              <button
                type="button"
                (click)="toggleUserAgreementVisibility()"
                [disabled]="!selectedUserId() || actionBusy()"
                class="inline-flex min-h-[48px] items-center justify-center rounded-2xl border px-4 py-3 text-[14px] font-semibold transition-colors disabled:opacity-50"
                [ngClass]="selectedUserAgreementEnabled() ? 'border-warning text-warning hover:bg-warning/10' : 'border-success text-success hover:bg-success/10'">
                {{ actionBusy() ? 'Saving...' : (selectedUserAgreementEnabled() ? 'Disable Agreement Tab' : 'Enable Agreement Tab') }}
              </button>

              <button
                type="button"
                (click)="resetUserAgreement()"
                [disabled]="!selectedUserId() || actionBusy()"
                class="inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-error px-4 py-3 text-[14px] font-semibold text-error transition-colors hover:bg-error/10 disabled:opacity-50">
                {{ actionBusy() ? 'Resetting...' : 'Reset Signed Agreement' }}
              </button>
            </div>

            <div *ngIf="message()" class="mt-4 rounded-2xl border px-4 py-3 text-[14px] leading-6"
              [ngClass]="messageError() ? 'border-error/25 bg-error/10 text-error' : 'border-success/25 bg-success/10 text-success'">
              {{ message() }}
            </div>
          </div>
        </div>
      </section>
    </div>
  `
})
export class AgentAgreementsComponent implements OnInit {
  readonly users = signal<AgentUserSummary[]>([]);
  readonly selectedUserId = signal('');
  readonly actionBusy = signal(false);
  readonly message = signal('');
  readonly messageError = signal(false);

  readonly selectedUser = computed(() => {
    const selectedId = this.selectedUserId();
    return this.users().find((user) => String(user.id) === String(selectedId)) || null;
  });

  constructor(
    private agreementApi: AgreementApiService,
    private agentUsersApi: AgentUserApiService
  ) {}

  ngOnInit(): void {
    this.agentUsersApi.loadUsers(true).subscribe((users) => {
      this.users.set(users);
    });
  }

  displayName(user: AgentUserSummary): string {
    return String(user.full_name || '').trim() || 'Not filled yet';
  }

  selectedUserAgreementEnabled(): boolean {
    return !!this.selectedUser()?.agreement_tab_enabled;
  }

  formatDateTime(value: string | null): string {
    if (!value) {
      return 'Not signed yet';
    }
    return new Date(value).toLocaleString([], {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  toggleUserAgreementVisibility(): void {
    const user = this.selectedUser();
    if (!user) {
      return;
    }

    this.actionBusy.set(true);
    this.message.set('');
    const nextEnabled = !this.selectedUserAgreementEnabled();
    this.agreementApi.setUserAgreementVisibility(String(user.id), nextEnabled).subscribe((ok) => {
      this.actionBusy.set(false);
      if (!ok) {
        this.messageError.set(true);
        this.message.set('Could not update agreement visibility. Please retry.');
        return;
      }

      this.users.update((rows) => rows.map((row) => (
        String(row.id) === String(user.id)
          ? { ...row, agreement_tab_enabled: nextEnabled }
          : row
      )));
      this.messageError.set(false);
      this.message.set(nextEnabled ? 'Agreement tab enabled for this user.' : 'Agreement tab disabled for this user.');
    });
  }

  resetUserAgreement(): void {
    const user = this.selectedUser();
    if (!user) {
      return;
    }
    if (!confirm(`Reset the signed agreement for ${this.displayName(user)}? This will remove signature, consent video, and signed record.`)) {
      return;
    }

    this.actionBusy.set(true);
    this.message.set('');
    this.agreementApi.resetUserAgreements(String(user.id)).subscribe((ok) => {
      this.actionBusy.set(false);
      if (!ok) {
        this.messageError.set(true);
        this.message.set('Could not reset this agreement. Please retry.');
        return;
      }

      this.users.update((rows) => rows.map((row) => (
        String(row.id) === String(user.id)
          ? { ...row, agreement_completed_at: null }
          : row
      )));
      this.messageError.set(false);
      this.message.set('Signed agreement reset successfully. The user can now execute it again.');
    });
  }
}
