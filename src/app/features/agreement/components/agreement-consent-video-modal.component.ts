import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';

@Component({
  selector: 'app-agreement-consent-video-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="visible"
      class="fixed inset-0 z-[68] bg-[linear-gradient(180deg,rgba(8,20,36,0.24),rgba(8,20,36,0.72))] backdrop-blur-md">
      <div class="flex h-full w-full items-end justify-center sm:items-center sm:p-4">
        <div class="flex h-[100dvh] w-full flex-col overflow-hidden bg-[linear-gradient(180deg,#f9fbfe_0%,#f1f5fb_100%)] shadow-2xl sm:h-auto sm:max-h-[calc(100dvh-2rem)] sm:max-w-3xl sm:rounded-[32px] sm:border sm:border-white/70">
          <div class="shrink-0 px-4 pt-3 sm:px-5">
            <div class="mx-auto mb-3 h-1.5 w-14 rounded-full bg-primary/15 sm:hidden"></div>
          </div>

          <div class="shrink-0 border-b border-primary/10 bg-white/88 px-4 py-3 backdrop-blur-xl sm:rounded-t-[32px] sm:px-5">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/[0.04] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary/75">
                  <span class="inline-flex h-1.5 w-1.5 rounded-full bg-primary"></span>
                  Step 2 of 2
                </div>
                <h3 class="mt-2 text-[18px] font-bold leading-tight tracking-tight text-primary sm:text-[20px]">Consent Video Upload</h3>
                <p class="mt-1 text-[14px] leading-5 text-secondary">Record or upload a short proof video, review it properly, then finish the agreement.</p>
              </div>
              <button
                type="button"
                (click)="close.emit()"
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/10 bg-white text-secondary shadow-[0_8px_18px_rgba(15,39,71,0.08)] transition-colors hover:bg-surface-2 hover:text-primary"
                aria-label="Close consent video modal">
                ✕
              </button>
            </div>
          </div>

          <div #scrollRegion class="ios-sheet-scroll flex-1 overflow-y-auto overscroll-y-contain px-4 pb-[calc(1.1rem+env(safe-area-inset-bottom))] pt-4 sm:px-5">
            <div class="mb-4 grid grid-cols-3 gap-2">
              <div class="rounded-2xl border px-3 py-3 text-center" [ngClass]="cameraReady || recording || previewUrl ? 'border-primary/20 bg-primary/[0.05]' : 'border-primary/10 bg-white'">
                <div class="text-[11px] font-semibold uppercase tracking-[0.14em]" [ngClass]="cameraReady || recording || previewUrl ? 'text-primary' : 'text-secondary'">1</div>
                <div class="mt-1 text-[13px] font-semibold leading-4 text-primary">Open</div>
              </div>
              <div class="rounded-2xl border px-3 py-3 text-center" [ngClass]="recording || previewUrl ? 'border-primary/20 bg-primary/[0.05]' : 'border-primary/10 bg-white'">
                <div class="text-[11px] font-semibold uppercase tracking-[0.14em]" [ngClass]="recording || previewUrl ? 'text-primary' : 'text-secondary'">2</div>
                <div class="mt-1 text-[13px] font-semibold leading-4 text-primary">Record</div>
              </div>
              <div class="rounded-2xl border px-3 py-3 text-center" [ngClass]="previewUrl ? 'border-success/25 bg-success/[0.06]' : 'border-primary/10 bg-white'">
                <div class="text-[11px] font-semibold uppercase tracking-[0.14em]" [ngClass]="previewUrl ? 'text-success' : 'text-secondary'">3</div>
                <div class="mt-1 text-[13px] font-semibold leading-4 text-primary">Submit</div>
              </div>
            </div>

            <div class="rounded-[24px] border border-primary/16 bg-[linear-gradient(180deg,rgba(11,43,79,0.04),rgba(11,43,79,0.02))] p-4 sm:p-5">
              <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div class="min-w-0">
                  <div class="text-[11px] uppercase tracking-[0.16em] text-secondary">Read this on camera</div>
                  <p class="mt-2 text-[16px] font-semibold leading-7 text-primary agreement-script-copy sm:text-[17px]">
                    {{ script }}
                  </p>
                </div>
                <div class="flex shrink-0 flex-wrap gap-2">
                  <div class="rounded-full border border-success/20 bg-success/10 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-success">
                    Max 60 sec
                  </div>
                  <div class="rounded-full border border-primary/10 bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary/70">
                    Face visible
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-4 rounded-[24px] border border-primary/10 bg-white p-4 shadow-[0_16px_40px_rgba(15,39,71,0.06)]">
              <div class="mb-3 flex items-center justify-between gap-2">
                <div>
                  <h4 class="text-[17px] font-semibold tracking-tight text-primary">Capture area</h4>
                  <p class="mt-1 text-[14px] leading-5 text-secondary">Use a clean front-camera view or upload from gallery.</p>
                </div>
                <span *ngIf="recording" class="rounded-full border border-error/20 bg-error/10 px-2.5 py-1 text-[12px] font-semibold text-error">
                  Recording {{ recordingSeconds }}s / 60s
                </span>
              </div>

              <div *ngIf="!cameraSupported" class="mb-3 rounded-xl border border-warning/40 bg-warning/10 p-3 text-[14px] leading-5 text-secondary">
                Live recorder is not supported on this browser. Upload a video from gallery instead.
              </div>

              <div class="mb-4 grid grid-cols-2 gap-2.5">
                <button
                  *ngIf="cameraSupported && !cameraReady"
                  type="button"
                  (click)="startCamera.emit()"
                  [disabled]="cameraOpening || submitting"
                  class="inline-flex min-h-[52px] items-center justify-center rounded-2xl border border-primary/12 bg-primary/[0.04] px-3 py-3 text-[14px] font-semibold text-primary transition-colors hover:bg-primary/[0.07] disabled:opacity-50">
                  {{ cameraOpening ? 'Opening camera...' : 'Open Camera' }}
                </button>
                <button
                  *ngIf="cameraSupported && cameraReady && !recording"
                  type="button"
                  (click)="startRecording.emit()"
                  [disabled]="submitting"
                  class="inline-flex min-h-[52px] items-center justify-center rounded-2xl bg-primary px-3 py-3 text-[14px] font-semibold text-white shadow-[0_12px_24px_rgba(15,39,71,0.16)] transition-colors hover:bg-primary-light disabled:opacity-50">
                  Start Recording
                </button>
                <button
                  *ngIf="cameraSupported && cameraReady && recording"
                  type="button"
                  (click)="stopAndSave.emit()"
                  class="inline-flex min-h-[52px] items-center justify-center rounded-2xl bg-error px-3 py-3 text-[14px] font-semibold text-white shadow-[0_12px_24px_rgba(220,38,38,0.16)]">
                  Stop and Save
                </button>
                <button
                  *ngIf="cameraReady && !recording"
                  type="button"
                  (click)="stopCamera.emit()"
                  class="inline-flex min-h-[52px] items-center justify-center rounded-2xl border border-primary/12 bg-white px-3 py-3 text-[14px] font-semibold text-secondary transition-colors hover:bg-surface-2 hover:text-primary">
                  Close Camera
                </button>
                <button
                  *ngIf="previewUrl && !recording"
                  type="button"
                  (click)="retakeVideo.emit()"
                  [disabled]="submitting"
                  class="inline-flex min-h-[52px] items-center justify-center rounded-2xl border border-primary/12 bg-white px-3 py-3 text-[14px] font-semibold text-secondary transition-colors hover:bg-surface-2 hover:text-primary disabled:opacity-50">
                  Retake Video
                </button>
                <label class="col-span-2 cursor-pointer rounded-2xl border border-primary/12 bg-white px-3 py-3 text-center text-[14px] font-semibold text-primary transition-colors hover:bg-surface-2">
                  Upload From Gallery
                  <input type="file" class="hidden" accept="video/*" (change)="onFileSelected($event)">
                </label>
              </div>

              <p *ngIf="recording" class="mb-3 text-[14px] font-medium text-error">
                Recording started. Tap "Stop and Save" whenever done.
              </p>

              <p *ngIf="!recording && previewUrl" class="mb-3 text-[14px] font-medium text-success">
                Video saved successfully. Review it below, then tap Final Submit Agreement.
              </p>

              <div *ngIf="cameraError" class="mb-3 rounded-xl border border-error/40 bg-error/10 p-3 text-[14px] leading-5 text-error">
                {{ cameraError }}
              </div>

              <div
                #liveVideoCard
                *ngIf="cameraReady"
                class="mb-3 overflow-hidden rounded-[24px] border border-primary/10 bg-[linear-gradient(180deg,#071625_0%,#0d2239_100%)] p-2 shadow-[0_18px_40px_rgba(7,22,37,0.18)]">
                <div class="mb-2 flex items-center justify-between px-1">
                  <span class="text-[12px] font-semibold uppercase tracking-[0.14em] text-white/65">Live camera</span>
                  <span class="inline-flex items-center gap-1 rounded-full bg-white/8 px-2 py-1 text-[11px] font-medium text-white/80">
                    <span class="inline-flex h-1.5 w-1.5 rounded-full bg-success"></span>
                    Ready
                  </span>
                </div>
                <div class="overflow-hidden rounded-[18px] bg-black">
                  <video #liveVideo autoplay muted playsinline class="aspect-[9/16] max-h-[46dvh] w-full bg-black object-cover"></video>
                </div>
              </div>

              <div
                #previewCard
                *ngIf="previewUrl"
                class="overflow-hidden rounded-[24px] border border-success/15 bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] p-2 shadow-[0_16px_36px_rgba(15,39,71,0.08)]">
                <div class="mb-2 flex items-center justify-between px-2">
                  <span class="text-[12px] font-semibold uppercase tracking-[0.14em] text-secondary">Saved preview</span>
                  <span class="rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-semibold text-success">Ready to submit</span>
                </div>
                <div class="overflow-hidden rounded-[18px] bg-black">
                  <video [src]="previewUrl" controls playsinline class="aspect-[9/16] max-h-[46dvh] w-full bg-black object-contain"></video>
                </div>
              </div>
            </div>
          </div>

          <div class="shrink-0 border-t border-primary/10 bg-white/92 px-4 py-3 backdrop-blur-xl sm:rounded-b-[32px]">
            <div class="mb-2 flex items-center justify-between gap-3">
              <p class="text-[13px] font-medium text-secondary">
                {{ previewUrl ? 'Video reviewed. Final submit is ready.' : 'Add a video to unlock final submit.' }}
              </p>
            </div>
            <div class="flex items-center justify-between gap-3">
              <button
                type="button"
                (click)="close.emit()"
                class="rounded-2xl border border-primary/12 bg-white px-4 py-3 text-[14px] font-semibold text-primary transition-colors hover:bg-surface-2">
                Back
              </button>
              <button
                type="button"
                (click)="finalSubmit.emit()"
                [disabled]="submitting || !previewUrl"
                class="rounded-2xl bg-primary px-5 py-3 text-[14px] font-semibold text-white shadow-[0_14px_28px_rgba(15,39,71,0.18)] transition-colors hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60">
                {{ submitting ? 'Submitting...' : 'Final Submit Agreement' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ios-sheet-scroll {
      -webkit-overflow-scrolling: touch;
      touch-action: pan-y;
    }

    .agreement-script-copy {
      font-family: "Georgia", "Times New Roman", serif;
    }
  `]
})
export class AgreementConsentVideoModalComponent implements AfterViewInit, OnChanges {
  @Input() visible = false;
  @Input() script = '';
  @Input() cameraSupported = false;
  @Input() cameraReady = false;
  @Input() cameraOpening = false;
  @Input() recording = false;
  @Input() recordingSeconds = 0;
  @Input() cameraError = '';
  @Input() previewUrl = '';
  @Input() submitting = false;
  @Input() cameraStream: MediaStream | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() startCamera = new EventEmitter<void>();
  @Output() startRecording = new EventEmitter<void>();
  @Output() stopAndSave = new EventEmitter<void>();
  @Output() stopCamera = new EventEmitter<void>();
  @Output() retakeVideo = new EventEmitter<void>();
  @Output() finalSubmit = new EventEmitter<void>();
  @Output() fileSelected = new EventEmitter<File>();

  @ViewChild('liveVideo') liveVideoRef?: ElementRef<HTMLVideoElement>;
  @ViewChild('scrollRegion') scrollRegionRef?: ElementRef<HTMLDivElement>;
  @ViewChild('liveVideoCard') liveVideoCardRef?: ElementRef<HTMLDivElement>;
  @ViewChild('previewCard') previewCardRef?: ElementRef<HTMLDivElement>;

  ngAfterViewInit(): void {
    this.syncVideoState();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['cameraStream']
      || changes['cameraReady']
      || changes['previewUrl']
      || changes['visible']
    ) {
      setTimeout(() => this.syncVideoState(), 0);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.fileSelected.emit(file);
    }
    input.value = '';
  }

  private syncVideoState(): void {
    this.attachStreamToVideo();

    if (this.previewUrl) {
      this.scrollSectionIntoView(this.previewCardRef);
      return;
    }

    if (this.cameraReady) {
      this.scrollSectionIntoView(this.liveVideoCardRef);
    }
  }

  private attachStreamToVideo(): void {
    const video = this.liveVideoRef?.nativeElement;
    if (!video) {
      return;
    }

    if (!this.cameraStream) {
      video.pause();
      video.srcObject = null;
      return;
    }

    video.srcObject = this.cameraStream;
    video.play().catch(() => undefined);
  }

  private scrollSectionIntoView(target?: ElementRef<HTMLElement>): void {
    const container = this.scrollRegionRef?.nativeElement;
    const element = target?.nativeElement;
    if (!container || !element) {
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    const nextTop = container.scrollTop + (elementRect.top - containerRect.top) - 12;
    container.scrollTo({ top: Math.max(nextTop, 0), behavior: 'smooth' });
  }
}
