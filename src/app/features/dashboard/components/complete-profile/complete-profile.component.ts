import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../../../core/services/notification.service';
import { AuthService, BackendUserProfileResponse } from '../../../../core/services/auth.service';
import { DashboardNavComponent } from '../dashboard-nav/dashboard-nav.component';
import { UploadZoneComponent } from '../../../../shared/components/upload-zone/upload-zone.component';
import { DeviceStockApiService } from '../../../../core/services/device-stock-api.service';
import { DeviceStock } from '../../../../core/models/device-stock.model';

@Component({
  selector: 'app-complete-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DashboardNavComponent, UploadZoneComponent],
  template: `
    <app-dashboard-nav></app-dashboard-nav>

    <main class="min-h-screen bg-surface-2 pb-32 pt-16 md:pb-14 md:pl-[300px] md:pt-24">
      <div class="w-full px-3 py-4 sm:px-4 sm:py-6 lg:px-6 xl:px-8">
        <div *ngIf="loading()" class="rounded-2xl border border-border bg-surface p-8 flex items-center justify-center">
          <div class="w-8 h-8 border-2 border-surface-3 border-t-primary rounded-full animate-spin"></div>
        </div>

        <ng-container *ngIf="!loading()">
          <div class="grid gap-4 xl:grid-cols-[22rem_minmax(0,1fr)] xl:items-start">
            <section class="space-y-4 xl:sticky xl:top-24">
              <section class="rounded-3xl border border-warning/40 bg-warning/10 p-4 sm:p-5">
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div class="inline-flex items-center gap-2 rounded-full border border-warning/35 bg-white/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-warning">
                      <span class="inline-block h-2.5 w-2.5 rounded-full bg-warning animate-pulse"></span>
                      Priority
                    </div>
                    <h1 class="mt-3 text-lg font-bold text-warning sm:text-xl">Please fill your details as soon as possible</h1>
                    <p class="mt-1 text-sm leading-6 text-warning/90">
                      Complete your profile early to help us review your case properly and prepare the best EMI offer for you.
                    </p>
                  </div>
                  <div class="rounded-full border border-warning/40 bg-warning/15 px-3 py-1 text-xs font-semibold text-warning">
                    {{ progress() }}% Complete
                  </div>
                </div>
                <div class="mt-4 inline-flex items-center gap-2 rounded-2xl border border-warning/30 bg-white/55 px-3 py-2 text-sm font-medium text-warning/95">
                  <span class="inline-block h-2 w-2 rounded-full bg-warning animate-pulse"></span>
                  Finish all required fields to continue smoothly in the EMI process.
                </div>
              </section>

              <section class="rounded-3xl border border-border bg-surface p-4 sm:p-5">
                <div class="flex items-center justify-between gap-3">
                  <div>
                    <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Progress</p>
                    <p class="mt-1 text-sm text-secondary">{{ missingFields().length }} step{{ missingFields().length === 1 ? '' : 's' }} still required</p>
                  </div>
                  <div class="text-right">
                    <p class="text-2xl font-bold text-primary">{{ progress() }}%</p>
                  </div>
                </div>
                <div class="mt-3 h-2 overflow-hidden rounded-full bg-surface-2">
                  <div class="h-full rounded-full bg-primary transition-all duration-300" [style.width.%]="progress()"></div>
                </div>
                <div class="mt-4 space-y-2">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Still needed</p>
                  <div class="flex flex-wrap gap-2">
                    <span *ngFor="let label of missingFieldLabels()" class="rounded-full border border-border bg-surface-2 px-3 py-1 text-[11px] font-medium text-secondary">
                      {{ label }}
                    </span>
                  </div>
                </div>
              </section>

              <section class="rounded-3xl border border-border bg-surface p-4 sm:p-5">
                <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Helpful notes</p>
                <div class="mt-3 space-y-3 text-sm leading-6 text-secondary">
                  <p>
                    <span class="font-semibold text-primary">Requested amount</span> means the total price of your device.
                    {{ requestedAmountHelperText() }}
                  </p>
                  <p>
                    <span class="font-semibold text-primary">Live photo</span> means your own photo taken in good light, with your face clearly visible, captured on the same day.
                  </p>
                  <p>
                    <span class="font-semibold text-primary">Spouse occupation</span> means what your husband or wife does, only if you are married.
                  </p>
                </div>
                <div *ngIf="currentDeviceCode()" class="mt-4 rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Selected Device Code</p>
                  <p class="mt-1 text-sm font-semibold text-primary">{{ currentDeviceCode() }}</p>
                  <p *ngIf="deviceStockMatch()" class="mt-1 text-[12px] text-secondary">
                    {{ deviceStockMatch()?.brand }} {{ deviceStockMatch()?.model }} {{ deviceStockMatch()?.variant }} at INR {{ deviceStockMatch()?.discounted_price | number }}
                  </p>
                </div>
              </section>
            </section>

            <section class="space-y-4">
              <section class="rounded-3xl border border-border bg-surface p-4 shadow-sm sm:p-6 lg:p-7">
                <h2 class="text-xl font-bold text-primary sm:text-2xl">Complete Your Profile</h2>
                <p class="mt-1 text-sm leading-6 text-secondary">
                  Fill every required step below. You will move ahead only after this page is fully completed.
                </p>
              </section>

              <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="space-y-4">
                <section class="rounded-3xl border border-border bg-surface p-4 shadow-sm sm:p-6">
                  <div class="mb-4">
                    <h3 class="text-lg font-semibold text-primary">Contact and Address</h3>
                    <p class="mt-1 text-sm text-secondary">Use your active number and the address where you currently stay.</p>
                  </div>

                  <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label class="mb-1.5 block text-[13px] font-medium text-primary sm:text-sm">Mobile Number</label>
                      <input
                        type="tel"
                        formControlName="mobile_number"
                        class="w-full rounded-2xl border border-border bg-surface px-3.5 py-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 sm:text-[15px]"
                        placeholder="10 to 15 digits" />
                      <p *ngIf="fieldError('mobile_number')" class="mt-1 text-[12px] text-error">{{ fieldError('mobile_number') }}</p>
                    </div>

                    <div>
                      <label class="mb-1.5 block text-[13px] font-medium text-primary sm:text-sm">Marital Status</label>
                      <select
                        formControlName="marital_status"
                        class="w-full rounded-2xl border border-border bg-surface px-3.5 py-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 sm:text-[15px]">
                        <option value="">Select status</option>
                        <option value="married">Married</option>
                        <option value="unmarried">Unmarried</option>
                      </select>
                      <p *ngIf="fieldError('marital_status')" class="mt-1 text-[12px] text-error">{{ fieldError('marital_status') }}</p>
                    </div>

                    <div class="md:col-span-2" *ngIf="profileForm.get('marital_status')?.value === 'married'">
                      <label class="mb-1.5 block text-[13px] font-medium text-primary sm:text-sm">Spouse Occupation</label>
                      <textarea
                        rows="2"
                        formControlName="spouse_occupation"
                        class="w-full rounded-2xl border border-border bg-surface px-3.5 py-3 text-sm outline-none resize-none focus:border-accent focus:ring-2 focus:ring-accent/20 sm:text-[15px]"
                        placeholder="Tell us what your husband or wife does."></textarea>
                      <p class="mt-1 text-[12px] text-secondary">If married, mention your husband or wife occupation here.</p>
                      <p *ngIf="fieldError('spouse_occupation')" class="mt-1 text-[12px] text-error">{{ fieldError('spouse_occupation') }}</p>
                    </div>

                    <div>
                      <label class="mb-1.5 block text-[13px] font-medium text-primary sm:text-sm">PIN Code</label>
                      <input
                        type="text"
                        formControlName="pincode"
                        class="w-full rounded-2xl border border-border bg-surface px-3.5 py-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 sm:text-[15px]"
                        placeholder="6 digits" />
                      <p *ngIf="fieldError('pincode')" class="mt-1 text-[12px] text-error">{{ fieldError('pincode') }}</p>
                    </div>

                    <div>
                      <label class="mb-1.5 block text-[13px] font-medium text-primary sm:text-sm">City</label>
                      <input
                        type="text"
                        formControlName="city"
                        class="w-full rounded-2xl border border-border bg-surface px-3.5 py-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 sm:text-[15px]"
                        placeholder="City name" />
                      <p *ngIf="fieldError('city')" class="mt-1 text-[12px] text-error">{{ fieldError('city') }}</p>
                    </div>

                    <div class="md:col-span-2">
                      <label class="mb-1.5 block text-[13px] font-medium text-primary sm:text-sm">Full Address</label>
                      <textarea
                        rows="2"
                        formControlName="full_address"
                        class="w-full rounded-2xl border border-border bg-surface px-3.5 py-3 text-sm outline-none resize-none focus:border-accent focus:ring-2 focus:ring-accent/20 sm:text-[15px]"
                        placeholder="House, street, area"></textarea>
                      <p *ngIf="fieldError('full_address')" class="mt-1 text-[12px] text-error">{{ fieldError('full_address') }}</p>
                    </div>
                  </div>
                </section>

                <section class="rounded-3xl border border-border bg-surface p-4 shadow-sm sm:p-6">
                  <div class="mb-4">
                    <h3 class="text-lg font-semibold text-primary">Work and Device Details</h3>
                    <p class="mt-1 text-sm text-secondary">Tell us what you do, your income, and the total price of the device you want.</p>
                  </div>

                  <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label class="mb-1.5 block text-[13px] font-medium text-primary sm:text-sm">Employment Type</label>
                      <select
                        formControlName="employment_type"
                        class="w-full rounded-2xl border border-border bg-surface px-3.5 py-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 sm:text-[15px]">
                        <option value="">Select employment type</option>
                        <option value="salaried">Salaried</option>
                        <option value="self-employed">Self-Employed</option>
                        <option value="student">Student</option>
                      </select>
                      <p *ngIf="fieldError('employment_type')" class="mt-1 text-[12px] text-error">{{ fieldError('employment_type') }}</p>
                    </div>

                    <div>
                      <label class="mb-1.5 block text-[13px] font-medium text-primary sm:text-sm">Monthly Salary (INR)</label>
                      <input
                        type="number"
                        formControlName="monthly_salary"
                        class="w-full rounded-2xl border border-border bg-surface px-3.5 py-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 sm:text-[15px]"
                        placeholder="50000" />
                      <p *ngIf="fieldError('monthly_salary')" class="mt-1 text-[12px] text-error">{{ fieldError('monthly_salary') }}</p>
                    </div>

                    <div class="md:col-span-2">
                      <label class="mb-1.5 block text-[13px] font-medium text-primary sm:text-sm">Requested Amount (Device Price in INR)</label>
                      <input
                        type="number"
                        formControlName="requested_amount"
                        class="w-full rounded-2xl border border-border bg-surface px-3.5 py-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 sm:text-[15px]"
                        [placeholder]="deviceStockMatch() ? 'Auto-filled from your device code' : 'Enter total price of your device'" />
                      <p class="mt-1 text-[12px] text-secondary">{{ requestedAmountHelperText() }}</p>
                      <p *ngIf="fieldError('requested_amount')" class="mt-1 text-[12px] text-error">{{ fieldError('requested_amount') }}</p>
                    </div>

                    <div class="md:col-span-2">
                      <label class="mb-1.5 block text-[13px] font-medium text-primary sm:text-sm">What You Do</label>
                      <textarea
                        rows="2"
                        formControlName="what_you_do"
                        class="w-full rounded-2xl border border-border bg-surface px-3.5 py-3 text-sm outline-none resize-none focus:border-accent focus:ring-2 focus:ring-accent/20 sm:text-[15px]"
                        placeholder="I work in a bank, hotel, office, school, shop or I am a student"></textarea>
                      <p *ngIf="fieldError('what_you_do')" class="mt-1 text-[12px] text-error">{{ fieldError('what_you_do') }}</p>
                    </div>
                  </div>
                </section>

                <section class="rounded-3xl border border-border bg-surface p-4 shadow-sm sm:p-6">
                  <div class="mb-4">
                    <h3 class="text-lg font-semibold text-primary">Identity Details</h3>
                    <p class="mt-1 text-sm text-secondary">Make sure your Aadhaar and PAN numbers are correct before saving.</p>
                  </div>

                  <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label class="mb-1.5 block text-[13px] font-medium text-primary sm:text-sm">Aadhaar Number</label>
                      <input
                        type="text"
                        formControlName="aadhar_number"
                        class="w-full rounded-2xl border border-border bg-surface px-3.5 py-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 sm:text-[15px]"
                        placeholder="12 digits" />
                      <p *ngIf="fieldError('aadhar_number')" class="mt-1 text-[12px] text-error">{{ fieldError('aadhar_number') }}</p>
                    </div>

                    <div>
                      <label class="mb-1.5 block text-[13px] font-medium text-primary sm:text-sm">PAN Number</label>
                      <input
                        type="text"
                        formControlName="pan_number"
                        class="w-full rounded-2xl border border-border bg-surface px-3.5 py-3 text-sm uppercase outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 sm:text-[15px]"
                        placeholder="ABCDE1234F" />
                      <p *ngIf="fieldError('pan_number')" class="mt-1 text-[12px] text-error">{{ fieldError('pan_number') }}</p>
                    </div>
                  </div>
                </section>

                <section class="rounded-3xl border border-border bg-surface p-4 shadow-sm sm:p-6">
                  <div class="mb-4">
                    <h3 class="text-lg font-semibold text-primary">Required Uploads</h3>
                    <p class="mt-1 text-sm text-secondary">Upload clear proofs. Blurry or unreadable files will slow your review.</p>
                  </div>

                  <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label class="mb-2 block text-[13px] font-medium text-primary sm:text-sm">Aadhaar Proof</label>
                      <p class="mb-2 text-[12px] text-secondary">Upload a clear image or video of your Aadhaar document.</p>
                      <app-upload-zone
                        label="Upload Aadhaar proof"
                        hint="Image or video file"
                        accept="image/*,video/*"
                        [uploading]="false"
                        [progress]="0"
                        (fileDropped)="onAadharProofSelected($event)">
                      </app-upload-zone>
                      <p *ngIf="existingAadharFileName()" class="mt-1 text-[12px] text-secondary">
                        Existing file: {{ existingAadharFileName() }}
                      </p>
                      <p *ngIf="fileError('aadhar_image')" class="mt-1 text-[12px] text-error">{{ fileError('aadhar_image') }}</p>
                    </div>

                    <div>
                      <label class="mb-2 block text-[13px] font-medium text-primary sm:text-sm">PAN Proof</label>
                      <p class="mb-2 text-[12px] text-secondary">Upload a clear image or video of your PAN document.</p>
                      <app-upload-zone
                        label="Upload PAN proof"
                        hint="Image or video file"
                        accept="image/*,video/*"
                        [uploading]="false"
                        [progress]="0"
                        (fileDropped)="onPanProofSelected($event)">
                      </app-upload-zone>
                      <p *ngIf="existingPanFileName()" class="mt-1 text-[12px] text-secondary">
                        Existing file: {{ existingPanFileName() }}
                      </p>
                      <p *ngIf="fileError('pancard_image')" class="mt-1 text-[12px] text-error">{{ fileError('pancard_image') }}</p>
                    </div>

                    <div class="md:col-span-2">
                      <label class="mb-2 block text-[13px] font-medium text-primary sm:text-sm">Live Photo</label>
                      <p class="mb-2 text-[12px] text-secondary">Take your own photo in good light, face clearly visible, captured on the same day.</p>
                      <app-upload-zone
                        label="Upload live photo"
                        hint="Image only"
                        accept="image/*"
                        [uploading]="false"
                        [progress]="0"
                        (fileDropped)="onLivePhotoSelected($event)">
                      </app-upload-zone>
                      <p *ngIf="existingLivePhotoName()" class="mt-1 text-[12px] text-secondary">
                        Existing file: {{ existingLivePhotoName() }}
                      </p>
                      <p *ngIf="fileError('live_photo')" class="mt-1 text-[12px] text-error">{{ fileError('live_photo') }}</p>
                    </div>
                  </div>
                </section>

                <div *ngIf="generalError()" class="rounded-2xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
                  {{ generalError() }}
                </div>

                <section class="rounded-3xl border border-border bg-surface p-4 shadow-sm sm:p-6">
                  <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p class="text-sm font-semibold text-primary">Save only after all steps are completed</p>
                      <p class="mt-1 text-[12px] text-secondary">Until this is complete, the rest of your dashboard stays locked.</p>
                    </div>
                    <button
                      type="submit"
                      [disabled]="submitting()"
                      class="inline-flex w-full items-center justify-center rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white disabled:opacity-60 sm:w-auto">
                      {{ submitting() ? 'Saving...' : 'Save & Continue' }}
                    </button>
                  </div>
                </section>
              </form>
            </section>
          </div>
        </ng-container>
      </div>
    </main>
  `,
  styles: [`
    @keyframes softPulse {
      0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.24); }
      70% { box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); }
      100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
    }

    .animate-soft-pulse {
      animation: softPulse 2.2s ease-in-out infinite;
    }
  `]
})
export class CompleteProfileComponent implements OnInit, OnDestroy {
  readonly lockedSections = ['Support Chat', 'Payments', 'Community', 'Private Chats', 'Agreements'];
  loading = signal(true);
  submitting = signal(false);
  generalError = signal('');
  apiErrors = signal<Record<string, string>>({});
  missingFields = signal<string[]>([]);
  progress = signal(0);
  attemptedSubmit = signal(false);
  currentDeviceCode = signal('');
  deviceStockMatch = signal<DeviceStock | null>(null);

  existingAadharFileName = signal('');
  existingPanFileName = signal('');
  existingLivePhotoName = signal('');

  selectedAadharProof = signal<File | null>(null);
  selectedPanProof = signal<File | null>(null);
  selectedLivePhoto = signal<File | null>(null);

  profileForm: FormGroup;

  private redirectAfterSave = '/dashboard';
  private valueChangesSub?: Subscription;
  private maritalSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private deviceStockApi: DeviceStockApiService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.profileForm = this.fb.group({
      mobile_number: ['', [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]],
      marital_status: ['', [Validators.required]],
      spouse_occupation: [''],
      pincode: ['', [Validators.required, Validators.pattern(/^[1-9][0-9]{5}$/)]],
      city: ['', [Validators.required]],
      full_address: ['', [Validators.required, Validators.minLength(3)]],
      employment_type: ['', [Validators.required]],
      what_you_do: ['', [Validators.required, Validators.minLength(3)]],
      monthly_salary: ['', [Validators.required, Validators.min(1)]],
      requested_amount: ['', [Validators.required, Validators.min(1)]],
      aadhar_number: ['', [Validators.required, Validators.pattern(/^[0-9]{12}$/)]],
      pan_number: ['', [Validators.required, Validators.pattern(/^[A-Za-z]{5}[0-9]{4}[A-Za-z]$/)]]
    });
  }

  ngOnInit(): void {
    const redirect = this.route.snapshot.queryParamMap.get('redirect');
    if (redirect && redirect.startsWith('/dashboard') && !redirect.startsWith('/dashboard/complete-profile')) {
      this.redirectAfterSave = redirect;
    }

    this.setupSpouseValidation();
    this.loadStockReference();
    this.loadProfile();

    this.valueChangesSub = this.profileForm.valueChanges.subscribe(() => {
      this.refreshLocalCompletionHint();
    });
  }

  ngOnDestroy(): void {
    this.valueChangesSub?.unsubscribe();
    this.maritalSub?.unsubscribe();
  }

  onAadharProofSelected(file: File): void {
    this.selectedAadharProof.set(file);
    this.apiErrors.update(errors => ({ ...errors, aadhar_image: '' }));
    this.refreshLocalCompletionHint();
  }

  onPanProofSelected(file: File): void {
    this.selectedPanProof.set(file);
    this.apiErrors.update(errors => ({ ...errors, pancard_image: '' }));
    this.refreshLocalCompletionHint();
  }

  onLivePhotoSelected(file: File): void {
    this.selectedLivePhoto.set(file);
    this.apiErrors.update(errors => ({ ...errors, live_photo: '' }));
    this.refreshLocalCompletionHint();
  }

  fieldError(fieldName: string): string {
    const apiError = this.apiErrors()[fieldName];
    if (apiError) {
      return apiError;
    }

    const control = this.profileForm.get(fieldName);
    if (!control) {
      return '';
    }

    const shouldShow = control.invalid && (control.touched || control.dirty || this.attemptedSubmit());
    if (!shouldShow) {
      return '';
    }

    if (control.errors?.['required']) {
      return 'This field is required.';
    }
    if (control.errors?.['pattern']) {
      if (fieldName === 'mobile_number') return 'Enter a valid 10 to 15 digit mobile number.';
      if (fieldName === 'pincode') return 'Enter a valid 6 digit pin code.';
      if (fieldName === 'aadhar_number') return 'Aadhar number must be 12 digits.';
      if (fieldName === 'pan_number') return 'PAN format should be ABCDE1234F.';
    }
    if (control.errors?.['min']) {
      return 'Value must be greater than 0.';
    }
    if (control.errors?.['minlength']) {
      return 'Please enter more details.';
    }

    return 'Invalid value.';
  }

  missingFieldLabels(): string[] {
    return this.missingFields().map((fieldName) => this.fieldLabel(fieldName)).slice(0, 8);
  }

  requestedAmountHelperText(): string {
    const stock = this.deviceStockMatch();
    if (stock) {
      return `We auto-filled this from device code ${stock.device_code} for ${stock.brand} ${stock.model} ${stock.variant || ''}`.trim() + `. You can change it only if your final device price is different.`;
    }
    if (this.currentDeviceCode()) {
      return `Your device code ${this.currentDeviceCode()} is not in the stock list right now. Enter the total price of the device manually here.`;
    }
    return 'Enter the full price of the device you want to buy on EMI.';
  }

  fileError(fieldName: 'aadhar_image' | 'pancard_image' | 'live_photo'): string {
    const apiError = this.apiErrors()[fieldName];
    if (apiError) {
      return apiError;
    }

    if (!this.attemptedSubmit()) {
      return '';
    }

    if (fieldName === 'aadhar_image' && !this.hasAadharProof()) {
      return 'Aadhar proof is required.';
    }
    if (fieldName === 'pancard_image' && !this.hasPanProof()) {
      return 'PAN proof is required.';
    }
    if (fieldName === 'live_photo' && !this.hasLivePhoto()) {
      return 'Live photo is required.';
    }

    return '';
  }

  onSubmit(): void {
    this.attemptedSubmit.set(true);
    this.generalError.set('');
    this.apiErrors.set({});

    this.profileForm.markAllAsTouched();
    if (this.profileForm.invalid || !this.hasAllRequiredFiles()) {
      this.refreshLocalCompletionHint();
      this.generalError.set('Please complete all required fields before saving.');
      return;
    }

    const raw = this.profileForm.getRawValue();
    const payload = new FormData();
    payload.append('mobile_number', String(raw.mobile_number || '').trim());
    payload.append('marital_status', String(raw.marital_status || '').trim().toLowerCase());
    payload.append('spouse_occupation', String(raw.spouse_occupation || '').trim());
    payload.append('pincode', String(raw.pincode || '').trim());
    payload.append('city', String(raw.city || '').trim());
    payload.append('full_address', String(raw.full_address || '').trim());
    payload.append('employment_type', String(raw.employment_type || '').trim());
    payload.append('what_you_do', String(raw.what_you_do || '').trim());
    payload.append('monthly_salary', String(raw.monthly_salary || '').trim());
    payload.append('requested_amount', String(raw.requested_amount || '').trim());
    payload.append('aadhar_number', String(raw.aadhar_number || '').trim());
    payload.append('pan_number', String(raw.pan_number || '').trim().toUpperCase());

    if (this.selectedAadharProof()) {
      payload.append('aadhar_image', this.selectedAadharProof() as Blob);
    }
    if (this.selectedPanProof()) {
      payload.append('pancard_image', this.selectedPanProof() as Blob);
    }
    if (this.selectedLivePhoto()) {
      payload.append('live_photo', this.selectedLivePhoto() as Blob);
    }

    this.submitting.set(true);
    this.authService.updateBackendUserProfile(payload).subscribe({
      next: (response) => {
        this.submitting.set(false);
        this.applyProfilePayload(response);
        this.notificationService.success('Profile updated successfully.');

        if (response.profile_complete) {
          void this.router.navigateByUrl(this.redirectAfterSave);
        }
      },
      error: (err) => {
        this.submitting.set(false);
        const errBody = err?.error || {};
        const nextErrors: Record<string, string> = {};

        Object.keys(errBody || {}).forEach((key) => {
          const value = errBody[key];
          if (Array.isArray(value)) {
            nextErrors[key] = String(value[0] || '');
          } else if (typeof value === 'string') {
            nextErrors[key] = value;
          }
        });

        this.apiErrors.set(nextErrors);
        this.generalError.set(
          nextErrors['non_field_errors']
          || nextErrors['error']
          || 'Could not save profile. Please check the highlighted fields.'
        );
      }
    });
  }

  private setupSpouseValidation(): void {
    const spouseControl = this.profileForm.get('spouse_occupation');
    const maritalControl = this.profileForm.get('marital_status');
    if (!spouseControl || !maritalControl) {
      return;
    }

    const applyRule = (status: unknown) => {
      if (String(status || '').toLowerCase() === 'married') {
        spouseControl.setValidators([Validators.required, Validators.minLength(3)]);
      } else {
        spouseControl.clearValidators();
        spouseControl.setValue('', { emitEvent: false });
      }
      spouseControl.updateValueAndValidity({ emitEvent: false });
      this.refreshLocalCompletionHint();
    };

    applyRule(maritalControl.value);
    this.maritalSub = maritalControl.valueChanges.subscribe((status) => applyRule(status));
  }

  private loadProfile(): void {
    this.loading.set(true);
    this.authService.getBackendUserProfile().subscribe({
      next: (response) => {
        this.applyProfilePayload(response);
        this.loading.set(false);
        if (response.profile_complete) {
          void this.router.navigateByUrl(this.redirectAfterSave);
        }
      },
      error: () => {
        this.loading.set(false);
        this.generalError.set('Could not load profile data. Please refresh and try again.');
      }
    });
  }

  private applyProfilePayload(response: BackendUserProfileResponse): void {
    this.currentDeviceCode.set(String(response.device_code || '').trim().toUpperCase());
    this.profileForm.patchValue({
      mobile_number: response.mobile_number || '',
      marital_status: response.marital_status || '',
      spouse_occupation: response.spouse_occupation || '',
      pincode: response.pincode || '',
      city: response.city || '',
      full_address: response.full_address || '',
      employment_type: response.employment_type || '',
      what_you_do: response.what_you_do || '',
      monthly_salary: response.monthly_salary || '',
      requested_amount: response.requested_amount || '',
      aadhar_number: response.aadhar_number || '',
      pan_number: response.pan_number || ''
    }, { emitEvent: false });

    this.syncDevicePriceHint(String(response.requested_amount || '').trim());

    const maritalStatus = String(response.marital_status || '').toLowerCase();
    if (maritalStatus === 'married') {
      const spouseControl = this.profileForm.get('spouse_occupation');
      spouseControl?.setValidators([Validators.required, Validators.minLength(3)]);
      spouseControl?.updateValueAndValidity({ emitEvent: false });
    }

    this.existingAadharFileName.set(this.fileName(response.aadhar_image));
    this.existingPanFileName.set(this.fileName(response.pancard_image));
    this.existingLivePhotoName.set(this.fileName(response.live_photo));

    this.missingFields.set(Array.isArray(response.missing_fields) ? response.missing_fields : this.computeLocalMissingFields());
    this.progress.set(Number(response.profile_progress ?? 0));
    this.refreshLocalCompletionHint();
  }

  private refreshLocalCompletionHint(): void {
    const missing = this.computeLocalMissingFields();
    this.missingFields.set(missing);

    const total = this.totalRequiredFields();
    const completed = total - missing.length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 100;
    this.progress.set(pct);
  }

  private computeLocalMissingFields(): string[] {
    const raw = this.profileForm.getRawValue();
    const missing: string[] = [];

    const requiredFields = [
      'mobile_number',
      'marital_status',
      'pincode',
      'city',
      'full_address',
      'employment_type',
      'what_you_do',
      'monthly_salary',
      'requested_amount',
      'aadhar_number',
      'pan_number'
    ];

    requiredFields.forEach((fieldName) => {
      const value = raw[fieldName];
      if (value === null || value === undefined || String(value).trim() === '') {
        missing.push(fieldName);
      }
    });

    if (String(raw.marital_status || '').toLowerCase() === 'married' && String(raw.spouse_occupation || '').trim() === '') {
      missing.push('spouse_occupation');
    }

    if (!this.hasAadharProof()) {
      missing.push('aadhar_image');
    }
    if (!this.hasPanProof()) {
      missing.push('pancard_image');
    }
    if (!this.hasLivePhoto()) {
      missing.push('live_photo');
    }

    return missing;
  }

  private loadStockReference(): void {
    this.deviceStockApi.loadPublicStocks().subscribe(() => {
      this.syncDevicePriceHint(String(this.profileForm.get('requested_amount')?.value || '').trim());
    });
  }

  private syncDevicePriceHint(existingRequestedAmount: string): void {
    const deviceCode = this.currentDeviceCode();
    if (!deviceCode) {
      this.deviceStockMatch.set(null);
      return;
    }

    const matchedStock = this.deviceStockApi.publicStocks().find((item) => item.device_code === deviceCode) || null;
    this.deviceStockMatch.set(matchedStock);

    if (!matchedStock) {
      return;
    }

    if (!String(existingRequestedAmount || '').trim()) {
      this.profileForm.patchValue({
        requested_amount: String(matchedStock.discounted_price || matchedStock.price || '')
      }, { emitEvent: false });
      this.refreshLocalCompletionHint();
    }
  }

  private fieldLabel(fieldName: string): string {
    const labelMap: Record<string, string> = {
      mobile_number: 'Mobile Number',
      marital_status: 'Marital Status',
      spouse_occupation: 'Spouse Occupation',
      pincode: 'PIN Code',
      city: 'City',
      full_address: 'Full Address',
      employment_type: 'Employment Type',
      what_you_do: 'What You Do',
      monthly_salary: 'Monthly Salary',
      requested_amount: 'Requested Amount',
      aadhar_number: 'Aadhaar Number',
      pan_number: 'PAN Number',
      aadhar_image: 'Aadhaar Proof',
      pancard_image: 'PAN Proof',
      live_photo: 'Live Photo'
    };
    return labelMap[fieldName] || fieldName.replace(/_/g, ' ');
  }

  private totalRequiredFields(): number {
    const maritalStatus = String(this.profileForm.get('marital_status')?.value || '').toLowerCase();
    return maritalStatus === 'married' ? 15 : 14;
  }

  private hasAadharProof(): boolean {
    return !!this.selectedAadharProof() || !!this.existingAadharFileName();
  }

  private hasPanProof(): boolean {
    return !!this.selectedPanProof() || !!this.existingPanFileName();
  }

  private hasLivePhoto(): boolean {
    return !!this.selectedLivePhoto() || !!this.existingLivePhotoName();
  }

  private hasAllRequiredFiles(): boolean {
    return this.hasAadharProof() && this.hasPanProof() && this.hasLivePhoto();
  }

  private fileName(path: unknown): string {
    if (!path || typeof path !== 'string') {
      return '';
    }
    const parts = path.split('/');
    return parts[parts.length - 1] || '';
  }
}
