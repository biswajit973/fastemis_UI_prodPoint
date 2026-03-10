import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <footer class="bg-surface-2 pt-16 pb-8 border-t border-border">
      <div class="container">
        <div class="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
          
          <div class="max-w-sm">
            <div class="flex items-center gap-2 text-primary mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
              <span class="font-bold text-lg tracking-tight">FastEMIs</span>
            </div>
            <p class="text-sm text-secondary mb-4">
              FastEMIs helps people buy premium gadgets with monthly part payment. No cost EMI up to 12 months with trusted finance partners.
            </p>
            <div class="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-secondary space-y-2">
              <div>
                <span class="font-semibold text-primary">Support:</span>
                <a href="mailto:support@fastemis.com" class="ml-1 text-secondary no-underline hover:text-primary">support&#64;fastemis.com</a>
              </div>
              <div>
                <span class="font-semibold text-primary">Payments:</span>
                <a href="mailto:Payments@fastemi.com" class="ml-1 text-secondary no-underline hover:text-primary">Payments&#64;fastemi.com</a>
              </div>
              <div>
                <span class="font-semibold text-primary">Main Office (UAE):</span>
                <div class="mt-1 leading-relaxed">
                  C-32, G677 Lane 3, Al Quoz Industrial Area 3, Dubai, UAE
                </div>
              </div>
            </div>
          </div>

          <div class="flex gap-12 flex-wrap">
            <div>
              <h4 class="font-bold text-primary mb-4">Platform</h4>
              <ul class="space-y-2 text-sm text-secondary">
                <li><a href="#" class="hover:text-primary transition-standard no-underline">Browse Partners</a></li>
                <li><a href="#" class="hover:text-primary transition-standard no-underline">How it Works</a></li>
                <li><a href="#" class="hover:text-primary transition-standard no-underline">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 class="font-bold text-primary mb-4">Legal</h4>
              <ul class="space-y-2 text-sm text-secondary">
                <li><a href="#" class="hover:text-primary transition-standard no-underline">Privacy Policy</a></li>
                <li><a routerLink="/terms-and-conditions" class="hover:text-primary transition-standard no-underline">Terms & Conditions</a></li>
                <li><a href="#" class="hover:text-primary transition-standard no-underline">Grievance Redressal</a></li>
              </ul>
            </div>
            <div>
              <h4 class="font-bold text-primary mb-4">Customer Links</h4>
              <ul class="space-y-2 text-sm text-secondary">
                <li><a routerLink="/partner/coinvault-finance" class="hover:text-primary transition-standard no-underline">Explore Partners</a></li>
                <li><a routerLink="/testimonials-all" class="hover:text-primary transition-standard no-underline">Customer Testimonials</a></li>
                <li><a routerLink="/sign-in" class="hover:text-primary transition-standard no-underline">Sign In</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div class="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p class="text-xs text-muted">&copy; {{ year }} FastEMIs. All rights reserved.</p>
        </div>
      </div>
    </footer>
  `
})
export class HomeFooterComponent {
  year = new Date().getFullYear();
}
