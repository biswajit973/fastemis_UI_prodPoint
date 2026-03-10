import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';

interface TermsSection {
  id: number;
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

@Component({
  selector: 'app-terms-conditions',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  template: `
    <app-navbar></app-navbar>

    <main class="min-h-screen bg-surface-2 pt-24 pb-12 px-4 md:px-8">
      <div class="max-w-5xl mx-auto">
        <header class="rounded-2xl border border-border bg-surface p-5 md:p-8 shadow-sm mb-6">
          <p class="text-xs font-bold uppercase tracking-wider text-accent mb-2">Legal Document</p>
          <h1 class="text-2xl md:text-3xl font-bold text-primary mb-3">Terms & Conditions</h1>
          <p class="text-sm md:text-base text-secondary leading-relaxed">
            This document governs EMI-based purchases from Fastemis. Please read every section carefully before proceeding.
          </p>
          <div class="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <span class="rounded-full bg-surface-2 border border-border px-3 py-1 text-secondary">Version: 1.0</span>
            <span class="rounded-full bg-surface-2 border border-border px-3 py-1 text-secondary">Last Updated: March 3, 2026</span>
          </div>
        </header>

        <section class="space-y-4">
          <article *ngFor="let section of sections" class="rounded-2xl border border-border bg-surface p-5 md:p-6 shadow-sm">
            <h2 class="text-lg md:text-xl font-bold text-primary mb-3">{{ section.id }}. {{ section.title }}</h2>
            <p *ngFor="let line of section.paragraphs" class="text-sm md:text-base text-secondary leading-relaxed mb-3">
              {{ line }}
            </p>
            <ul *ngIf="section.bullets?.length" class="space-y-2 list-disc pl-5">
              <li *ngFor="let point of section.bullets" class="text-sm md:text-base text-secondary leading-relaxed">
                {{ point }}
              </li>
            </ul>
          </article>
        </section>

        <section class="rounded-2xl border border-border bg-surface p-5 md:p-6 shadow-sm mt-6">
          <h2 class="text-lg md:text-xl font-bold text-primary mb-3">Important Legal Notice</h2>
          <p class="text-sm md:text-base text-secondary mb-3">
            Failure to comply with EMI obligations may result in:
          </p>
          <ul class="space-y-2 list-disc pl-5">
            <li class="text-sm md:text-base text-secondary">Immediate device lock</li>
            <li class="text-sm md:text-base text-secondary">IMEI blocking</li>
            <li class="text-sm md:text-base text-secondary">Physical recovery</li>
            <li class="text-sm md:text-base text-secondary">Legal proceedings</li>
            <li class="text-sm md:text-base text-secondary">Financial penalties</li>
            <li class="text-sm md:text-base text-secondary">Credit impact (if applicable)</li>
          </ul>
          <p class="text-sm md:text-base text-secondary mt-4 font-medium">
            By proceeding with purchase, the customer confirms full understanding and acceptance of this strict no-refund agreement.
          </p>
        </section>

        <div class="mt-6 flex flex-wrap gap-3">
          <a routerLink="/" class="inline-flex items-center rounded-lg border border-border bg-surface px-4 py-2 text-sm text-primary no-underline hover:bg-surface-2">
            Back to Home
          </a>
        </div>
      </div>
    </main>
  `
})
export class TermsConditionsComponent {
  sections: TermsSection[] = [
    {
      id: 1,
      title: 'Introduction',
      paragraphs: [
        'These Terms & Conditions ("Agreement") govern all EMI-based purchases made from Fastemis.',
        'By purchasing any product under EMI or installment plan from Fastemis, the customer agrees to comply with and be legally bound by this Agreement.',
        'If you do not agree, you must not proceed with the purchase.'
      ]
    },
    {
      id: 2,
      title: 'Booking Amount & Reservation',
      paragraphs: [
        'For booking-based purchases, Fastemis may collect a booking amount (for example INR 7,500) to reserve a specific product for a limited reservation period.',
        'After booking amount receipt, the product may be removed from sale and other buyer offers may be declined for that reservation window.'
      ],
      bullets: [
        'Booking amount is non-refundable if buyer cancels after booking.',
        'Booking amount is non-refundable if buyer does not pay the remaining balance within the reservation period.',
        'Booking amount is non-refundable if buyer is unresponsive for more than 7 calendar days.',
        'Booking amount is non-refundable if buyer refuses delivery without valid documented reason.',
        'Booking amount is non-refundable if buyer breaches agreement terms or provides false details.',
        'Refund may be considered only if Fastemis cannot deliver the promised product, delivers materially mismatched/defective product, or cancels due to stock unavailability/force majeure.'
      ]
    },
    {
      id: 3,
      title: 'Ownership of Device',
      paragraphs: [
        'All devices financed through EMI remain the exclusive legal property of Fastemis until full payment is completed.',
        'The customer is only granted limited usage rights.',
        'Ownership transfers only after 100% payment clearance.',
        'Until then, Fastemis retains full legal rights over the device.'
      ]
    },
    {
      id: 4,
      title: 'EMI Payment Obligations',
      paragraphs: [
        'EMI must be paid strictly on or before the due date.',
        'Repeated delay will be treated as payment default.',
        'Failure to pay EMI is a breach of contract.'
      ],
      bullets: [
        'Late payment penalties',
        'Interest charges',
        'Recovery charges',
        'Legal expenses'
      ]
    },
    {
      id: 5,
      title: 'Default & Recovery Rights',
      paragraphs: [
        'If the customer fails to pay EMI on time, Fastemis reserves the absolute right to take recovery and legal action.',
        'The customer agrees not to obstruct recovery action.'
      ],
      bullets: [
        'Visit the registered address to recover the device.',
        'Collect the device without prior notice.',
        'Remotely disable the device.',
        'IMEI lock or permanently block the device.',
        'Restrict usage access.',
        'Initiate civil and/or criminal legal proceedings.',
        'Recover outstanding dues through legal enforcement.',
        'Charge recovery visit fees.'
      ]
    },
    {
      id: 6,
      title: 'IMEI Lock & Device Control Consent',
      paragraphs: [
        'By purchasing under EMI, the customer gives full consent to device monitoring for financing security.',
        'Customer agrees that Fastemis may remotely lock, disable, restrict, or IMEI block the device in case of default.',
        'No separate notice is required before such action.'
      ]
    },
    {
      id: 7,
      title: 'No Refund Policy',
      paragraphs: [
        'All payments made to Fastemis are non-refundable under this agreement, including booking amounts, down payments, EMIs paid, fees, penalties, and recovery charges.',
        'This applies across cancellation, early closure, device return/repossession, policy violation, dissatisfaction, loss/theft/damage, and similar scenarios except where explicitly stated by Fastemis in writing.'
      ],
      bullets: [
        'Booking amount (including INR 7,500 booking model, where applicable)',
        'Down payments',
        'All EMIs paid',
        'Processing fees',
        'File charges',
        'Documentation fees',
        'Service charges',
        'Late fees',
        'Penalty charges',
        'Security deposits',
        'Foreclosure payments',
        'Recovery fees',
        'No refund for change of mind, financial issues, job loss, medical emergency, device return, repossession, agreement termination, policy violation, dissatisfaction, early closure, cancellation request, business closure, legal dispute, device damage, device theft, or device loss.'
      ]
    },
    {
      id: 8,
      title: 'Agreement Violation',
      paragraphs: [
        'If the customer violates core terms, agreement may be terminated immediately and legal action may be initiated.',
        'No refund will be given and customer remains liable for full outstanding balance.'
      ],
      bullets: [
        'Submits fake documents or false KYC',
        'Misrepresents information',
        'Sells, transfers, pledges, or rents the device',
        'Refuses inspection',
        'Changes address without notice',
        'Avoids communication',
        'Intentionally damages the device',
        'Uses the device for illegal purposes'
      ]
    },
    {
      id: 9,
      title: 'Device Transfer Strictly Prohibited',
      paragraphs: [
        'Customer cannot sell, rent, pledge, mortgage, gift, exchange, or transfer ownership until full EMI payment completion.',
        'Violation will be treated as breach of contract and possible fraud.'
      ]
    },
    {
      id: 10,
      title: 'Loss, Theft or Damage',
      paragraphs: [
        'If the device is lost, stolen, damaged, or destroyed, customer must continue paying all EMIs until full payment completion.',
        'No cancellation or refund will be allowed.'
      ]
    },
    {
      id: 11,
      title: 'Repossession Policy',
      paragraphs: [
        'If Fastemis repossesses the device due to default, all payments made shall be forfeited.',
        'No refund will be issued.',
        'Outstanding dues may still be legally recoverable.',
        'Recovery costs will be added to customer liability.'
      ]
    },
    {
      id: 12,
      title: 'Early Closure Policy',
      paragraphs: [
        'Early repayment does not entitle customer to refund of any fees.',
        'Foreclosure charges may apply.',
        'No reversal of processing fees under any condition.'
      ]
    },
    {
      id: 13,
      title: 'Recovery Charges',
      paragraphs: [
        'Each recovery attempt may incur additional service charges added to the outstanding amount.'
      ]
    },
    {
      id: 14,
      title: 'Legal Action & Jurisdiction',
      paragraphs: [
        'Fastemis reserves the right to file civil recovery suits, initiate criminal proceedings where applicable, and report default to financial databases where legally permitted.',
        'All disputes shall be subject to the jurisdiction of courts in [Insert City/State].'
      ]
    },
    {
      id: 15,
      title: 'Indemnification',
      paragraphs: [
        'Customer agrees to indemnify and hold Fastemis harmless from financial losses, legal disputes, damages arising from misuse, and fraudulent conduct.'
      ]
    },
    {
      id: 16,
      title: 'Policy Updates',
      paragraphs: [
        'Fastemis reserves the right to modify these Terms & Conditions at any time without prior notice.',
        'Continued usage implies acceptance of updated terms.'
      ]
    }
  ];
}
