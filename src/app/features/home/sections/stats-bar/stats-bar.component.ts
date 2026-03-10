import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-home-stats',
    standalone: true,
    imports: [CommonModule],
    template: `
    <section class="bg-surface-2 border-y border-border py-8">
      <div class="container">
        <!-- Scrollable on mobile -->
        <div class="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory pb-4 md:pb-0 gap-6 md:gap-0 justify-between">
          <div class="snap-start flex flex-col items-center md:items-start min-w-[140px]">
            <span class="font-mono text-2xl md:text-3xl font-bold text-primary mb-1">12 Months</span>
            <span class="text-sm font-medium text-secondary">No Cost EMI Up To</span>
          </div>

          <div class="hidden md:block w-px h-12 bg-border"></div>

          <div class="snap-start flex flex-col items-center md:items-start min-w-[140px]">
            <span class="font-mono text-2xl md:text-3xl font-bold text-primary mb-1">18 Plus</span>
            <span class="text-sm font-medium text-secondary">Minimum Age</span>
          </div>

          <div class="hidden md:block w-px h-12 bg-border"></div>

          <div class="snap-start flex flex-col items-center md:items-start min-w-[140px]">
            <span class="font-mono text-2xl md:text-3xl font-bold text-primary mb-1">3 Loans Max</span>
            <span class="text-sm font-medium text-secondary">Active Loan Rule</span>
          </div>

          <div class="hidden md:block w-px h-12 bg-border"></div>

          <div class="snap-start flex flex-col items-center md:items-start min-w-[140px]">
            <span class="font-mono text-2xl md:text-3xl font-bold text-primary mb-1">72 Hrs</span>
            <span class="text-sm font-medium text-secondary">Typical Profile Review</span>
          </div>
        </div>
      </div>
    </section>
  `
})
export class HomeStatsComponent { }
