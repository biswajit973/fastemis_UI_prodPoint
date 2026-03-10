import { Injectable, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class BrowserResetService {
  readonly busy = signal(false);

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private storageService: StorageService
  ) {}

  async clearBrowserSessionData(): Promise<void> {
    if (this.busy()) {
      return;
    }

    const shouldProceed = typeof window === 'undefined'
      ? false
      : window.confirm('Clear session, cookies and cache now?');
    if (!shouldProceed) {
      return;
    }

    this.busy.set(true);

    try {
      this.authService.logout();
      this.storageService.clear();

      if (typeof window !== 'undefined') {
        window.localStorage.clear();
        window.sessionStorage.clear();
      }

      if (typeof document !== 'undefined') {
        const cookies = document.cookie ? document.cookie.split(';') : [];
        for (const entry of cookies) {
          const name = entry.split('=')[0]?.trim();
          if (!name) continue;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
        }
      }

      if (typeof window !== 'undefined' && 'caches' in window) {
        const cacheKeys = await window.caches.keys();
        await Promise.all(cacheKeys.map((key) => window.caches.delete(key)));
      }

      if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));
      }

      if (typeof window !== 'undefined' && 'indexedDB' in window) {
        const indexedDbApi = window.indexedDB as IDBFactory & {
          databases?: () => Promise<Array<{ name?: string }>>;
        };
        if (typeof indexedDbApi.databases === 'function') {
          const dbs = await indexedDbApi.databases();
          for (const db of dbs) {
            if (db?.name) {
              try {
                indexedDbApi.deleteDatabase(db.name);
              } catch {
                // best-effort cleanup only
              }
            }
          }
        }
      }

      this.notificationService.success('Session, cookies and cache cleared. Reloading...');

      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      }, 250);
    } catch {
      this.notificationService.error('Could not fully clear browser data. Please try again.');
    } finally {
      this.busy.set(false);
    }
  }
}
