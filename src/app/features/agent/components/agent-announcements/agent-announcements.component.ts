import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Announcement, AnnouncementService, AnnouncementType } from '../../../../core/services/announcement.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AgentUserApiService } from '../../../../core/services/agent-user-api.service';

@Component({
    selector: 'app-agent-announcements',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="min-h-full bg-[radial-gradient(circle_at_top_left,_rgba(11,39,67,0.08),_transparent_32%),linear-gradient(180deg,#f7f9fc_0%,#eef3f9_100%)] px-4 py-6 md:px-6 lg:px-8">
      <div class="mx-auto w-full max-w-[1320px] space-y-5 pb-24">
        <section class="overflow-hidden rounded-[32px] border border-white/60 bg-white/80 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div class="px-5 py-5 md:px-7 md:py-6">
            <div class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div class="min-w-0">
                <div class="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary/80">
                  Agent Control
                </div>
                <h1 class="mt-3 text-[28px] font-black tracking-tight text-primary md:text-[32px]">Announcement Center</h1>
                <p class="mt-2 max-w-2xl text-[15px] leading-7 text-secondary">
                  Publish high-visibility updates for everyone or target one user without cluttering the chat flow.
                </p>
              </div>

              <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  (click)="refreshAnnouncements()"
                  class="inline-flex h-12 items-center justify-center rounded-2xl border border-border bg-white px-4 text-[14px] font-semibold text-primary transition-colors hover:bg-surface-2 disabled:opacity-60"
                  [disabled]="isLoading() || isSaving()">
                  {{ isLoading() ? 'Refreshing...' : 'Refresh List' }}
                </button>
                <button
                  type="button"
                  (click)="openCreator()"
                  class="inline-flex h-12 items-center justify-center rounded-2xl bg-primary px-5 text-[14px] font-semibold text-white shadow-[0_14px_34px_rgba(11,39,67,0.18)] transition-colors hover:bg-primary-light disabled:opacity-60"
                  [disabled]="isSaving()">
                  {{ isCreating() ? (isEditMode() ? 'Editing Draft' : 'Draft Open') : 'New Announcement' }}
                </button>
              </div>
            </div>

            <div class="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <article class="rounded-[24px] border border-primary/10 bg-[linear-gradient(180deg,rgba(11,39,67,0.05),rgba(11,39,67,0.02))] px-4 py-4">
                <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary">Global Active</p>
                <p class="mt-2 text-[30px] font-black leading-none text-primary">{{ globalCount() }}</p>
                <p class="mt-1 text-[13px] text-secondary">Limit 2 live cards</p>
              </article>
              <article class="rounded-[24px] border border-primary/10 bg-[linear-gradient(180deg,rgba(32,96,160,0.06),rgba(32,96,160,0.025))] px-4 py-4">
                <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary">Private Active</p>
                <p class="mt-2 text-[30px] font-black leading-none text-primary">{{ privateCount() }}</p>
                <p class="mt-1 text-[13px] text-secondary">User-specific notices</p>
              </article>
              <article class="rounded-[24px] border border-primary/10 bg-[linear-gradient(180deg,rgba(18,146,104,0.08),rgba(18,146,104,0.02))] px-4 py-4">
                <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary">Total Live</p>
                <p class="mt-2 text-[30px] font-black leading-none text-primary">{{ announcements().length }}</p>
                <p class="mt-1 text-[13px] text-secondary">Currently visible cards</p>
              </article>
            </div>
          </div>
        </section>

        <section *ngIf="isCreating()" class="overflow-hidden rounded-[32px] border border-white/70 bg-white/85 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div class="flex items-center justify-between gap-3 border-b border-border/80 px-5 py-4 md:px-7">
            <div>
              <h2 class="text-[22px] font-black tracking-tight text-primary">{{ isEditMode() ? 'Edit Announcement' : 'Create Announcement' }}</h2>
              <p class="mt-1 text-[14px] text-secondary">Keep the message short, clear, and immediately actionable.</p>
            </div>
            <button type="button" (click)="cancelCreate()" class="inline-flex h-10 items-center justify-center rounded-2xl border border-border bg-white px-4 text-[14px] font-semibold text-secondary transition-colors hover:bg-surface-2 hover:text-primary">Close</button>
          </div>

          <div class="space-y-5 px-5 py-5 md:px-7 md:py-6">
            <div class="grid grid-cols-2 gap-3">
              <button
                type="button"
                (click)="setType('GLOBAL')"
                class="rounded-[22px] border px-4 py-3 text-[14px] font-semibold transition-all"
                [class.border-primary]="formType() === 'GLOBAL'"
                [class.bg-primary]="formType() === 'GLOBAL'"
                [class.text-white]="formType() === 'GLOBAL'"
                [class.shadow-[0_12px_28px_rgba(11,39,67,0.18)]]="formType() === 'GLOBAL'"
                [class.border-border]="formType() !== 'GLOBAL'"
                [class.bg-surface-2]="formType() !== 'GLOBAL'"
                [class.text-primary]="formType() !== 'GLOBAL'">
                Global
              </button>
              <button
                type="button"
                (click)="setType('PRIVATE')"
                class="rounded-[22px] border px-4 py-3 text-[14px] font-semibold transition-all"
                [class.border-sky-500]="formType() === 'PRIVATE'"
                [class.bg-sky-500]="formType() === 'PRIVATE'"
                [class.text-white]="formType() === 'PRIVATE'"
                [class.shadow-[0_12px_28px_rgba(14,165,233,0.18)]]="formType() === 'PRIVATE'"
                [class.border-border]="formType() !== 'PRIVATE'"
                [class.bg-surface-2]="formType() !== 'PRIVATE'"
                [class.text-primary]="formType() !== 'PRIVATE'">
                Private
              </button>
            </div>

            <div *ngIf="formType() === 'PRIVATE'" class="rounded-[24px] border border-sky-100 bg-sky-50/80 p-4">
              <div class="space-y-3">
                <label class="block text-[14px] font-semibold text-primary">Search User</label>
                <input
                  type="text"
                  [ngModel]="userSearch()"
                  (ngModelChange)="userSearch.set($event)"
                  placeholder="Search by name, mobile, or email"
                  class="h-12 w-full rounded-2xl border border-border bg-white px-4 text-[15px] text-primary focus:outline-none focus:ring-2 focus:ring-sky-500/20">
                <select
                  [(ngModel)]="formTargetUserId"
                  class="h-12 w-full rounded-2xl border border-border bg-white px-4 text-[15px] text-primary focus:outline-none focus:ring-2 focus:ring-sky-500/20">
                  <option value="" disabled>Select user</option>
                  <option *ngFor="let u of filteredAppUsers()" [value]="u.id">
                    {{ u.full_name }} - {{ u.mobile_number || u.email }}
                  </option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div class="space-y-2 lg:col-span-2">
                <label class="block text-[14px] font-semibold text-primary">Title</label>
                <input
                  type="text"
                  [(ngModel)]="formTitle"
                  maxlength="180"
                  placeholder="Urgent: Upload Voter ID"
                  class="h-12 w-full rounded-2xl border border-border bg-surface-2 px-4 text-[15px] text-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
              </div>

              <div class="space-y-2 lg:col-span-2">
                <label class="block text-[14px] font-semibold text-primary">Description</label>
                <textarea
                  [(ngModel)]="formDescription"
                  rows="4"
                  maxlength="3000"
                  placeholder="Tell the user what is needed and why."
                  class="w-full rounded-2xl border border-border bg-surface-2 px-4 py-3 text-[15px] text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y"></textarea>
              </div>

              <div class="space-y-2">
                <label class="block text-[14px] font-semibold text-primary">CTA</label>
                <input
                  type="text"
                  [(ngModel)]="formCtaText"
                  maxlength="80"
                  placeholder="Upload Voter ID"
                  class="h-12 w-full rounded-2xl border border-border bg-surface-2 px-4 text-[15px] text-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
              </div>
              <div class="space-y-2">
                <label class="block text-[14px] font-semibold text-primary">Priority Label</label>
                <input
                  type="text"
                  [(ngModel)]="formPriorityLabel"
                  maxlength="32"
                  placeholder="IMPORTANT"
                  class="h-12 w-full rounded-2xl border border-border bg-surface-2 px-4 text-[15px] text-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
              </div>
            </div>

            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                (click)="cancelCreate()"
                class="inline-flex h-12 items-center justify-center rounded-2xl border border-border bg-white px-5 text-[14px] font-semibold text-secondary transition-colors hover:bg-surface-2 hover:text-primary">
                Cancel
              </button>
              <button
                type="button"
                (click)="submitAnnouncement()"
                [disabled]="!isFormValid() || isSaving()"
                class="inline-flex h-12 items-center justify-center rounded-2xl bg-primary px-5 text-[14px] font-semibold text-white shadow-[0_14px_34px_rgba(11,39,67,0.18)] transition-colors hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-50">
                {{ isSaving() ? 'Saving...' : (isEditMode() ? 'Update Announcement' : 'Publish Announcement') }}
              </button>
            </div>
          </div>
        </section>

        <section class="overflow-hidden rounded-[32px] border border-white/70 bg-white/85 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div class="border-b border-border/80 px-5 py-4 md:px-7">
            <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 class="text-[22px] font-black tracking-tight text-primary">Active Announcements</h2>
                <p class="mt-1 text-[14px] text-secondary">Review current live cards and adjust them without clutter or overlap.</p>
              </div>
              <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  type="text"
                  [ngModel]="listSearchTerm()"
                  (ngModelChange)="listSearchTerm.set($event)"
                  placeholder="Search title, description, or user"
                  class="h-12 w-full min-w-0 rounded-2xl border border-border bg-surface-2 px-4 text-[15px] text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 sm:min-w-[280px]">
                <button
                  type="button"
                  (click)="refreshAnnouncements(listSearchTerm())"
                  class="inline-flex h-12 items-center justify-center rounded-2xl border border-border bg-white px-4 text-[14px] font-semibold text-primary transition-colors hover:bg-surface-2 disabled:opacity-60"
                  [disabled]="isLoading()">
                  Search
                </button>
              </div>
            </div>
          </div>

          <div class="px-5 py-5 md:px-7 md:py-6">
            <div *ngIf="isLoading()" class="rounded-[24px] border border-border bg-surface-2 px-4 py-8 text-center text-[15px] font-medium text-secondary animate-pulse">
              Loading announcements...
            </div>

            <div *ngIf="!isLoading() && announcements().length === 0" class="rounded-[24px] border border-dashed border-border bg-surface-2 px-4 py-12 text-center text-[15px] font-medium text-secondary">
              No active announcements found.
            </div>

            <div *ngIf="!isLoading() && announcements().length > 0" class="space-y-4">
              <article
                *ngFor="let item of announcements()"
                class="overflow-hidden rounded-[28px] border bg-white shadow-[0_18px_42px_rgba(15,23,42,0.06)]"
                [ngClass]="item.type === 'PRIVATE' ? 'border-sky-200/80' : 'border-primary/10'">
                <div class="h-1.5 w-full" [ngClass]="item.type === 'PRIVATE' ? 'bg-sky-500' : 'bg-primary'"></div>
                <div class="space-y-4 px-4 py-4 md:px-5 md:py-5">
                  <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div class="min-w-0 flex-1">
                      <div class="flex flex-wrap items-center gap-2">
                        <span
                          class="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]"
                          [ngClass]="item.type === 'PRIVATE' ? 'bg-sky-50 text-sky-700' : 'bg-primary/5 text-primary'">
                          {{ announcementTypeLabel(item) }}
                        </span>
                        <span *ngIf="item.priorityLabel" class="inline-flex items-center rounded-full bg-surface-2 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary">
                          {{ item.priorityLabel }}
                        </span>
                        <span *ngIf="item.type === 'PRIVATE'" class="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-600">
                          {{ announcementTargetLabel(item) }}
                        </span>
                      </div>

                      <h3 class="mt-3 text-[22px] font-black leading-tight tracking-tight text-primary">{{ item.title }}</h3>
                      <p class="mt-3 max-w-4xl text-[16px] leading-8 text-secondary">{{ item.description }}</p>

                      <div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] font-medium text-tertiary">
                        <span>CTA: {{ item.ctaText }}</span>
                        <span>Updated {{ formatAnnouncementTimestamp(item.updatedAt) }}</span>
                      </div>
                    </div>

                    <div class="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[190px]">
                      <button
                        type="button"
                        (click)="triggerPreviewAction(item)"
                        class="inline-flex h-11 items-center justify-center rounded-2xl border border-border bg-surface-2 px-4 text-[14px] font-semibold text-primary transition-colors hover:bg-surface-3">
                        Preview CTA
                      </button>
                      <button
                        type="button"
                        (click)="startEdit(item)"
                        class="inline-flex h-11 items-center justify-center rounded-2xl border border-border bg-white px-4 text-[14px] font-semibold text-primary transition-colors hover:bg-surface-2">
                        Edit
                      </button>
                      <button
                        type="button"
                        (click)="deleteItem(item.id)"
                        class="inline-flex h-11 items-center justify-center rounded-2xl bg-error px-4 text-[14px] font-semibold text-white transition-colors hover:bg-error/90">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>
      </div>
    </div>
  `
})
export class AgentAnnouncementsComponent implements OnInit {
    private readonly announcementService = inject(AnnouncementService);
    private readonly notificationService = inject(NotificationService);
    private readonly agentUserService = inject(AgentUserApiService);

    readonly announcements = computed(() => this.announcementService.getAllAnnouncements());
    readonly counts = this.announcementService.counts;
    readonly globalCount = computed(() => this.counts().globalActive);
    readonly privateCount = computed(() => this.counts().privateActiveTotal);
    readonly availableAppUsers = computed(() => this.agentUserService.users());

    readonly isCreating = signal(false);
    readonly isLoading = signal(false);
    readonly isSaving = signal(false);
    readonly formType = signal<AnnouncementType>('GLOBAL');
    readonly userSearch = signal('');
    readonly listSearchTerm = signal('');
    readonly editingAnnouncementId = signal<string | null>(null);

    readonly isEditMode = computed(() => !!this.editingAnnouncementId());
    readonly filteredAppUsers = computed(() => {
        const term = this.userSearch().trim().toLowerCase();
        if (!term) {
            return this.availableAppUsers();
        }
        return this.availableAppUsers().filter((u) => {
            const haystack = `${u.full_name} ${u.mobile_number} ${u.email}`.toLowerCase();
            return haystack.includes(term);
        });
    });

    formTargetUserId = '';
    formTitle = '';
    formDescription = '';
    formCtaText = '';
    formPriorityLabel = 'IMPORTANT';

    ngOnInit() {
        if (this.availableAppUsers().length === 0) {
            this.agentUserService.loadUsers().subscribe();
        }
        this.refreshAnnouncements();
    }

    refreshAnnouncements(searchTerm: string = '') {
        this.isLoading.set(true);
        this.announcementService.loadAgentAnnouncements(searchTerm).subscribe({
            complete: () => this.isLoading.set(false)
        });
    }

    openCreator() {
        this.resetForm();
        this.isCreating.set(true);
    }

    cancelCreate() {
        this.resetForm();
        this.isCreating.set(false);
    }

    setType(type: AnnouncementType) {
        this.formType.set(type);
        if (type === 'GLOBAL') {
            this.formTargetUserId = '';
            this.userSearch.set('');
        }
    }

    isFormValid(): boolean {
        if (!this.formTitle.trim() || !this.formDescription.trim() || !this.formCtaText.trim()) {
            return false;
        }
        if (this.formType() === 'PRIVATE' && !String(this.formTargetUserId || '').trim()) {
            return false;
        }
        return true;
    }

    startEdit(item: Announcement) {
        this.isCreating.set(true);
        this.editingAnnouncementId.set(item.id);
        this.formType.set(item.type);
        this.formTargetUserId = item.targetUserId || '';
        this.formTitle = item.title;
        this.formDescription = item.description;
        this.formCtaText = item.ctaText;
        this.formPriorityLabel = item.priorityLabel || 'IMPORTANT';
    }

    submitAnnouncement() {
        if (!this.isFormValid() || this.isSaving()) {
            return;
        }

        const payload = {
            type: this.formType(),
            targetUserId: this.formType() === 'PRIVATE' ? this.formTargetUserId : undefined,
            title: this.formTitle.trim(),
            description: this.formDescription.trim(),
            ctaText: this.formCtaText.trim(),
            priorityLabel: this.formPriorityLabel.trim() || 'IMPORTANT'
        } as Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>;

        this.isSaving.set(true);
        const editId = this.editingAnnouncementId();
        const request$ = editId
            ? this.announcementService.updateAnnouncement(editId, payload)
            : this.announcementService.createAnnouncement(payload);

        request$.subscribe({
            next: (result) => {
                if (!result.success) {
                    this.notificationService.error(result.message || 'Unable to save announcement.');
                    return;
                }
                this.notificationService.success(result.message || 'Announcement saved successfully.');
                this.cancelCreate();
                this.refreshAnnouncements(this.listSearchTerm());
            },
            error: () => this.notificationService.error('Unable to save announcement right now.'),
            complete: () => this.isSaving.set(false)
        });
    }

    deleteItem(id: string) {
        if (!confirm('Are you sure you want to delete this announcement?')) {
            return;
        }

        this.announcementService.deleteAnnouncement(id).subscribe((result) => {
            if (!result.success) {
                this.notificationService.error(result.message || 'Delete failed.');
                return;
            }
            this.notificationService.success(result.message || 'Announcement deleted.');
            this.refreshAnnouncements(this.listSearchTerm());
        });
    }

    triggerPreviewAction(item: Announcement) {
        this.notificationService.show({ message: `CTA Preview: ${item.ctaText}`, type: 'info' });
    }

    announcementTypeLabel(item: Announcement): string {
        return item.type === 'PRIVATE' ? 'Private Notice' : 'Global Notice';
    }

    announcementTargetLabel(item: Announcement): string {
        const name = String(item.targetUserName || '').trim();
        const mobile = String(item.targetUserMobile || '').trim();
        const userId = String(item.targetUserId || '').trim();
        if (name && mobile) {
            return `${name} · ${mobile}`;
        }
        return name || mobile || userId || 'Selected user';
    }

    formatAnnouncementTimestamp(value: number): string {
        const time = Number(value || 0);
        if (!Number.isFinite(time) || time <= 0) {
            return 'recently';
        }

        return new Date(time).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    private resetForm() {
        this.editingAnnouncementId.set(null);
        this.formType.set('GLOBAL');
        this.userSearch.set('');
        this.formTargetUserId = '';
        this.formTitle = '';
        this.formDescription = '';
        this.formCtaText = '';
        this.formPriorityLabel = 'IMPORTANT';
    }
}
