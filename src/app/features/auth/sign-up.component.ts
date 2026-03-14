import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DeviceStock } from '../../core/models/device-stock.model';
import { DeviceStockApiService } from '../../core/services/device-stock-api.service';
import { NotificationService } from '../../core/services/notification.service';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NavbarComponent],
  template: `
    <app-navbar [hideAgentLogin]="true"></app-navbar>

    <section class="min-h-screen bg-surface-2 pt-16 sm:pt-20">
      <div class="w-full px-0 sm:px-3 lg:px-4 pb-4 sm:pb-6">
        <div class="w-full border-y border-border bg-surface shadow-[0_20px_60px_rgba(10,37,64,0.08)] sm:rounded-[2rem] sm:border">
          <div class="grid xl:grid-cols-[minmax(20rem,26rem)_1fr]">
            <aside class="border-b border-border bg-surface-2/70 p-4 sm:p-6 lg:p-8 xl:border-b-0 xl:border-r">
              <p class="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
                Create Account
              </p>
              <h1 class="mt-4 text-[1.9rem] font-display font-bold leading-tight text-primary sm:text-[2.4rem] lg:text-[2.8rem]">
                Create your account
              </h1>

              <div class="mt-5 space-y-3 sm:space-y-4">
                <div class="rounded-2xl border border-border bg-surface px-4 py-3">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">Device code help</p>
                  <p class="mt-1 text-sm leading-6 text-secondary">Search by brand, model, or exact code. If stock is not listed, enter the 6 character code manually.</p>
                </div>
              </div>
            </aside>

            <div class="p-4 sm:p-6 lg:p-8 xl:p-10">
              <div class="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 class="text-xl font-display font-bold text-primary sm:text-2xl">Your details</h2>
                </div>
                <a routerLink="/sign-in" class="inline-flex w-full items-center justify-center rounded-2xl border border-border px-4 py-3 text-sm font-semibold text-primary no-underline hover:bg-surface-2 sm:w-auto">
                  User Sign In
                </a>
              </div>

              <form [formGroup]="signUpForm" (ngSubmit)="onSubmit()" class="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3 xl:gap-5">
                <div>
                  <label for="firstName" class="mb-1.5 block text-[13px] font-medium text-primary sm:text-sm">First Name</label>
                  <input id="firstName" type="text" formControlName="firstName" placeholder="First name"
                    class="w-full rounded-2xl border border-border bg-surface px-3.5 py-3 text-sm text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 sm:text-[15px]" />
                  @if (showError('firstName')) {
                    <p class="mt-1 text-[12px] text-error">First name is required.</p>
                  }
                </div>

                <div>
                  <label for="lastName" class="mb-1.5 block text-[13px] font-medium text-primary sm:text-sm">Last Name</label>
                  <input id="lastName" type="text" formControlName="lastName" placeholder="Last name"
                    class="w-full rounded-2xl border border-border bg-surface px-3.5 py-3 text-sm text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 sm:text-[15px]" />
                </div>

                <div class="md:col-span-2 xl:col-span-3">
                  <label for="email" class="mb-1.5 block text-[13px] font-medium text-primary sm:text-sm">Email ID</label>
                  <input id="email" type="email" formControlName="email" placeholder="you@example.com"
                    class="w-full rounded-2xl border border-border bg-surface px-3.5 py-3 text-sm text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 sm:text-[15px]" />
                  @if (showError('email')) {
                    <p class="mt-1 text-[12px] text-error">{{ getEmailError() }}</p>
                  }
                </div>

                <div class="relative md:col-span-2 xl:col-span-3" data-device-code-combobox>
                  <label for="deviceCodeSearch" class="mb-1.5 block text-[13px] font-medium text-primary sm:text-sm">Device Code</label>
                  <input
                    id="deviceCodeSearch"
                    type="text"
                    [value]="deviceCodeQuery()"
                    autocomplete="off"
                    placeholder="Search device code, brand, or model"
                    (focus)="openDeviceDropdown()"
                    (input)="onDeviceCodeSearchInput($event)"
                    (keydown.enter)="onDeviceCodeEnter($event)"
                    class="w-full rounded-2xl border border-border bg-surface px-3.5 py-3 text-sm text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 sm:text-[15px]" />
                  <input type="hidden" formControlName="deviceCode" />
                  @if (showError('deviceCode')) {
                    <p class="mt-1 text-[12px] text-error">{{ getDeviceCodeError() }}</p>
                  }

                  @if (selectedDeviceStock()) {
                    <div class="mt-2 rounded-2xl border border-primary/15 bg-primary/5 px-3.5 py-3">
                      <div class="flex items-start justify-between gap-3">
                        <div class="min-w-0">
                          <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">Selected Device</p>
                          <p class="mt-1 text-sm font-semibold text-primary">{{ selectedDeviceStock()?.brand }} {{ selectedDeviceStock()?.model }} {{ selectedDeviceStock()?.variant }}</p>
                          <p class="mt-1 text-[12px] text-secondary">{{ selectedDeviceStock()?.device_type || 'Device' }}{{ selectedDeviceStock()?.color ? ' • ' + selectedDeviceStock()?.color : '' }}</p>
                          <p class="mt-1 text-[12px] text-secondary">Code: <span class="font-semibold text-primary">{{ selectedDeviceStock()?.device_code }}</span></p>
                        </div>
                        <button
                          type="button"
                          (click)="clearSelectedDeviceCode()"
                          class="shrink-0 rounded-xl border border-border px-3 py-2 text-[12px] font-semibold text-secondary hover:bg-surface hover:text-primary">
                          Change
                        </button>
                      </div>
                    </div>
                  } @else if (manualDeviceCode()) {
                    <div class="mt-2 rounded-2xl border border-accent/20 bg-accent/5 px-3.5 py-3">
                      <div class="flex items-start justify-between gap-3">
                        <div class="min-w-0">
                          <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">Manual Device Code</p>
                          <p class="mt-1 text-sm font-semibold text-primary">{{ manualDeviceCode() }}</p>
                          <p class="mt-1 text-[12px] text-secondary">This code is not in the stock list right now. Signup will continue with your typed code.</p>
                        </div>
                        <button
                          type="button"
                          (click)="clearSelectedDeviceCode()"
                          class="shrink-0 rounded-xl border border-border px-3 py-2 text-[12px] font-semibold text-secondary hover:bg-surface hover:text-primary">
                          Change
                        </button>
                      </div>
                    </div>
                  }

                  @if (deviceDropdownOpen()) {
                    <div class="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_45px_rgba(10,37,64,0.12)]">
                      <div class="border-b border-border bg-surface-2 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-secondary">
                        @if (deviceStocksLoading()) {
                          Loading stock list
                        } @else {
                          Select a device code
                        }
                      </div>
                      <div class="max-h-72 overflow-y-auto">
                        @if (deviceStocksLoading()) {
                          <div class="px-3.5 py-4 text-sm text-secondary">Loading available devices...</div>
                        } @else {
                          @if (manualDeviceCodeOption()) {
                            <button
                              type="button"
                              (click)="useManualDeviceCode()"
                              class="flex w-full items-start justify-between gap-3 border-b border-border/70 bg-accent/5 px-3.5 py-3 text-left transition-standard hover:bg-accent/10">
                              <div class="min-w-0">
                                <div class="flex items-center gap-2">
                                  <span class="rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-semibold text-accent">{{ manualDeviceCodeOption() }}</span>
                                  <span class="text-[12px] text-secondary">Manual entry</span>
                                </div>
                                <p class="mt-1 text-sm font-semibold text-primary">Use typed device code</p>
                                <p class="mt-1 text-[12px] text-secondary">No stock match found. Continue signup with this code.</p>
                              </div>
                            </button>
                          }
                          @if (filteredDeviceStocks().length === 0) {
                            <div class="px-3.5 py-4 text-sm text-secondary">No matching stock found. You can still continue with a valid 6 character device code.</div>
                          } @else {
                            @for (stock of filteredDeviceStocks(); track stock.id) {
                              <button
                                type="button"
                                (click)="selectDeviceCode(stock)"
                                class="flex w-full items-start justify-between gap-3 border-b border-border/70 px-3.5 py-3 text-left transition-standard last:border-b-0 hover:bg-surface-2">
                                <div class="min-w-0">
                                  <div class="flex items-center gap-2">
                                    <span class="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">{{ stock.device_code }}</span>
                                    <span class="text-[12px] text-secondary">{{ stock.in_stock ? 'In Stock' : 'Out of Stock' }}</span>
                                  </div>
                                  <p class="mt-1 text-sm font-semibold text-primary">{{ stock.brand }} {{ stock.model }} {{ stock.variant }}</p>
                                  <p class="mt-1 text-[12px] text-secondary">{{ stock.device_type || 'Device' }}{{ stock.color ? ' • ' + stock.color : '' }}</p>
                                </div>
                                <div class="shrink-0 text-right">
                                  <div class="text-[12px] text-secondary line-through">INR {{ stock.price | number }}</div>
                                  <div class="text-sm font-bold text-primary">INR {{ stock.discounted_price | number }}</div>
                                </div>
                              </button>
                            }
                          }
                        }
                      </div>
                    </div>
                  }

                  <p class="mt-1.5 text-[12px] leading-5 text-secondary sm:text-[13px]">
                    Search from stock or enter the 6 character device code manually. Need help? <a routerLink="/stocks" class="font-semibold text-primary no-underline hover:underline">Browse stocks</a>
                  </p>
                </div>

                <div>
                  <label for="mobileNumber" class="mb-1.5 block text-[13px] font-medium text-primary sm:text-sm">Mobile Number</label>
                  <input id="mobileNumber" type="tel" formControlName="mobileNumber" placeholder="10 digit mobile number"
                    class="w-full rounded-2xl border border-border bg-surface px-3.5 py-3 text-sm text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 sm:text-[15px]" />
                </div>

                <div>
                  <label for="maritalStatus" class="mb-1.5 block text-[13px] font-medium text-primary sm:text-sm">Marital Status</label>
                  <select id="maritalStatus" formControlName="maritalStatus"
                    class="w-full rounded-2xl border border-border bg-surface px-3.5 py-3 text-sm text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 sm:text-[15px]">
                    <option value="">Select status</option>
                    <option value="unmarried">Unmarried</option>
                    <option value="married">Married</option>
                  </select>
                </div>

                <div>
                  <label for="monthlySalaryInr" class="mb-1.5 block text-[13px] font-medium text-primary sm:text-sm">Monthly Salary (INR)</label>
                  <input id="monthlySalaryInr" type="number" formControlName="monthlySalaryInr" placeholder="50000"
                    class="w-full rounded-2xl border border-border bg-surface px-3.5 py-3 text-sm text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 sm:text-[15px]" />
                </div>

                <div class="md:col-span-2 xl:col-span-3">
                  <label for="occupationDetails" class="mb-1.5 block text-[13px] font-medium text-primary sm:text-sm">What You Do</label>
                  <textarea id="occupationDetails" rows="3" formControlName="occupationDetails" placeholder="I am a student or I work in a bank, hotel, office, shop, school."
                    class="w-full rounded-2xl border border-border bg-surface px-3.5 py-3 text-sm text-primary outline-none resize-none focus:border-accent focus:ring-2 focus:ring-accent/20 sm:text-[15px]"></textarea>
                </div>

                <div>
                  <label for="password" class="mb-1.5 block text-[13px] font-medium text-primary sm:text-sm">Password</label>
                  <input id="password" type="password" formControlName="password" placeholder="Minimum 4 characters"
                    class="w-full rounded-2xl border border-border bg-surface px-3.5 py-3 text-sm text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 sm:text-[15px]" />
                  @if (showError('password')) {
                    <p class="mt-1 text-[12px] text-error">Password must be at least 4 characters.</p>
                  }
                </div>

                <div>
                  <label for="confirmPassword" class="mb-1.5 block text-[13px] font-medium text-primary sm:text-sm">Confirm Password</label>
                  <input id="confirmPassword" type="password" formControlName="confirmPassword" placeholder="Retype password"
                    class="w-full rounded-2xl border border-border bg-surface px-3.5 py-3 text-sm text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 sm:text-[15px]" />
                  @if (passwordMismatch()) {
                    <p class="mt-1 text-[12px] text-error">Passwords do not match.</p>
                  }
                </div>

                @if (errorMessage()) {
                  <div class="md:col-span-2 xl:col-span-3 rounded-2xl border border-error/30 bg-error/10 px-3.5 py-3 text-sm text-error">
                    {{ errorMessage() }}
                  </div>
                }

                <div class="md:col-span-2 xl:col-span-3 flex flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap sm:items-center">
                  <button type="submit" [disabled]="submitting()"
                    class="inline-flex w-full items-center justify-center rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white disabled:opacity-60 sm:w-auto sm:text-[15px]">
                    {{ submitting() ? 'Creating Account...' : 'Create Account' }}
                  </button>
                  <a routerLink="/sign-in" class="inline-flex w-full items-center justify-center rounded-2xl border border-border px-5 py-3 text-sm font-semibold text-primary no-underline hover:bg-surface-2 sm:w-auto sm:text-[15px]">
                    Already have an account
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class SignUpComponent implements OnInit {
  submitting = signal(false);
  errorMessage = signal('');
  deviceCodeQuery = signal('');
  deviceDropdownOpen = signal(false);
  selectedDeviceStock = signal<DeviceStock | null>(null);
  manualDeviceCode = signal('');

  signUpForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private deviceStockApi: DeviceStockApiService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.signUpForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: [''],
      email: ['', [Validators.required, Validators.email]],
      deviceCode: ['', [Validators.required, Validators.pattern(/^[A-Z0-9]{6}$/)]],
      mobileNumber: [''],
      maritalStatus: [''],
      occupationDetails: [''],
      monthlySalaryInr: [''],
      password: ['', [Validators.required, Validators.minLength(4)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.deviceStockApi.loadPublicStocks().subscribe();
  }

  onSubmit(): void {
    this.errorMessage.set('');
    this.signUpForm.markAllAsTouched();
    if (this.signUpForm.invalid || this.passwordMismatch()) {
      return;
    }

    const value = this.signUpForm.value;
    this.submitting.set(true);
    this.authService.signupUserViaBackend({
      firstName: (value.firstName || '').trim(),
      lastName: (value.lastName || '').trim(),
      email: (value.email || '').trim(),
      deviceCode: (value.deviceCode || '').trim().toUpperCase(),
      mobileNumber: (value.mobileNumber || '').trim(),
      maritalStatus: value.maritalStatus || undefined,
      occupationDetails: (value.occupationDetails || '').trim(),
      monthlySalaryInr: value.monthlySalaryInr,
      password: (value.password || '').trim()
    }).subscribe(result => {
      this.submitting.set(false);
      if (!result.success) {
        this.errorMessage.set(result.message || 'Could not create account. Please try again.');
        return;
      }

      this.notificationService.success('Account created. Sign in successful.');
      const currentUser = this.authService.currentUserSignal();
      if (currentUser?.profileComplete === true) {
        void this.router.navigate(['/dashboard']);
        return;
      }

      void this.router.navigate(['/dashboard/complete-profile']);
    });
  }

  showError(controlName: string): boolean {
    const control = this.signUpForm.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  passwordMismatch(): boolean {
    const password = this.signUpForm.get('password')?.value || '';
    const confirmPassword = this.signUpForm.get('confirmPassword')?.value || '';
    if (!confirmPassword) {
      return false;
    }
    return password !== confirmPassword;
  }

  getEmailError(): string {
    const control = this.signUpForm.get('email');
    if (!control?.errors) return '';
    if (control.errors['required']) return 'Email id is required.';
    if (control.errors['email']) return 'Please enter a valid email id.';
    return 'Please enter a valid email id.';
  }

  getDeviceCodeError(): string {
    const control = this.signUpForm.get('deviceCode');
    if (!control?.errors) return '';
    if (control.errors['required']) return 'Please select a device or enter a valid 6 character device code.';
    if (control.errors['pattern']) return 'Device code must be exactly 6 uppercase letters or numbers.';
    return 'Please select a device or enter a valid 6 character device code.';
  }

  deviceStocksLoading(): boolean {
    return this.deviceStockApi.loadingPublic();
  }

  filteredDeviceStocks(): DeviceStock[] {
    const query = this.deviceCodeQuery().trim().toLowerCase();
    const rows = this.deviceStockApi.publicStocks();
    if (!query) {
      return rows.slice(0, 8);
    }
    return rows.filter((item) => {
      const haystack = `${item.device_code} ${item.brand} ${item.model} ${item.variant} ${item.color} ${item.device_type}`.toLowerCase();
      return haystack.includes(query);
    }).slice(0, 10);
  }

  openDeviceDropdown(): void {
    this.deviceDropdownOpen.set(true);
  }

  onDeviceCodeSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const value = String(input?.value || '').toUpperCase().replace(/[^A-Z0-9 ]/g, '').slice(0, 40);
    const trimmedValue = value.trim();
    this.deviceCodeQuery.set(value);
    this.deviceDropdownOpen.set(true);

    const exactMatch = this.deviceStockApi.publicStocks().find((item) => item.device_code === trimmedValue);
    if (exactMatch) {
      this.selectedDeviceStock.set(exactMatch);
      this.manualDeviceCode.set('');
      this.signUpForm.get('deviceCode')?.setValue(exactMatch.device_code, { emitEvent: false });
      return;
    }

    this.selectedDeviceStock.set(null);
    const manualCode = /^[A-Z0-9]{6}$/.test(trimmedValue) ? trimmedValue : '';
    this.manualDeviceCode.set(manualCode);
    this.signUpForm.get('deviceCode')?.setValue(manualCode, { emitEvent: false });
  }

  onDeviceCodeEnter(event: Event): void {
    event.preventDefault();
    const exact = this.filteredDeviceStocks().find((item) => item.device_code === this.deviceCodeQuery().trim().toUpperCase())
      || this.filteredDeviceStocks()[0];
    if (exact) {
      this.selectDeviceCode(exact);
      return;
    }
    if (this.manualDeviceCodeOption()) {
      this.useManualDeviceCode();
    }
  }

  selectDeviceCode(stock: DeviceStock): void {
    this.selectedDeviceStock.set(stock);
    this.manualDeviceCode.set('');
    this.deviceCodeQuery.set(`${stock.device_code} - ${stock.brand} ${stock.model}${stock.variant ? ' ' + stock.variant : ''}`.trim());
    this.signUpForm.get('deviceCode')?.setValue(stock.device_code, { emitEvent: false });
    this.signUpForm.get('deviceCode')?.markAsTouched();
    this.deviceDropdownOpen.set(false);
  }

  manualDeviceCodeOption(): string {
    const manualCode = this.manualDeviceCode();
    if (!manualCode) {
      return '';
    }
    const hasExactStockMatch = this.deviceStockApi.publicStocks().some((item) => item.device_code === manualCode);
    return hasExactStockMatch ? '' : manualCode;
  }

  useManualDeviceCode(): void {
    const manualCode = this.manualDeviceCodeOption();
    if (!manualCode) {
      return;
    }
    this.selectedDeviceStock.set(null);
    this.manualDeviceCode.set(manualCode);
    this.deviceCodeQuery.set(manualCode);
    this.signUpForm.get('deviceCode')?.setValue(manualCode, { emitEvent: false });
    this.signUpForm.get('deviceCode')?.markAsTouched();
    this.deviceDropdownOpen.set(false);
  }

  clearSelectedDeviceCode(): void {
    this.selectedDeviceStock.set(null);
    this.manualDeviceCode.set('');
    this.deviceCodeQuery.set('');
    this.signUpForm.get('deviceCode')?.setValue('', { emitEvent: false });
    this.signUpForm.get('deviceCode')?.markAsTouched();
    this.deviceDropdownOpen.set(true);
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target) {
      return;
    }
    if (target.closest('[data-device-code-combobox]')) {
      return;
    }
    this.deviceDropdownOpen.set(false);
  }
}
