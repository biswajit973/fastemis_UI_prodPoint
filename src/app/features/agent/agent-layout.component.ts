import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AgentNavbarComponent } from './components/agent-navbar/agent-navbar.component';
import { AgentBottomBarComponent } from './components/agent-bottom-bar/agent-bottom-bar.component';

@Component({
  selector: 'app-agent-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, AgentNavbarComponent, AgentBottomBarComponent],
  template: `
    <div class="min-h-screen bg-surface-2 flex flex-col">
      <app-agent-navbar></app-agent-navbar>
      
      <main class="flex-1 mt-16 w-full max-w-[1600px] mx-auto px-3 py-4 pb-[calc(6.75rem+env(safe-area-inset-bottom))] sm:px-5 sm:py-6 sm:pb-24 lg:px-8 lg:py-8 lg:pb-8">
        <router-outlet></router-outlet>
      </main>

      <app-agent-bottom-bar></app-agent-bottom-bar>
    </div>
  `
})
export class AgentLayoutComponent { }
