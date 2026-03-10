import { Component, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'app-global-security',
    standalone: true,
    template: ''
})
export class GlobalSecurityComponent {
    private lastBlockedFeedbackAt = 0;

    constructor(
        @Inject(PLATFORM_ID) private platformId: Object,
        private notification: NotificationService
    ) { }

    @HostListener('document:contextmenu', ['$event'])
    onContextMenu(event: MouseEvent) {
        if (environment.disableInspect && isPlatformBrowser(this.platformId)) {
            this.blockEvent(event, false);
        }
    }

    @HostListener('document:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent) {
        if (!environment.disableInspect || !isPlatformBrowser(this.platformId)) {
            return;
        }

        const key = String(event.key || '').toLowerCase();
        const modifier = event.ctrlKey || event.metaKey;
        const inspectComboKeys = ['i', 'j', 'c', 'k'];

        if (event.key === 'F12' || event.code === 'F12') {
            this.blockEvent(event);
            return;
        }

        // Chrome/Edge/Firefox inspect shortcuts, including Mac option-based variants.
        if (modifier && (event.shiftKey || event.altKey) && inspectComboKeys.includes(key)) {
            this.blockEvent(event);
            return;
        }

        // View source shortcut patterns.
        if (modifier && key === 'u') {
            this.blockEvent(event);
            return;
        }
    }

    private blockEvent(event: Event, withFeedback: boolean = true): void {
        event.preventDefault();
        event.stopPropagation();
        if ('stopImmediatePropagation' in event && typeof event.stopImmediatePropagation === 'function') {
            event.stopImmediatePropagation();
        }

        if (!withFeedback) {
            return;
        }

        const now = Date.now();
        if ((now - this.lastBlockedFeedbackAt) < 2000) {
            return;
        }

        this.lastBlockedFeedbackAt = now;
        this.notification.warning('Inspect and source-view shortcuts are disabled on this app.');
    }
}
