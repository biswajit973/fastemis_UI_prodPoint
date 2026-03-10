import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApplicationService } from '../../core/services/application.service';
import { NotificationService } from '../../core/services/notification.service';
import { AgreementApiService } from '../../core/services/agreement-api.service';
import { AuthService, BackendUserProfileResponse } from '../../core/services/auth.service';
import { AgreementDocumentPayload } from '../../core/models/agreement.model';
import { ScreenshotBlockDirective } from '../../shared/directives/screenshot-block.directive';
import { AgreementConsentVideoModalComponent } from './components/agreement-consent-video-modal.component';
import { AgreementDocumentViewComponent } from './components/agreement-document-view.component';
import {
  AGREEMENT_V1_AGREEMENT_ID_STEPS,
  AGREEMENT_V1_CLAUSES,
  AGREEMENT_V1_VIDEO_GUIDELINES,
  AGREEMENT_V1_VIDEO_POWER_POINTS
} from './agreement-v1-content';

interface AgreementV1EnvironmentState {
  ipAddress: string;
  finalSubmissionTimestamp: string;
  sessionId: string;
  agreementId: string;
  userAgent: string;
  browserName: string;
  browserVersion: string;
  operatingSystem: string;
  browserLanguage: string;
  browserTimezone: string;
}

@Component({
  selector: 'app-agreement',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AgreementConsentVideoModalComponent,
    AgreementDocumentViewComponent
  ],
  hostDirectives: [ScreenshotBlockDirective],
  template: `
    <div class="min-h-screen bg-surface-2 flex flex-col">
      <header class="sticky top-0 z-50 border-b border-border bg-surface/90 backdrop-blur-xl shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
        <div class="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 md:px-6">
          <div class="flex items-center gap-3 min-w-0">
            <button
              type="button"
              (click)="goBack()"
              class="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface-2 text-secondary transition-colors hover:bg-surface-3 hover:text-primary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            </button>
            <div class="min-w-0">
              <div class="truncate text-[18px] font-black tracking-tight text-primary md:text-[20px]">Fastemis Agreement</div>
              <div class="text-[13px] text-secondary">Review, sign, record consent, and keep one final legal record.</div>
            </div>
          </div>
          <div class="rounded-full border border-success/30 bg-success/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-success">Secure</div>
        </div>
      </header>

      <div class="border-b border-border bg-surface-3 px-4 py-3 md:px-6">
        <div class="mx-auto flex max-w-6xl items-start gap-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="mt-0.5 shrink-0 text-primary" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          <p class="text-[13px] leading-5 text-secondary">For security, screenshots and screen recording are disabled on this page.</p>
        </div>
      </div>

      <main class="flex-1 px-4 py-5 md:px-6 md:py-8">
        <div class="mx-auto max-w-6xl">
          <div *ngIf="loading()" class="rounded-[28px] border border-border bg-surface p-10 flex items-center justify-center">
            <div class="h-10 w-10 rounded-full border-4 border-surface-3 border-t-primary animate-spin"></div>
          </div>

          <section *ngIf="!loading() && !agreementEnabled()" class="rounded-[28px] border border-warning/35 bg-warning/10 p-5 md:p-6">
            <h2 class="text-[22px] font-bold text-primary">Agreement is not enabled yet</h2>
            <p class="mt-2 text-[16px] leading-7 text-secondary">Support has not enabled the agreement tab for your account yet. Please check later.</p>
          </section>

          <ng-container *ngIf="!loading() && agreementEnabled()">
            <ng-container *ngIf="agreementComplete(); else agreementFormBlock">
              <div *ngIf="documentLoading()" class="rounded-[28px] border border-border bg-surface p-10 flex items-center justify-center">
                <div class="h-10 w-10 rounded-full border-4 border-surface-3 border-t-primary animate-spin"></div>
              </div>

              <section *ngIf="!documentLoading() && agreementDocument()" class="space-y-5">
                <app-agreement-document-view
                  [document]="agreementDocument()"
                  heading="Signed Fastemis EMI Agreement"
                  subheading="This is your final agreement record with identity details, execution evidence, uploaded documents, consent video, signature, and the full accepted clauses.">
                </app-agreement-document-view>
              </section>

              <section *ngIf="!documentLoading() && !agreementDocument()" class="rounded-[28px] border border-warning/35 bg-warning/10 p-5 md:p-6">
                <h2 class="text-[22px] font-bold text-primary">Agreement completed</h2>
                <p class="mt-2 text-[16px] leading-7 text-secondary">The signed document could not be loaded right now. Refresh once and try again.</p>
                <div class="mt-4">
                  <button
                    type="button"
                    (click)="loadAgreementDocument()"
                    class="inline-flex items-center justify-center rounded-2xl bg-primary px-4 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-primary-light">
                    Refresh Document
                  </button>
                </div>
              </section>
            </ng-container>

            <ng-template #agreementFormBlock>
              <section class="overflow-hidden rounded-[30px] border border-primary/10 bg-[linear-gradient(180deg,#0b2743_0%,#14395e_100%)] text-white shadow-[0_20px_60px_rgba(10,37,64,0.18)]">
                <div class="px-5 py-6 md:px-7 md:py-7">
                  <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div class="min-w-0">
                      <div class="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/75">
                        Step 1 of 2
                      </div>
                      <h1 class="mt-3 text-[28px] font-black tracking-tight text-white md:text-[30px]">Fastemis EMI Agreement</h1>
                      <p class="mt-2 max-w-2xl text-[16px] leading-7 text-white/80">
                        Read the complete agreement, confirm that you agree to all clauses, add your digital signature, and then record your short consent video.
                      </p>
                    </div>

                    <div class="rounded-[24px] border border-white/15 bg-white/10 p-4 md:min-w-[240px]">
                      <div class="text-[11px] uppercase tracking-[0.16em] text-white/60">Agreement ID</div>
                      <div class="mt-1 break-all text-[16px] font-black text-white">{{ agreementV1Environment().agreementId }}</div>
                      <div class="mt-3 text-[11px] uppercase tracking-[0.16em] text-white/60">Session ID</div>
                      <div class="mt-1 break-all text-[14px] font-semibold text-white/90">{{ agreementV1Environment().sessionId }}</div>
                    </div>
                  </div>
                </div>
              </section>

              <section class="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.15fr_0.85fr]">
                <article class="rounded-[28px] border border-border bg-surface p-5 shadow-[0_12px_36px_rgba(10,37,64,0.05)]">
                  <div class="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h2 class="text-[20px] font-bold tracking-tight text-primary">Customer Snapshot</h2>
                      <p class="mt-1 text-[15px] leading-6 text-secondary">Readonly identity details used in this final agreement.</p>
                    </div>
                    <span class="rounded-full bg-surface-2 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary">Readonly</span>
                  </div>

                  <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div *ngFor="let field of agreementV1CustomerFields()" class="rounded-2xl border border-border bg-surface-2 px-4 py-4">
                      <div class="text-[11px] uppercase tracking-[0.14em] text-muted">{{ field.label }}</div>
                      <div class="mt-1 break-words text-[16px] font-semibold leading-7 text-primary">{{ field.value }}</div>
                    </div>
                  </div>
                </article>

                <article class="rounded-[28px] border border-border bg-surface p-5 shadow-[0_12px_36px_rgba(10,37,64,0.05)]">
                  <div class="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h2 class="text-[20px] font-bold tracking-tight text-primary">Execution Metadata</h2>
                      <p class="mt-1 text-[15px] leading-6 text-secondary">Technical values captured automatically when you submit.</p>
                    </div>
                    <span class="rounded-full bg-surface-2 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary">Server Captured</span>
                  </div>

                  <div class="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                    <div *ngFor="let field of agreementV1TechnicalFields()" class="rounded-2xl border border-border bg-surface-2 px-4 py-4">
                      <div class="text-[11px] uppercase tracking-[0.14em] text-muted">{{ field.label }}</div>
                      <div class="mt-1 break-words text-[15px] font-semibold leading-7 text-primary">{{ field.value }}</div>
                    </div>
                  </div>
                </article>
              </section>

              <section class="mt-5 rounded-[28px] border border-border bg-surface p-5 shadow-[0_12px_36px_rgba(10,37,64,0.05)]">
                <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 class="text-[20px] font-bold tracking-tight text-primary">Consent Video Instructions</h2>
                    <p class="mt-1 text-[15px] leading-6 text-secondary">After you submit your signature, the video sheet will open. Keep the script short and say only the required proof points.</p>
                  </div>
                  <div class="rounded-full border border-success/20 bg-success/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-success">Max 60 sec</div>
                </div>

                <div class="mt-4 rounded-[24px] border border-primary/15 bg-primary/5 p-4 md:p-5">
                  <div class="text-[11px] uppercase tracking-[0.14em] text-secondary">Required script</div>
                  <p class="mt-2 text-[16px] font-semibold leading-8 text-primary agreement-reading">{{ agreementV1VideoScript() }}</p>
                </div>

                <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <div class="rounded-[22px] border border-border bg-surface-2 p-4">
                    <div class="text-[15px] font-semibold text-primary">How to record</div>
                    <ul class="mt-3 space-y-2 text-[15px] leading-7 text-secondary">
                      <li *ngFor="let item of agreementV1VideoGuidelines" class="flex gap-2"><span class="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary"></span><span>{{ item }}</span></li>
                    </ul>
                  </div>
                  <div class="rounded-[22px] border border-border bg-surface-2 p-4">
                    <div class="text-[15px] font-semibold text-primary">Why this is strong evidence</div>
                    <ul class="mt-3 space-y-2 text-[15px] leading-7 text-secondary">
                      <li *ngFor="let item of agreementV1VideoPowerPoints" class="flex gap-2"><span class="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-success"></span><span>{{ item }}</span></li>
                    </ul>
                  </div>
                  <div class="rounded-[22px] border border-border bg-surface-2 p-4">
                    <div class="text-[15px] font-semibold text-primary">Agreement ID usage</div>
                    <ul class="mt-3 space-y-2 text-[15px] leading-7 text-secondary">
                      <li *ngFor="let item of agreementV1AgreementIdSteps" class="flex gap-2"><span class="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary"></span><span>{{ item }}</span></li>
                    </ul>
                  </div>
                </div>
              </section>

              <section class="mt-5 rounded-[28px] border border-border bg-[#fffef9] p-5 shadow-[0_12px_36px_rgba(10,37,64,0.05)]">
                <div class="mb-4">
                  <h2 class="text-[20px] font-bold tracking-tight text-primary">Agreement Clauses</h2>
                  <p class="mt-1 text-[15px] leading-6 text-secondary">Read all 28 clauses carefully before signing.</p>
                </div>

                <div class="space-y-3">
                  <article
                    *ngFor="let clause of agreementV1Clauses"
                    class="rounded-[22px] border border-[#e8ddc7] bg-white px-4 py-4 shadow-[0_6px_18px_rgba(10,37,64,0.04)]">
                    <div class="flex items-start justify-between gap-3">
                      <div class="min-w-0">
                        <div class="inline-flex items-center rounded-full bg-primary/5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">Clause {{ clause.number }}</div>
                        <h3 class="mt-3 text-[17px] font-bold leading-7 text-primary agreement-reading">{{ clause.title }}</h3>
                      </div>
                      <div class="flex h-8 min-w-8 items-center justify-center rounded-full border border-primary/12 bg-primary/5 px-2 text-[11px] font-black text-primary">{{ clause.number }}</div>
                    </div>
                    <p class="mt-3 whitespace-pre-line text-[16px] leading-8 text-secondary agreement-reading">{{ clause.body }}</p>
                  </article>
                </div>
              </section>

              <section class="mt-5 rounded-[28px] border border-border bg-surface p-5 shadow-[0_12px_36px_rgba(10,37,64,0.05)]">
                <div class="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <h2 class="text-[20px] font-bold tracking-tight text-primary">Final Consent and Signature</h2>
                    <p class="mt-1 text-[15px] leading-6 text-secondary">Check the agreement confirmation once, then add your digital signature.</p>
                  </div>
                  <span class="rounded-full bg-surface-2 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary">Before Video</span>
                </div>

                <label class="flex items-start gap-3 rounded-[22px] border border-border bg-surface-2 px-4 py-4 text-[16px] leading-7 text-primary">
                  <input
                    type="checkbox"
                    [(ngModel)]="acceptAgreementV1Terms"
                    class="mt-1 h-4 w-4 rounded border-border text-primary">
                  <span>I have read and understood all 28 clauses, and I agree to all of them voluntarily.</span>
                </label>

                <div class="mt-4 rounded-[22px] border border-border bg-surface p-4">
                  <div class="flex items-center justify-between gap-2 mb-3">
                    <div>
                      <h3 class="text-[18px] font-semibold text-primary">Digital Signature</h3>
                      <p class="mt-1 text-[14px] text-secondary">Sign using your mouse or phone touchscreen.</p>
                    </div>
                    <button
                      type="button"
                      (click)="clearSignature()"
                      class="inline-flex items-center justify-center rounded-xl border border-border px-3 py-2 text-[14px] font-semibold text-secondary transition-colors hover:bg-surface-2 hover:text-primary">
                      Clear
                    </button>
                  </div>

                  <div class="rounded-[20px] border border-border bg-surface-2 overflow-hidden">
                    <canvas
                      #signatureCanvas
                      class="block h-[200px] w-full touch-none"
                      (pointerdown)="startSignatureDraw($event)"
                      (pointermove)="moveSignatureDraw($event)"
                      (pointerup)="endSignatureDraw($event)"
                      (pointerleave)="endSignatureDraw($event)"
                      (pointercancel)="endSignatureDraw($event)"
                      (lostpointercapture)="endSignatureDraw($event)"
                      (mousedown)="startSignatureMouseDraw($event)"
                      (mousemove)="moveSignatureMouseDraw($event)"
                      (mouseup)="endSignatureMouseDraw()"
                      (mouseleave)="endSignatureMouseDraw()"
                      (touchstart)="startSignatureTouchDraw($event)"
                      (touchmove)="moveSignatureTouchDraw($event)"
                      (touchend)="endSignatureTouchDraw()"
                      (touchcancel)="endSignatureTouchDraw()"></canvas>
                  </div>

                  <div *ngIf="signaturePreviewUrl()" class="mt-3 rounded-[20px] border border-border bg-surface-2 p-2">
                    <img [src]="signaturePreviewUrl()" alt="Signature preview" class="max-h-[240px] w-full rounded-[16px] bg-white object-contain" />
                  </div>
                </div>
              </section>
            </ng-template>
          </ng-container>
        </div>
      </main>

      <app-agreement-consent-video-modal
        [visible]="showAgreementV1VideoModal()"
        [script]="agreementV1VideoScript()"
        [cameraSupported]="cameraSupported()"
        [cameraReady]="cameraReady()"
        [cameraOpening]="cameraOpening()"
        [recording]="recording()"
        [recordingSeconds]="recordingSeconds()"
        [cameraError]="cameraError()"
        [previewUrl]="consentVideoPreviewUrl()"
        [submitting]="submitting()"
        [cameraStream]="cameraStream"
        (close)="closeAgreementV1VideoModal()"
        (startCamera)="startCamera()"
        (startRecording)="startRecordingFromCamera()"
        (stopAndSave)="stopAndSaveRecording()"
        (stopCamera)="stopCamera()"
        (retakeVideo)="retakeVideo()"
        (fileSelected)="onVideoFileSelectedFromModal($event)"
        (finalSubmit)="submitAgreementV1Final()">
      </app-agreement-consent-video-modal>

      <footer *ngIf="agreementEnabled() && !agreementComplete()" class="sticky bottom-0 left-0 right-0 z-40 border-t border-border bg-surface/95 p-4 backdrop-blur-xl shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.08)]">
        <div class="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <button
            type="button"
            class="h-11 rounded-2xl border border-border bg-surface px-4 text-[14px] font-semibold text-primary transition-colors hover:bg-surface-2"
            (click)="goBack()">
            Back
          </button>
          <button
            type="button"
            class="h-11 rounded-2xl bg-primary px-5 text-[14px] font-semibold text-white transition-colors hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60"
            [disabled]="submitting() || !readyForAgreementV1SignatureStep()"
            (click)="openAgreementV1VideoModal()">
            Submit Signature
          </button>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .agreement-reading {
      font-family: "Georgia", "Times New Roman", serif;
    }
  `]
})
export class AgreementComponent implements OnInit, OnDestroy {
  @ViewChild('signatureCanvas') signatureCanvasRef?: ElementRef<HTMLCanvasElement>;

  readonly loading = signal(true);
  readonly documentLoading = signal(false);
  readonly submitting = signal(false);
  readonly agreementEnabled = signal(false);
  readonly agreementComplete = signal(false);
  readonly agreementCompletedAt = signal<string | null>(null);
  readonly agreementDocument = signal<AgreementDocumentPayload | null>(null);
  readonly userProfile = signal<BackendUserProfileResponse | null>(null);
  readonly showAgreementV1VideoModal = signal(false);
  readonly agreementV1Environment = signal<AgreementV1EnvironmentState>({
    ipAddress: 'Captured automatically by server on final submit.',
    finalSubmissionTimestamp: 'Will be captured on final submit.',
    sessionId: '-',
    agreementId: '-',
    userAgent: '-',
    browserName: '-',
    browserVersion: '-',
    operatingSystem: '-',
    browserLanguage: '-',
    browserTimezone: '-'
  });

  readonly agreementV1Clauses = AGREEMENT_V1_CLAUSES;
  readonly agreementV1VideoGuidelines = AGREEMENT_V1_VIDEO_GUIDELINES;
  readonly agreementV1VideoPowerPoints = AGREEMENT_V1_VIDEO_POWER_POINTS;
  readonly agreementV1AgreementIdSteps = AGREEMENT_V1_AGREEMENT_ID_STEPS;

  readonly agreementV1CustomerFields = computed(() => {
    const profile = this.userProfile();
    const authUser = this.authService.currentUserSignal();
    const fullName = [
      String(profile?.first_name || '').trim(),
      String(profile?.last_name || '').trim()
    ].filter(Boolean).join(' ').trim() || String(authUser?.fullName || '').trim() || 'Not filled yet';

    return [
      { label: 'User Name', value: fullName || 'Not filled yet' },
      { label: 'Aadhaar Number', value: this.displayValue(profile?.aadhar_number) },
      { label: 'PAN Number', value: this.displayValue(profile?.pan_number) }
    ];
  });

  readonly agreementV1TechnicalFields = computed(() => {
    const env = this.agreementV1Environment();
    return [
      { label: 'IP Address', value: env.ipAddress },
      { label: 'Final Submission Timestamp', value: env.finalSubmissionTimestamp },
      { label: 'Session ID', value: env.sessionId },
      { label: 'Agreement ID', value: env.agreementId },
      { label: 'User Agent String', value: env.userAgent },
      { label: 'Browser Name', value: env.browserName },
      { label: 'Browser Version', value: env.browserVersion },
      { label: 'Operating System', value: env.operatingSystem },
      { label: 'Browser Language', value: env.browserLanguage },
      { label: 'Browser Timezone', value: env.browserTimezone }
    ];
  });

  acceptAgreementV1Terms = false;
  readonly signatureDirty = signal(false);
  readonly signaturePreviewDataUrl = signal('');
  readonly signatureUrl = signal('');

  readonly cameraOpening = signal(false);
  readonly cameraReady = signal(false);
  readonly recording = signal(false);
  readonly recordingSeconds = signal(0);
  readonly cameraError = signal('');
  readonly selectedVideoFile = signal<File | null>(null);
  readonly selectedVideoUrl = signal('');

  private signatureContext: CanvasRenderingContext2D | null = null;
  private drawingSignature = false;
  private activePointerId: number | null = null;
  private signatureInitRetries = 0;
  private signatureRestoreVersion = 0;
  private agreementExecutionSyncAttempted = false;
  cameraStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recorderChunks: Blob[] = [];
  private recordTimer: number | null = null;

  constructor(
    private router: Router,
    private appService: ApplicationService,
    private notification: NotificationService,
    private agreementApi: AgreementApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initializeAgreementV1Environment();
    this.loadUserProfile();
    this.fetchAgreementState();
  }

  ngOnDestroy(): void {
    this.stopRecording(false);
    this.stopCamera();
    this.clearSelectedVideoPreview();
  }

  fetchAgreementState(): void {
    this.loading.set(true);
    this.agreementApi.getUserAgreementState().subscribe((state) => {
      this.agreementEnabled.set(state.agreementEnabled);
      this.agreementComplete.set(state.agreement1Complete || state.agreementComplete);
      this.agreementCompletedAt.set(state.agreementCompletedAt || null);
      this.signatureUrl.set(state.signatureUrl || '');
      this.selectedVideoUrl.set(state.consentVideoUrl || '');
      this.selectedVideoFile.set(null);
      this.signatureDirty.set(false);
      this.signaturePreviewDataUrl.set('');
      this.acceptAgreementV1Terms = false;
      this.showAgreementV1VideoModal.set(false);
      this.agreementExecutionSyncAttempted = false;
      this.agreementV1Environment.update((current) => ({
        ...current,
        finalSubmissionTimestamp: state.agreementCompletedAt
          ? this.formatDateTime(state.agreementCompletedAt)
          : 'Will be captured on final submit.'
      }));

      if (this.agreementComplete()) {
        this.loadAgreementDocument();
      } else {
        this.agreementDocument.set(null);
        setTimeout(() => this.setupSignatureCanvas(), 0);
      }

      this.loading.set(false);
    });
  }

  loadAgreementDocument(): void {
    if (!this.agreementComplete()) {
      return;
    }

    this.documentLoading.set(true);
    this.agreementApi.getAgreementDocument().subscribe((documentPayload) => {
      if (documentPayload && this.documentNeedsExecutionSync(documentPayload) && !this.agreementExecutionSyncAttempted) {
        this.agreementExecutionSyncAttempted = true;
        this.syncAgreementDocumentExecution();
        return;
      }

      this.documentLoading.set(false);
      this.agreementDocument.set(documentPayload);
      this.hydrateAgreementEnvironmentFromDocument(documentPayload);
    });
  }

  readyForAgreementV1SignatureStep(): boolean {
    return this.agreementEnabled() && !this.agreementComplete() && !!this.acceptAgreementV1Terms && !!this.signaturePreviewUrl();
  }

  openAgreementV1VideoModal(): void {
    if (!this.acceptAgreementV1Terms) {
      this.notification.error('Please confirm that you agree to all 28 clauses.');
      return;
    }
    if (!this.signaturePreviewUrl()) {
      this.notification.error('Please add your digital signature first.');
      return;
    }
    this.showAgreementV1VideoModal.set(true);
  }

  closeAgreementV1VideoModal(): void {
    if (this.recording()) {
      this.stopRecording(true);
    }
    this.stopCamera();
    this.showAgreementV1VideoModal.set(false);
  }

  agreementV1VideoScript(): string {
    const profile = this.userProfile();
    const fullName = this.agreementV1CustomerFields()[0]?.value || 'your full name';
    const aadhaarValue = String(profile?.aadhar_number || '').trim();
    const aadhaarLast4 = aadhaarValue ? aadhaarValue.slice(-4) : 'last 4 digits';
    const agreementId = this.agreementV1Environment().agreementId || 'Agreement ID shown on screen';
    const today = this.formatLegalDate(new Date());
    return `I, ${fullName}, with Aadhaar number ending in ${aadhaarLast4}, am agreeing to the Fastemis EMI Agreement with Agreement ID ${agreementId}. Today's date is ${today}. I have read and understood all 28 clauses. I confirm that all documents I uploaded are genuine. I am doing this of my own free will.`;
  }

  signaturePreviewUrl(): string {
    return this.signaturePreviewDataUrl() || this.signatureUrl();
  }

  consentVideoPreviewUrl(): string {
    return this.selectedVideoUrl();
  }

  clearSignature(): void {
    if (!this.ensureSignatureCanvasReady()) {
      return;
    }
    const canvas = this.signatureCanvasRef?.nativeElement;
    const ctx = this.signatureContext;
    if (!canvas || !ctx) {
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.signatureRestoreVersion += 1;
    this.signatureDirty.set(false);
    this.signaturePreviewDataUrl.set('');
  }

  startSignatureDraw(event: PointerEvent): void {
    if (!this.isPointerEventsSupported()) {
      return;
    }
    if (!this.ensureSignatureCanvasReady()) {
      return;
    }
    const canvas = this.signatureCanvasRef?.nativeElement;
    const ctx = this.signatureContext;
    if (!canvas || !ctx) {
      return;
    }

    this.activePointerId = event.pointerId;
    canvas.setPointerCapture(event.pointerId);
    const { x, y } = this.pointerToCanvas(event, canvas);
    this.drawingSignature = true;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 0.01, y + 0.01);
    ctx.stroke();
    this.signatureDirty.set(true);
    event.preventDefault();
  }

  moveSignatureDraw(event: PointerEvent): void {
    if (!this.isPointerEventsSupported() || !this.drawingSignature) {
      return;
    }
    if (this.activePointerId !== null && event.pointerId !== this.activePointerId) {
      return;
    }
    if (!this.ensureSignatureCanvasReady()) {
      return;
    }
    const canvas = this.signatureCanvasRef?.nativeElement;
    const ctx = this.signatureContext;
    if (!canvas || !ctx) {
      return;
    }

    const { x, y } = this.pointerToCanvas(event, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
    this.signatureDirty.set(true);
    event.preventDefault();
  }

  endSignatureDraw(event?: PointerEvent): void {
    if (!this.isPointerEventsSupported()) {
      return;
    }
    if (!this.drawingSignature) {
      this.releasePointerCaptureSafely(event);
      return;
    }
    this.drawingSignature = false;
    this.releasePointerCaptureSafely(event);
    this.activePointerId = null;
    this.captureSignaturePreview();
  }

  startSignatureMouseDraw(event: MouseEvent): void {
    if (this.isPointerEventsSupported()) {
      return;
    }
    this.startDrawFromCoordinates(event.clientX, event.clientY);
    event.preventDefault();
  }

  moveSignatureMouseDraw(event: MouseEvent): void {
    if (this.isPointerEventsSupported()) {
      return;
    }
    this.moveDrawFromCoordinates(event.clientX, event.clientY);
    event.preventDefault();
  }

  endSignatureMouseDraw(): void {
    if (this.isPointerEventsSupported()) {
      return;
    }
    this.endDrawFromFallback();
  }

  startSignatureTouchDraw(event: TouchEvent): void {
    if (this.isPointerEventsSupported()) {
      return;
    }
    const touch = event.touches?.[0];
    if (!touch) {
      return;
    }
    this.startDrawFromCoordinates(touch.clientX, touch.clientY);
    event.preventDefault();
  }

  moveSignatureTouchDraw(event: TouchEvent): void {
    if (this.isPointerEventsSupported()) {
      return;
    }
    const touch = event.touches?.[0];
    if (!touch) {
      return;
    }
    this.moveDrawFromCoordinates(touch.clientX, touch.clientY);
    event.preventDefault();
  }

  endSignatureTouchDraw(): void {
    if (this.isPointerEventsSupported()) {
      return;
    }
    this.endDrawFromFallback();
  }

  cameraSupported(): boolean {
    return typeof window !== 'undefined'
      && typeof navigator !== 'undefined'
      && !!navigator.mediaDevices
      && typeof navigator.mediaDevices.getUserMedia === 'function'
      && typeof MediaRecorder !== 'undefined';
  }

  startCamera(): void {
    if (!this.cameraSupported() || this.cameraReady() || this.cameraOpening()) {
      return;
    }

    this.cameraError.set('');
    this.cameraOpening.set(true);
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: true })
      .then((stream) => {
        this.cameraStream = stream;
        this.cameraReady.set(true);
        this.cameraOpening.set(false);
      })
      .catch(() => {
        this.cameraOpening.set(false);
        this.cameraError.set('Could not open camera. Please allow camera permission.');
      });
  }

  stopCamera(): void {
    if (this.recording()) {
      this.stopRecording(true);
    }
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach((track) => track.stop());
      this.cameraStream = null;
    }
    this.cameraReady.set(false);
  }

  startRecordingFromCamera(): void {
    this.startRecording();
  }

  stopAndSaveRecording(): void {
    this.stopRecording(true);
  }

  retakeVideo(): void {
    if (this.recording()) {
      this.stopRecording(true);
    }
    this.clearSelectedVideoPreview();
    this.selectedVideoFile.set(null);
    this.selectedVideoUrl.set('');
  }

  onVideoFileSelectedFromModal(file: File): void {
    this.validateVideoDuration(file).then((isValid) => {
      if (!isValid) {
        this.notification.error('Video must be 1 minute or less.');
        return;
      }
      this.setSelectedVideo(file);
    }).catch(() => {
      this.notification.error('Could not validate video duration.');
    });
  }

  submitAgreementV1Final(): void {
    if (!this.acceptAgreementV1Terms) {
      this.notification.error('Please confirm that you agree to all 28 clauses.');
      return;
    }
    if (!this.signaturePreviewUrl()) {
      this.notification.error('Please add your digital signature first.');
      return;
    }
    if (!this.consentVideoPreviewUrl()) {
      this.notification.error('Please record or upload your consent video.');
      return;
    }

    this.submitting.set(true);
    const payload = new FormData();
    const env = this.agreementV1Environment();
    payload.append('agreed_to_all_clauses', 'true');
    payload.append('agreement_id', env.agreementId);
    payload.append('session_id', env.sessionId);
    payload.append('user_agent', env.userAgent);
    payload.append('browser_name', env.browserName);
    payload.append('browser_version', env.browserVersion);
    payload.append('operating_system', env.operatingSystem);
    payload.append('browser_language', env.browserLanguage);
    payload.append('browser_timezone', env.browserTimezone);

    const finishSubmit = (signatureBlob: Blob | null) => {
      if (signatureBlob) {
        payload.append('signature_image', signatureBlob, `signature-${Date.now()}.png`);
      }

      const videoFile = this.selectedVideoFile();
      if (videoFile) {
        payload.append('consent_video', videoFile, videoFile.name || `agreement-consent-${Date.now()}.webm`);
      }

      this.agreementApi.completeAgreement(payload).subscribe((result) => {
        this.submitting.set(false);
        if (!result?.state || !result.state.agreement1Complete) {
          this.notification.error('Could not complete agreement. Please retry.');
          return;
        }

        this.agreementComplete.set(true);
        this.agreementCompletedAt.set(result.state.agreementCompletedAt || null);
        this.signatureUrl.set(result.state.signatureUrl || '');
        this.signatureDirty.set(false);
        this.signaturePreviewDataUrl.set('');
        this.selectedVideoFile.set(null);
        this.selectedVideoUrl.set(result.state.consentVideoUrl || '');
        this.agreementV1Environment.update((current) => ({
          ...current,
          finalSubmissionTimestamp: result.state.agreementCompletedAt
            ? this.formatDateTime(result.state.agreementCompletedAt)
            : current.finalSubmissionTimestamp
        }));
        this.stopRecording(false);
        this.stopCamera();
        this.showAgreementV1VideoModal.set(false);
        this.agreementDocument.set(result.document || null);
        this.documentLoading.set(false);

        this.appService.progressApplicationState();
        this.notification.success('Agreement submitted successfully and locked.');

        if (!result.document) {
          this.loadAgreementDocument();
        }
      });
    };

    this.resolveSignatureBlobForSubmit().then((blob) => {
      if (!blob) {
        this.submitting.set(false);
        this.notification.error('Could not read signature. Please sign again.');
        return;
      }
      finishSubmit(blob);
    }).catch(() => {
      this.submitting.set(false);
      this.notification.error('Could not read signature. Please sign again.');
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  formatDateTime(value?: string | null): string {
    if (!value) return '-';
    return new Date(value).toLocaleString([], {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private loadUserProfile(): void {
    this.authService.getBackendUserProfile().subscribe({
      next: (profile) => {
        this.userProfile.set(profile);
      },
      error: () => {
        this.userProfile.set(null);
      }
    });
  }

  private displayValue(value: unknown): string {
    const raw = String(value ?? '').trim();
    return raw || 'Not filled yet';
  }

  private formatLegalDate(value: Date): string {
    return value.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  private syncAgreementDocumentExecution(): void {
    const env = this.agreementV1Environment();
    this.agreementApi.syncAgreementDocumentExecution({
      userAgent: env.userAgent,
      browserName: env.browserName,
      browserVersion: env.browserVersion,
      operatingSystem: env.operatingSystem,
      browserLanguage: env.browserLanguage,
      browserTimezone: env.browserTimezone
    }).subscribe((documentPayload) => {
      this.documentLoading.set(false);
      this.agreementDocument.set(documentPayload);
      this.hydrateAgreementEnvironmentFromDocument(documentPayload);
    });
  }

  private documentNeedsExecutionSync(documentPayload: AgreementDocumentPayload | null): boolean {
    if (!documentPayload) {
      return false;
    }

    const execution = documentPayload.execution;
    return [
      execution.ipAddress,
      execution.userAgent,
      execution.browserName,
      execution.browserVersion,
      execution.operatingSystem,
      execution.browserLanguage,
      execution.browserTimezone
    ].some((value) => this.isMissingExecutionValue(value));
  }

  private hydrateAgreementEnvironmentFromDocument(documentPayload: AgreementDocumentPayload | null): void {
    if (!documentPayload) {
      return;
    }

    this.agreementV1Environment.update((current) => ({
      ...current,
      ipAddress: this.preferExecutionValue(documentPayload.execution.ipAddress, current.ipAddress),
      finalSubmissionTimestamp: documentPayload.executedAt
        ? this.formatDateTime(documentPayload.executedAt)
        : current.finalSubmissionTimestamp,
      sessionId: this.preferExecutionValue(documentPayload.sessionId, current.sessionId),
      agreementId: this.preferExecutionValue(documentPayload.agreementId, current.agreementId),
      userAgent: this.preferExecutionValue(documentPayload.execution.userAgent, current.userAgent),
      browserName: this.preferExecutionValue(documentPayload.execution.browserName, current.browserName),
      browserVersion: this.preferExecutionValue(documentPayload.execution.browserVersion, current.browserVersion),
      operatingSystem: this.preferExecutionValue(documentPayload.execution.operatingSystem, current.operatingSystem),
      browserLanguage: this.preferExecutionValue(documentPayload.execution.browserLanguage, current.browserLanguage),
      browserTimezone: this.preferExecutionValue(documentPayload.execution.browserTimezone, current.browserTimezone)
    }));
  }

  private preferExecutionValue(candidate: string | null | undefined, fallback: string): string {
    const text = String(candidate || '').trim();
    if (this.isMissingExecutionValue(text)) {
      return fallback;
    }
    return text;
  }

  private isMissingExecutionValue(value: string | null | undefined): boolean {
    const text = String(value || '').trim();
    return !text || text.toLowerCase() === 'not captured';
  }

  private initializeAgreementV1Environment(): void {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return;
    }

    const sessionId = this.getOrCreateSessionValue('fastemis-agreement-v1-session-id', () => `SESS-${this.formatDateToken(new Date())}-${this.randomAlphaNumeric(6)}`);
    const agreementId = this.getOrCreateSessionValue('fastemis-agreement-v1-agreement-id', () => `FEMI-${this.formatDateToken(new Date())}-${this.randomAlphaNumeric(5)}`);
    const browser = this.parseBrowser(navigator.userAgent || '');
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '-';

    this.agreementV1Environment.set({
      ipAddress: 'Captured automatically by server on final submit.',
      finalSubmissionTimestamp: this.agreementCompletedAt()
        ? this.formatDateTime(this.agreementCompletedAt())
        : 'Will be captured on final submit.',
      sessionId,
      agreementId,
      userAgent: navigator.userAgent || '-',
      browserName: browser.name,
      browserVersion: browser.version,
      operatingSystem: browser.os,
      browserLanguage: navigator.language || '-',
      browserTimezone: timezone
    });
  }

  private getOrCreateSessionValue(key: string, factory: () => string): string {
    if (typeof window === 'undefined') {
      return factory();
    }

    const existing = window.sessionStorage.getItem(key);
    if (existing) {
      return existing;
    }

    const created = factory();
    window.sessionStorage.setItem(key, created);
    return created;
  }

  private formatDateToken(value: Date): string {
    const year = value.getFullYear();
    const month = `${value.getMonth() + 1}`.padStart(2, '0');
    const day = `${value.getDate()}`.padStart(2, '0');
    return `${year}${month}${day}`;
  }

  private randomAlphaNumeric(length: number): string {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';

    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      const bytes = new Uint32Array(length);
      crypto.getRandomValues(bytes);
      for (let index = 0; index < length; index += 1) {
        result += alphabet[bytes[index] % alphabet.length];
      }
      return result;
    }

    for (let index = 0; index < length; index += 1) {
      result += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return result;
  }

  private parseBrowser(userAgent: string): { name: string; version: string; os: string } {
    const agent = String(userAgent || '');
    const lowerAgent = agent.toLowerCase();

    let name = 'Unknown Browser';
    let version = '-';

    const browserMatchers: Array<{ name: string; regex: RegExp }> = [
      { name: 'Samsung Browser', regex: /SamsungBrowser\/([\d.]+)/i },
      { name: 'Edge', regex: /Edg\/([\d.]+)/i },
      { name: 'Opera', regex: /OPR\/([\d.]+)/i },
      { name: 'Chrome', regex: /Chrome\/([\d.]+)/i },
      { name: 'Firefox', regex: /Firefox\/([\d.]+)/i },
      { name: 'Safari', regex: /Version\/([\d.]+).*Safari/i }
    ];

    for (const matcher of browserMatchers) {
      const match = agent.match(matcher.regex);
      if (match) {
        name = matcher.name;
        version = match[1] || '-';
        break;
      }
    }

    let os = 'Unknown OS';
    if (/android/i.test(agent)) {
      os = 'Android';
    } else if (/iphone|ipad|ipod/i.test(agent)) {
      os = 'iOS';
    } else if (/windows/i.test(agent)) {
      os = 'Windows';
    } else if (/mac os x/i.test(agent)) {
      os = 'macOS';
    } else if (/linux/i.test(agent)) {
      os = 'Linux';
    }

    if (lowerAgent.includes('crios') && name === 'Unknown Browser') {
      name = 'Chrome';
      const match = agent.match(/CriOS\/([\d.]+)/i);
      version = match?.[1] || version;
    }

    return { name, version, os };
  }

  private setupSignatureCanvas(): void {
    const canvas = this.signatureCanvasRef?.nativeElement;
    if (!canvas || this.agreementComplete()) {
      return;
    }
    canvas.style.touchAction = 'none';
    canvas.style.userSelect = 'none';

    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      if (this.signatureInitRetries < 6) {
        this.signatureInitRetries += 1;
        window.setTimeout(() => this.setupSignatureCanvas(), 80);
      }
      return;
    }

    this.signatureInitRetries = 0;
    canvas.width = Math.floor(rect.width * ratio);
    canvas.height = Math.floor(rect.height * ratio);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0A2540';
    this.signatureContext = ctx;

    const previewDataUrl = this.signaturePreviewDataUrl().trim();
    if (previewDataUrl) {
      this.restoreSignaturePreviewToCanvas(previewDataUrl);
    }
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (this.agreementComplete()) {
      return;
    }
    this.setupSignatureCanvas();
  }

  private pointerToCanvas(event: PointerEvent, canvas: HTMLCanvasElement): { x: number; y: number } {
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  private canvasToBlob(): Promise<Blob | null> {
    return new Promise((resolve) => {
      const canvas = this.signatureCanvasRef?.nativeElement;
      if (!canvas) {
        resolve(null);
        return;
      }
      const exportCanvas = this.trimSignatureCanvas(canvas) || canvas;
      exportCanvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
          return;
        }
        try {
          const dataUrl = exportCanvas.toDataURL('image/png', 0.95);
          resolve(this.dataUrlToBlob(dataUrl));
        } catch {
          resolve(null);
        }
      }, 'image/png', 0.95);
    });
  }

  private async resolveSignatureBlobForSubmit(): Promise<Blob | null> {
    const previewDataUrl = this.signaturePreviewDataUrl().trim();
    if (previewDataUrl) {
      const previewBlob = this.dataUrlToBlob(previewDataUrl);
      if (previewBlob && await this.isValidImageBlob(previewBlob)) {
        return previewBlob;
      }
    }

    const canvasBlob = await this.canvasToBlob();
    if (canvasBlob && await this.isValidImageBlob(canvasBlob)) {
      return canvasBlob;
    }

    return null;
  }

  private startDrawFromCoordinates(clientX: number, clientY: number): void {
    if (!this.ensureSignatureCanvasReady()) {
      return;
    }
    const canvas = this.signatureCanvasRef?.nativeElement;
    const ctx = this.signatureContext;
    if (!canvas || !ctx) {
      return;
    }
    const { x, y } = this.coordsToCanvas(clientX, clientY, canvas);
    this.drawingSignature = true;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 0.01, y + 0.01);
    ctx.stroke();
    this.signatureDirty.set(true);
  }

  private moveDrawFromCoordinates(clientX: number, clientY: number): void {
    if (!this.drawingSignature) {
      return;
    }
    if (!this.ensureSignatureCanvasReady()) {
      return;
    }
    const canvas = this.signatureCanvasRef?.nativeElement;
    const ctx = this.signatureContext;
    if (!canvas || !ctx) {
      return;
    }
    const { x, y } = this.coordsToCanvas(clientX, clientY, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
    this.signatureDirty.set(true);
  }

  private endDrawFromFallback(): void {
    if (!this.drawingSignature) {
      return;
    }
    this.drawingSignature = false;
    this.captureSignaturePreview();
  }

  private ensureSignatureCanvasReady(): boolean {
    if (!this.signatureCanvasRef?.nativeElement) {
      return false;
    }
    if (!this.signatureContext) {
      this.setupSignatureCanvas();
    }
    return !!this.signatureContext;
  }

  private releasePointerCaptureSafely(event?: PointerEvent): void {
    const canvas = this.signatureCanvasRef?.nativeElement;
    if (!canvas || !event) {
      return;
    }
    try {
      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }
    } catch {
      // no-op
    }
  }

  private isPointerEventsSupported(): boolean {
    return typeof window !== 'undefined' && 'PointerEvent' in window;
  }

  private coordsToCanvas(clientX: number, clientY: number, canvas: HTMLCanvasElement): { x: number; y: number } {
    const rect = canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  private dataUrlToBlob(dataUrl: string): Blob | null {
    const parts = dataUrl.split(',');
    if (parts.length !== 2) {
      return null;
    }
    const mimeMatch = parts[0].match(/data:(.*?);base64/);
    if (!mimeMatch) {
      return null;
    }
    try {
      const binary = atob(parts[1]);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
      }
      return new Blob([bytes], { type: mimeMatch[1] || 'image/png' });
    } catch {
      return null;
    }
  }

  private captureSignaturePreview(): void {
    const canvas = this.signatureCanvasRef?.nativeElement;
    if (!canvas) {
      this.signaturePreviewDataUrl.set('');
      return;
    }

    try {
      const previewCanvas = this.trimSignatureCanvas(canvas) || canvas;
      this.signaturePreviewDataUrl.set(previewCanvas.toDataURL('image/png'));
    } catch {
      this.signaturePreviewDataUrl.set('');
    }
  }

  private restoreSignaturePreviewToCanvas(dataUrl: string): void {
    const canvas = this.signatureCanvasRef?.nativeElement;
    const ctx = this.signatureContext;
    if (!canvas || !ctx || !dataUrl) {
      return;
    }

    const restoreVersion = ++this.signatureRestoreVersion;
    const image = new Image();
    image.onload = () => {
      if (restoreVersion !== this.signatureRestoreVersion) {
        return;
      }
      const rect = canvas.getBoundingClientRect();
      const drawWidth = rect.width || canvas.width;
      const drawHeight = rect.height || canvas.height;
      ctx.clearRect(0, 0, drawWidth, drawHeight);
      const padding = Math.max(12, Math.round(Math.min(drawWidth, drawHeight) * 0.05));
      const availableWidth = Math.max(1, drawWidth - (padding * 2));
      const availableHeight = Math.max(1, drawHeight - (padding * 2));
      const imageWidth = Math.max(1, image.naturalWidth || image.width || 1);
      const imageHeight = Math.max(1, image.naturalHeight || image.height || 1);
      const scale = Math.min(availableWidth / imageWidth, availableHeight / imageHeight);
      const renderWidth = imageWidth * scale;
      const renderHeight = imageHeight * scale;
      const offsetX = (drawWidth - renderWidth) / 2;
      const offsetY = (drawHeight - renderHeight) / 2;
      ctx.drawImage(image, offsetX, offsetY, renderWidth, renderHeight);
    };
    image.onerror = () => {
      if (restoreVersion === this.signatureRestoreVersion) {
        this.notification.error('Could not restore signature preview. Please sign again.');
      }
    };
    image.src = dataUrl;
  }

  private async isValidImageBlob(blob: Blob): Promise<boolean> {
    if (!blob || blob.size <= 0 || (blob.type && !blob.type.startsWith('image/'))) {
      return false;
    }

    const dimensions = await this.readImageDimensions(blob);
    return !!dimensions && dimensions.width > 0 && dimensions.height > 0;
  }

  private async readImageDimensions(blob: Blob): Promise<{ width: number; height: number } | null> {
    if (typeof createImageBitmap === 'function') {
      try {
        const bitmap = await createImageBitmap(blob);
        const dimensions = { width: bitmap.width, height: bitmap.height };
        bitmap.close();
        return dimensions;
      } catch {
        // fall through
      }
    }

    return new Promise((resolve) => {
      const imageUrl = URL.createObjectURL(blob);
      const image = new Image();
      image.onload = () => {
        const dimensions = {
          width: Number(image.naturalWidth || 0),
          height: Number(image.naturalHeight || 0)
        };
        URL.revokeObjectURL(imageUrl);
        resolve(dimensions);
      };
      image.onerror = () => {
        URL.revokeObjectURL(imageUrl);
        resolve(null);
      };
      image.src = imageUrl;
    });
  }

  private trimSignatureCanvas(sourceCanvas: HTMLCanvasElement): HTMLCanvasElement | null {
    const sourceContext = sourceCanvas.getContext('2d', { willReadFrequently: true });
    if (!sourceContext) {
      return null;
    }

    const width = Math.max(1, Math.floor(sourceCanvas.width));
    const height = Math.max(1, Math.floor(sourceCanvas.height));

    try {
      const imageData = sourceContext.getImageData(0, 0, width, height);
      const pixels = imageData.data;
      let minX = width;
      let minY = height;
      let maxX = -1;
      let maxY = -1;

      for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
          const alpha = pixels[((y * width) + x) * 4 + 3];
          if (alpha > 0) {
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
          }
        }
      }

      if (maxX < minX || maxY < minY) {
        return null;
      }

      const padding = Math.max(8, Math.round(Math.min(width, height) * 0.02));
      const cropX = Math.max(0, minX - padding);
      const cropY = Math.max(0, minY - padding);
      const cropWidth = Math.min(width - cropX, (maxX - minX + 1) + (padding * 2));
      const cropHeight = Math.min(height - cropY, (maxY - minY + 1) + (padding * 2));

      const trimmedCanvas = document.createElement('canvas');
      trimmedCanvas.width = Math.max(1, cropWidth);
      trimmedCanvas.height = Math.max(1, cropHeight);
      const trimmedContext = trimmedCanvas.getContext('2d');
      if (!trimmedContext) {
        return null;
      }
      trimmedContext.drawImage(
        sourceCanvas,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight
      );
      return trimmedCanvas;
    } catch {
      return null;
    }
  }

  private startRecording(): void {
    if (!this.cameraStream) {
      this.startCamera();
      return;
    }
    if (typeof MediaRecorder === 'undefined') {
      this.cameraError.set('Recording is not supported in this browser.');
      return;
    }

    this.cameraError.set('');
    this.recorderChunks = [];
    this.recordingSeconds.set(0);

    try {
      this.mediaRecorder = new MediaRecorder(this.cameraStream, { mimeType: 'video/webm' });
    } catch {
      this.mediaRecorder = new MediaRecorder(this.cameraStream);
    }

    this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
      if (event.data && event.data.size > 0) {
        this.recorderChunks.push(event.data);
      }
    };

    this.mediaRecorder.onstop = () => {
      const blob = new Blob(this.recorderChunks, { type: this.mediaRecorder?.mimeType || 'video/webm' });
      const file = new File([blob], `agreement-consent-${Date.now()}.webm`, { type: blob.type || 'video/webm' });
      this.setSelectedVideo(file);
      this.recording.set(false);
      this.stopRecordTimer();
    };

    this.mediaRecorder.start(500);
    this.recording.set(true);
    this.startRecordTimer();
  }

  private startRecordTimer(): void {
    this.stopRecordTimer();
    this.recordTimer = window.setInterval(() => {
      const next = this.recordingSeconds() + 1;
      this.recordingSeconds.set(next);
      if (next >= 60) {
        this.stopRecording(true);
      }
    }, 1000);
  }

  private stopRecordTimer(): void {
    if (this.recordTimer !== null) {
      window.clearInterval(this.recordTimer);
      this.recordTimer = null;
    }
  }

  private stopRecording(stopRecorder: boolean): void {
    if (stopRecorder && this.mediaRecorder && this.recording()) {
      this.mediaRecorder.stop();
    }
    this.recording.set(false);
    this.stopRecordTimer();
  }

  private setSelectedVideo(file: File): void {
    this.clearSelectedVideoPreview();
    this.selectedVideoFile.set(file);
    this.selectedVideoUrl.set(URL.createObjectURL(file));
  }

  private clearSelectedVideoPreview(): void {
    const currentUrl = this.selectedVideoUrl();
    if (currentUrl && currentUrl.startsWith('blob:')) {
      URL.revokeObjectURL(currentUrl);
    }
  }

  private validateVideoDuration(file: File): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        const duration = Number(video.duration || 0);
        URL.revokeObjectURL(url);
        resolve(duration > 0 && duration <= 60);
      };
      video.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('metadata_error'));
      };
      video.src = url;
    });
  }
}
