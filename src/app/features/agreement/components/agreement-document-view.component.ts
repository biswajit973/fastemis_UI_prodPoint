import { CommonModule } from '@angular/common';
import { Component, Input, signal } from '@angular/core';
import { AgreementDocumentPayload } from '../../../core/models/agreement.model';
import { AGREEMENT_V1_CLAUSES } from '../agreement-v1-content';

interface MediaPreviewItem {
  type: 'image' | 'video';
  url: string;
  title: string;
  fit: 'cover' | 'contain';
  previewSurface: 'light' | 'dark';
}

@Component({
  selector: 'app-agreement-document-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-container *ngIf="document as doc">
      <div class="space-y-5">
        <section class="overflow-hidden rounded-[30px] border border-primary/10 bg-[linear-gradient(180deg,#0b2743_0%,#14395e_100%)] text-white shadow-[0_22px_60px_rgba(10,37,64,0.18)]">
          <div class="px-5 py-6 md:px-7 md:py-7">
            <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div class="min-w-0">
                <div class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/75">
                  Final Agreement Record
                </div>
                <h2 class="mt-3 text-[26px] font-black tracking-tight text-white md:text-[30px]">{{ heading }}</h2>
                <p *ngIf="subheading" class="mt-2 max-w-2xl text-[15px] leading-7 text-white/78">{{ subheading }}</p>
              </div>

              <div class="flex shrink-0 flex-col gap-2 md:items-end">
                <button
                  *ngIf="showDownloadPdf"
                  type="button"
                  (click)="downloadPdf()"
                  class="inline-flex items-center justify-center rounded-2xl border border-white/18 bg-white/10 px-4 py-3 text-[14px] font-semibold text-white shadow-[0_12px_28px_rgba(8,20,36,0.18)] transition-colors hover:bg-white/16">
                  {{ downloadButtonLabel }}
                </button>
                <div class="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-left md:min-w-[240px]">
                  <div class="text-[11px] uppercase tracking-[0.16em] text-white/60">Agreement ID</div>
                  <div class="mt-1 break-all text-[16px] font-black text-white">{{ doc.agreementId }}</div>
                  <div class="mt-3 text-[11px] uppercase tracking-[0.16em] text-white/60">Executed</div>
                  <div class="mt-1 text-[15px] font-semibold text-white/92">{{ formatDateTime(doc.executedAt) }}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div class="rounded-2xl border border-border bg-surface px-4 py-4 shadow-[0_8px_24px_rgba(10,37,64,0.04)]">
            <div class="text-[11px] uppercase tracking-[0.14em] text-muted">Session ID</div>
            <div class="mt-2 break-all text-[15px] font-semibold text-primary">{{ doc.sessionId }}</div>
          </div>
          <div class="rounded-2xl border border-border bg-surface px-4 py-4 shadow-[0_8px_24px_rgba(10,37,64,0.04)]">
            <div class="text-[11px] uppercase tracking-[0.14em] text-muted">Version</div>
            <div class="mt-2 text-[15px] font-semibold text-primary">{{ doc.agreementVersion || 'agreement-v1' }}</div>
          </div>
          <div class="rounded-2xl border border-border bg-surface px-4 py-4 shadow-[0_8px_24px_rgba(10,37,64,0.04)]">
            <div class="text-[11px] uppercase tracking-[0.14em] text-muted">Consent</div>
            <div class="mt-2 text-[15px] font-semibold" [ngClass]="doc.agreedToAllClauses ? 'text-success' : 'text-warning'">
              {{ doc.agreedToAllClauses ? 'Accepted' : 'Pending' }}
            </div>
          </div>
          <div class="rounded-2xl border border-border bg-surface px-4 py-4 shadow-[0_8px_24px_rgba(10,37,64,0.04)]">
            <div class="text-[11px] uppercase tracking-[0.14em] text-muted">Document Hash</div>
            <div class="mt-2 break-all text-[13px] font-semibold text-primary">{{ doc.documentHash || 'Not available' }}</div>
          </div>
        </section>

        <section class="grid grid-cols-1 gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <article class="rounded-[28px] border border-border bg-surface p-5 shadow-[0_12px_36px_rgba(10,37,64,0.05)]">
            <div class="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 class="text-[20px] font-bold tracking-tight text-primary">Customer Details</h3>
                <p class="mt-1 text-[15px] leading-6 text-secondary">Signed customer identity and contact snapshot at execution time.</p>
              </div>
              <span class="rounded-full bg-surface-2 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary">Readonly</span>
            </div>

            <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div *ngFor="let row of customerRows(doc)" class="rounded-2xl border border-border bg-surface-2 px-4 py-4">
                <div class="text-[11px] uppercase tracking-[0.14em] text-muted">{{ row.label }}</div>
                <div class="mt-1 whitespace-pre-line break-words text-[16px] font-semibold leading-7 text-primary">{{ row.value }}</div>
              </div>
            </div>
          </article>

          <article class="rounded-[28px] border border-border bg-surface p-5 shadow-[0_12px_36px_rgba(10,37,64,0.05)]">
            <div class="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 class="text-[20px] font-bold tracking-tight text-primary">Execution Evidence</h3>
                <p class="mt-1 text-[15px] leading-6 text-secondary">Browser and network details captured at final execution.</p>
              </div>
              <span class="rounded-full bg-surface-2 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary">Server Captured</span>
            </div>

            <div class="space-y-3">
              <div *ngFor="let row of executionRows(doc)" class="rounded-2xl border border-border bg-surface-2 px-4 py-4">
                <div class="text-[11px] uppercase tracking-[0.14em] text-muted">{{ row.label }}</div>
                <div class="mt-1 break-words text-[15px] font-semibold leading-7 text-primary">{{ row.value }}</div>
              </div>
            </div>
          </article>
        </section>

        <section class="rounded-[28px] border border-border bg-surface p-5 shadow-[0_12px_36px_rgba(10,37,64,0.05)]">
          <div class="mb-4">
            <h3 class="text-[20px] font-bold tracking-tight text-primary">Uploaded Evidence</h3>
            <p class="mt-1 text-[15px] leading-6 text-secondary">The exact media linked to this agreement execution record.</p>
          </div>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div *ngFor="let media of evidenceCards(doc)" class="rounded-[24px] border border-border bg-surface-2 p-3">
              <div class="mb-2 flex items-center justify-between gap-2">
                <div>
                  <div class="text-[11px] uppercase tracking-[0.14em] text-muted">{{ media.badge }}</div>
                  <h4 class="mt-1 text-[16px] font-semibold text-primary">{{ media.title }}</h4>
                </div>
                <span class="rounded-full px-2.5 py-1 text-[11px] font-semibold" [ngClass]="media.url ? 'border border-success/20 bg-success/10 text-success' : 'border border-border bg-surface text-secondary'">
                  {{ media.url ? 'Available' : 'Missing' }}
                </span>
              </div>

              <div class="overflow-hidden rounded-[20px] border border-border bg-white">
                <ng-container [ngSwitch]="media.type">
                  <button
                    *ngSwitchCase="'image'"
                    type="button"
                    class="block w-full"
                    [disabled]="!media.url"
                    (click)="openPreview('image', media.url, media.title, media.fit, media.previewSurface)">
                    <img
                      *ngIf="media.url && !mediaFailed(media.url); else missingMedia"
                      [src]="media.url"
                      [alt]="media.title"
                      (error)="markMediaFailed(media.url)"
                      loading="lazy"
                      decoding="async"
                      [class.p-3]="media.fit === 'contain'"
                      [class.bg-white]="media.previewSurface === 'light'"
                      [class.object-contain]="media.fit === 'contain'"
                      [class.object-cover]="media.fit === 'cover'"
                      class="h-[220px] w-full" />
                  </button>
                  <div *ngSwitchCase="'video'" class="bg-black">
                    <video
                      *ngIf="media.url && !mediaFailed(media.url); else missingMedia"
                      [src]="media.url"
                      (error)="markMediaFailed(media.url)"
                      controls
                      preload="metadata"
                      [class.object-contain]="media.fit === 'contain'"
                      [class.object-cover]="media.fit === 'cover'"
                      class="h-[220px] w-full bg-black"></video>
                  </div>
                </ng-container>
                <ng-template #missingMedia>
                  <div class="flex h-[220px] items-center justify-center bg-surface-3 px-4 text-center text-[14px] text-secondary">
                    Media preview not available.
                  </div>
                </ng-template>
              </div>

              <div class="mt-3 flex items-center gap-2">
                <button
                  *ngIf="media.url && media.type === 'image'"
                  type="button"
                  (click)="openPreview('image', media.url, media.title, media.fit, media.previewSurface)"
                  class="inline-flex items-center justify-center rounded-xl border border-border px-3 py-2 text-[14px] font-semibold text-primary transition-colors hover:bg-surface">
                  Preview
                </button>
                <a
                  *ngIf="media.url"
                  [href]="media.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center justify-center rounded-xl border border-border px-3 py-2 text-[14px] font-semibold text-primary no-underline transition-colors hover:bg-surface">
                  Open
                </a>
              </div>
            </div>
          </div>
        </section>

        <section class="rounded-[28px] border border-border bg-[#fffef9] p-5 shadow-[0_12px_36px_rgba(10,37,64,0.05)]">
          <div class="mb-4">
            <h3 class="text-[20px] font-bold tracking-tight text-primary">Agreement Clauses</h3>
            <p class="mt-1 text-[15px] leading-6 text-secondary">All 28 clauses accepted during this signed agreement execution.</p>
          </div>

          <div class="space-y-3">
            <article
              *ngFor="let clause of clauses"
              class="rounded-[22px] border border-[#e8ddc7] bg-white px-4 py-4 shadow-[0_6px_18px_rgba(10,37,64,0.04)]">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <div class="inline-flex items-center rounded-full bg-primary/5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                    Clause {{ clause.number }}
                  </div>
                  <h4 class="mt-3 text-[17px] font-bold leading-7 text-primary agreement-document-reading">{{ clause.title }}</h4>
                </div>
                <div class="flex h-8 min-w-8 items-center justify-center rounded-full border border-primary/12 bg-primary/5 px-2 text-[11px] font-black text-primary">
                  {{ clause.number }}
                </div>
              </div>
              <p class="mt-3 whitespace-pre-line text-[16px] leading-8 text-secondary agreement-document-reading">{{ clause.body }}</p>
            </article>
          </div>
        </section>
      </div>

      <div *ngIf="previewItem() as preview" class="fixed inset-0 z-[95] bg-black/85 p-4">
        <div class="mx-auto flex h-full max-w-5xl flex-col">
          <div class="mb-3 flex items-center justify-between gap-3 text-white">
            <div class="min-w-0">
              <div class="text-[18px] font-semibold truncate">{{ preview.title }}</div>
              <div class="text-[13px] text-white/70 truncate">{{ preview.url }}</div>
            </div>
            <button
              type="button"
              (click)="closePreview()"
              class="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white transition-colors hover:bg-white/20">
              ✕
            </button>
          </div>

          <div
            class="flex-1 overflow-auto rounded-[28px] border p-3"
            [ngClass]="preview.previewSurface === 'dark'
              ? 'border-white/15 bg-black/35'
              : 'border-slate-200 bg-white'">
            <div class="flex min-h-full items-center justify-center">
              <img
                *ngIf="preview.type === 'image'"
                [src]="preview.url"
                [alt]="preview.title"
                class="max-h-full max-w-full rounded-2xl object-contain" />
              <video
                *ngIf="preview.type === 'video'"
                [src]="preview.url"
                controls
                autoplay
                class="max-h-full max-w-full rounded-2xl bg-black"></video>
            </div>
          </div>
        </div>
      </div>
    </ng-container>
  `,
  styles: [`
    .agreement-document-reading {
      font-family: "Georgia", "Times New Roman", serif;
    }
  `]
})
export class AgreementDocumentViewComponent {
  @Input() document: AgreementDocumentPayload | null = null;
  @Input() heading = 'Fastemis EMI Agreement';
  @Input() subheading = 'Signed agreement record with customer details, execution evidence, uploads, and accepted clauses.';
  @Input() showDownloadPdf = false;
  @Input() downloadButtonLabel = 'Download PDF';

  readonly clauses = AGREEMENT_V1_CLAUSES;
  readonly previewItem = signal<MediaPreviewItem | null>(null);
  private readonly failedMediaUrls = signal<Record<string, true>>({});

  customerRows(doc: AgreementDocumentPayload): Array<{ label: string; value: string }> {
    const addressParts = [
      doc.customer.address.fullAddress,
      doc.customer.address.city,
      doc.customer.address.pincode
    ].filter(Boolean);

    return [
      { label: 'Full Name', value: doc.customer.fullName || 'Not provided' },
      { label: 'Mobile Number', value: doc.customer.mobileNumber || 'Not provided' },
      { label: 'Email Address', value: doc.customer.email || 'Not provided' },
      { label: 'Device Code', value: doc.customer.deviceCode || 'Not provided' },
      { label: 'Requested Amount', value: doc.customer.requestedAmount || 'Not provided' },
      { label: 'Employment Type', value: doc.customer.employmentType || 'Not provided' },
      { label: 'Occupation', value: doc.customer.whatYouDo || 'Not provided' },
      { label: 'Monthly Salary', value: doc.customer.monthlySalary || 'Not provided' },
      { label: 'Marital Status', value: doc.customer.maritalStatus || 'Not provided' },
      { label: 'Spouse Occupation', value: doc.customer.spouseOccupation || 'Not provided' },
      { label: 'Aadhaar Number', value: doc.customer.aadharNumber || 'Not provided' },
      { label: 'PAN Number', value: doc.customer.panNumber || 'Not provided' },
      { label: 'Address', value: addressParts.length ? addressParts.join(', ') : 'Not provided' }
    ];
  }

  executionRows(doc: AgreementDocumentPayload): Array<{ label: string; value: string }> {
    return [
      { label: 'IP Address', value: doc.execution.ipAddress || 'Not captured' },
      { label: 'Browser Name', value: doc.execution.browserName || 'Not captured' },
      { label: 'Browser Version', value: doc.execution.browserVersion || 'Not captured' },
      { label: 'Operating System', value: doc.execution.operatingSystem || 'Not captured' },
      { label: 'Browser Language', value: doc.execution.browserLanguage || 'Not captured' },
      { label: 'Browser Timezone', value: doc.execution.browserTimezone || 'Not captured' },
      { label: 'User Agent', value: doc.execution.userAgent || 'Not captured' }
    ];
  }

  evidenceCards(doc: AgreementDocumentPayload): Array<{
    badge: string;
    title: string;
    type: 'image' | 'video';
    url: string;
    fit: 'cover' | 'contain';
    previewSurface: 'light' | 'dark';
  }> {
    return [
      { badge: 'Customer Photo', title: 'Live Photo', type: 'image', url: doc.evidence.livePhotoUrl || '', fit: 'contain', previewSurface: 'light' },
      { badge: 'Identity Proof', title: 'Aadhaar Card', type: 'image', url: doc.evidence.aadharImageUrl || '', fit: 'contain', previewSurface: 'light' },
      { badge: 'Identity Proof', title: 'PAN Card', type: 'image', url: doc.evidence.pancardImageUrl || '', fit: 'contain', previewSurface: 'light' },
      { badge: 'Signed Proof', title: 'Digital Signature', type: 'image', url: doc.evidence.signatureUrl || '', fit: 'contain', previewSurface: 'light' },
      { badge: 'Consent Proof', title: 'Consent Video', type: 'video', url: doc.evidence.consentVideoUrl || '', fit: 'contain', previewSurface: 'dark' }
    ];
  }

  openPreview(type: 'image' | 'video', url: string, title: string, fit: 'cover' | 'contain' = 'contain', previewSurface: 'light' | 'dark' = 'light'): void {
    if (!url) {
      return;
    }
    this.previewItem.set({ type, url, title, fit, previewSurface });
  }

  closePreview(): void {
    this.previewItem.set(null);
  }

  mediaFailed(url: string): boolean {
    return !!url && !!this.failedMediaUrls()[url];
  }

  markMediaFailed(url: string): void {
    if (!url || this.failedMediaUrls()[url]) {
      return;
    }
    this.failedMediaUrls.update((current) => ({ ...current, [url]: true }));
  }

  formatDateTime(value: string | null): string {
    if (!value) {
      return 'Not captured';
    }
    return new Date(value).toLocaleString([], {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  downloadPdf(): void {
    const doc = this.document;
    if (!doc || typeof window === 'undefined') {
      return;
    }

    const printWindow = window.open('', '_blank', 'width=1180,height=900');
    if (!printWindow) {
      return;
    }

    const customerRows = this.customerRows(doc)
      .map((row) => `<div class="row"><div class="label">${this.escapeHtml(row.label)}</div><div class="value">${this.escapeHtml(row.value)}</div></div>`)
      .join('');

    const executionRows = this.executionRows(doc)
      .map((row) => `<div class="row"><div class="label">${this.escapeHtml(row.label)}</div><div class="value">${this.escapeHtml(row.value)}</div></div>`)
      .join('');

    const evidenceRows = this.evidenceCards(doc)
      .map((item) => item.type === 'image' && item.url
        ? `<div class="evidence-card"><div class="evidence-label">${this.escapeHtml(item.title)}</div><div class="evidence-frame evidence-frame--light"><img class="evidence-image evidence-image--${this.escapeHtml(item.fit)}" src="${this.escapeHtml(this.absoluteUrl(item.url))}" alt="${this.escapeHtml(item.title)}" /></div></div>`
        : `<div class="evidence-card"><div class="evidence-label">${this.escapeHtml(item.title)}</div><div class="video-link">${item.url ? `<a href="${this.escapeHtml(this.absoluteUrl(item.url))}" target="_blank" rel="noopener noreferrer">Open consent video</a>` : 'Media not available.'}</div></div>`)
      .join('');

    const clausesRows = this.clauses
      .map((clause) => `
        <article class="clause">
          <div class="clause-number">Clause ${clause.number}</div>
          <h3>${this.escapeHtml(clause.title)}</h3>
          <p>${this.escapeHtml(clause.body)}</p>
        </article>
      `)
      .join('');

    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${this.escapeHtml(doc.agreementId)} - Fastemis Agreement</title>
          <style>
            * { box-sizing: border-box; }
            body { margin: 0; padding: 24px; background: #f4f7fb; color: #0a2540; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
            .page { max-width: 1080px; margin: 0 auto; background: white; border: 1px solid #dbe3ee; border-radius: 22px; padding: 32px; }
            .hero { background: linear-gradient(180deg, #0b2743 0%, #14395e 100%); color: white; border-radius: 22px; padding: 28px; }
            .hero h1 { margin: 12px 0 8px; font-size: 28px; line-height: 1.15; }
            .meta { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-top: 18px; }
            .meta-card, .panel { border: 1px solid #dbe3ee; border-radius: 18px; background: #fff; padding: 16px; }
            .meta-card .label, .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: #5c7086; }
            .meta-card .value, .value { margin-top: 8px; font-size: 14px; font-weight: 600; line-height: 1.6; word-break: break-word; }
            .grid { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 16px; margin-top: 18px; }
            .row { padding: 12px 0; border-bottom: 1px solid #edf2f8; }
            .row:last-child { border-bottom: 0; }
            .section-title { margin: 0 0 6px; font-size: 20px; }
            .section-subtitle { margin: 0 0 14px; font-size: 14px; color: #5c7086; }
            .evidence-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; margin-top: 18px; }
            .evidence-card { border: 1px solid #dbe3ee; border-radius: 18px; padding: 14px; }
            .evidence-label { font-size: 13px; font-weight: 700; margin-bottom: 10px; }
            .evidence-frame { width: 100%; height: 240px; border-radius: 14px; border: 1px solid #edf2f8; overflow: hidden; }
            .evidence-frame--light { background: linear-gradient(180deg, #ffffff 0%, #f7fbff 100%); }
            .evidence-image { width: 100%; height: 100%; display: block; }
            .evidence-image--cover { object-fit: cover; }
            .evidence-image--contain { object-fit: contain; object-position: center; padding: 12px; }
            .video-link { min-height: 90px; display: flex; align-items: center; justify-content: center; background: #f8fbff; border-radius: 14px; border: 1px solid #edf2f8; }
            .video-link a { color: #0a2540; text-decoration: none; font-weight: 600; }
            .clauses { margin-top: 18px; }
            .clause { border: 1px solid #e8ddc7; border-radius: 18px; padding: 18px; margin-bottom: 12px; background: #fffef9; }
            .clause-number { display: inline-block; padding: 6px 10px; border-radius: 999px; background: #edf5ff; color: #0a2540; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; }
            .clause h3 { margin: 12px 0 10px; font-size: 16px; font-family: Georgia, "Times New Roman", serif; }
            .clause p { margin: 0; font-size: 14px; line-height: 1.8; color: #41566e; white-space: pre-line; font-family: Georgia, "Times New Roman", serif; }
            @media print {
              body { background: white; padding: 0; }
              .page { border: 0; border-radius: 0; }
            }
          </style>
        </head>
        <body>
          <div class="page">
            <section class="hero">
              <div class="label" style="color: rgba(255,255,255,0.72)">Final Agreement Record</div>
              <h1>${this.escapeHtml(this.heading)}</h1>
              <div style="font-size: 15px; line-height: 1.7; color: rgba(255,255,255,0.82)">${this.escapeHtml(this.subheading)}</div>
              <div class="meta">
                <div class="meta-card"><div class="label">Agreement ID</div><div class="value">${this.escapeHtml(doc.agreementId)}</div></div>
                <div class="meta-card"><div class="label">Executed</div><div class="value">${this.escapeHtml(this.formatDateTime(doc.executedAt))}</div></div>
                <div class="meta-card"><div class="label">Session ID</div><div class="value">${this.escapeHtml(doc.sessionId)}</div></div>
                <div class="meta-card"><div class="label">Document Hash</div><div class="value">${this.escapeHtml(doc.documentHash || 'Not available')}</div></div>
              </div>
            </section>

            <div class="grid">
              <section class="panel">
                <h2 class="section-title">Customer Details</h2>
                <p class="section-subtitle">Execution-time customer identity and contact snapshot.</p>
                ${customerRows}
              </section>
              <section class="panel">
                <h2 class="section-title">Execution Evidence</h2>
                <p class="section-subtitle">Technical details captured during final submit.</p>
                ${executionRows}
              </section>
            </div>

            <section class="panel" style="margin-top: 18px;">
              <h2 class="section-title">Uploaded Evidence</h2>
              <p class="section-subtitle">Files linked to this agreement execution.</p>
              <div class="evidence-grid">${evidenceRows}</div>
            </section>

            <section class="panel clauses">
              <h2 class="section-title">Agreement Clauses</h2>
              <p class="section-subtitle">All 28 clauses accepted by the customer.</p>
              ${clausesRows}
            </section>
          </div>
          <script>
            window.addEventListener('load', function () {
              setTimeout(function () {
                window.print();
              }, 350);
            });
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  }

  private escapeHtml(value: string): string {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private absoluteUrl(url: string): string {
    const raw = String(url || '').trim();
    if (!raw) {
      return '';
    }
    if (/^https?:\/\//i.test(raw)) {
      return raw;
    }
    if (typeof window === 'undefined') {
      return raw;
    }
    return new URL(raw, window.location.origin).toString();
  }
}
