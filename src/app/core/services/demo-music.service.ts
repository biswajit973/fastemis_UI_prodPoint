import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class DemoMusicService {
  private readonly isBrowser: boolean;
  private readonly musicUrl = '/api/public/fallback-music?v=1';
  private readonly cacheName = 'fastemis-fallback-music-v1';
  private activeTrackKey: string | null = null;
  private desiredTrackKey: string | null = null;
  private pendingTrackKey: string | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private objectUrl: string | null = null;
  private audioReady = false;
  private primeStarted = false;
  private cacheWarmPromise: Promise<void> | null = null;
  private waitingForUserGesture = false;
  private unlockBound = false;
  private readonly musicReadyState = signal<boolean>(false);
  readonly musicReady = this.musicReadyState.asReadonly();

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      this.prime();
    }
  }

  prime(): void {
    if (!this.isBrowser || this.primeStarted) {
      return;
    }

    this.primeStarted = true;
    const audio = this.ensureAudioElement();
    if (!audio) {
      return;
    }

    try {
      audio.load();
    } catch {
      // no-op
    }
    this.warmFetchCache();
  }

  start(trackKey: string): void {
    if (!this.isBrowser) {
      return;
    }

    const key = String(trackKey || '').trim();
    if (!key) {
      return;
    }

    this.prime();
    this.desiredTrackKey = key;
    this.pendingTrackKey = key;
    const audio = this.ensureAudioElement();
    if (!audio) {
      return;
    }

    if (this.activeTrackKey === key && !audio.paused) {
      return;
    }

    this.internalStopAll(false);
    if (!this.audioReady && audio.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) {
      try {
        audio.load();
      } catch {
        // no-op
      }
    }
    this.tryPlay(key);
  }

  stop(trackKey?: string): void {
    const key = String(trackKey || '').trim();
    if (key && this.activeTrackKey && key !== this.activeTrackKey && this.desiredTrackKey !== key) {
      return;
    }
    this.stopAll();
  }

  stopAll(): void {
    this.internalStopAll(true);
  }

  private internalStopAll(clearDesired: boolean): void {
    const audio = this.audioElement;
    if (audio) {
      audio.pause();
      try {
        audio.currentTime = 0;
      } catch {
        // no-op
      }
    }
    this.activeTrackKey = null;
    this.waitingForUserGesture = false;
    this.musicReadyState.set(this.audioReady);
    this.pendingTrackKey = clearDesired ? null : this.pendingTrackKey;
    if (clearDesired) {
      this.desiredTrackKey = null;
    }
  }

  private ensureAudioElement(): HTMLAudioElement | null {
    if (!this.isBrowser) {
      return null;
    }

    if (!this.audioElement) {
      const audio = new Audio(this.objectUrl || this.musicUrl);
      audio.preload = 'auto';
      audio.loop = true;
      audio.volume = 0.28;
      audio.crossOrigin = 'anonymous';
      audio.addEventListener('loadeddata', () => {
        this.audioReady = true;
        this.musicReadyState.set(true);
        this.tryPendingTrack();
      });
      audio.addEventListener('canplay', () => {
        this.audioReady = true;
        this.musicReadyState.set(true);
        this.tryPendingTrack();
      });
      audio.addEventListener('error', () => {
        this.audioReady = false;
        this.musicReadyState.set(false);
      });
      this.audioElement = audio;
    }
    return this.audioElement;
  }

  private tryPlay(trackKey: string): void {
    const audio = this.audioElement;
    if (!audio || this.desiredTrackKey !== trackKey) {
      return;
    }
    if (!this.audioReady) {
      this.musicReadyState.set(false);
    }

    const playPromise = audio.play();
    if (!playPromise || typeof playPromise.then !== 'function') {
      this.activeTrackKey = trackKey;
      this.waitingForUserGesture = false;
      return;
    }

    playPromise.then(() => {
      if (this.desiredTrackKey !== trackKey) {
        audio.pause();
        return;
      }
      this.activeTrackKey = trackKey;
      this.pendingTrackKey = null;
      this.waitingForUserGesture = false;
    }).catch(() => {
      this.activeTrackKey = null;
      this.waitingForUserGesture = true;
      this.bindUnlockHandlers();
    });
  }

  private bindUnlockHandlers(): void {
    if (!this.isBrowser || this.unlockBound) {
      return;
    }

    const unlock = () => {
      this.prime();
      if (!this.waitingForUserGesture) {
        this.tryPendingTrack();
        return;
      }
      const pendingTrack = this.desiredTrackKey;
      if (!pendingTrack) {
        return;
      }
      this.tryPlay(pendingTrack);
    };
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
    window.addEventListener('touchstart', unlock, { passive: true });
    this.unlockBound = true;
  }

  private tryPendingTrack(): void {
    const key = this.pendingTrackKey || this.desiredTrackKey;
    if (!key) {
      return;
    }
    this.tryPlay(key);
  }

  private warmFetchCache(): void {
    if (!this.isBrowser || this.cacheWarmPromise) {
      return;
    }

    this.cacheWarmPromise = this.preloadAndAttachFromCache().catch(() => undefined).then(() => undefined);
  }

  private async preloadAndAttachFromCache(): Promise<void> {
    const request = new Request(this.musicUrl, { method: 'GET' });

    if (typeof window !== 'undefined' && 'caches' in window) {
      const cache = await window.caches.open(this.cacheName);
      const cached = await cache.match(request);
      if (cached?.ok) {
        await this.applyCachedSource(cached.clone());
        return;
      }

      const fetched = await fetch(request, { cache: 'reload' });
      if (fetched.ok) {
        await cache.put(request, fetched.clone());
        await this.applyCachedSource(fetched.clone());
        return;
      }
    }

    const fallbackResponse = await fetch(request, { cache: 'force-cache' });
    if (fallbackResponse.ok) {
      await this.applyCachedSource(fallbackResponse.clone());
    }
  }

  private async applyCachedSource(response: Response): Promise<void> {
    const blob = await response.blob();
    if (!blob || blob.size <= 0) {
      return;
    }

    const nextObjectUrl = URL.createObjectURL(blob);
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
    }
    this.objectUrl = nextObjectUrl;

    const audio = this.ensureAudioElement();
    if (!audio) {
      return;
    }

    const wasPlaying = !audio.paused;
    audio.src = this.objectUrl;
    this.audioReady = false;
    this.musicReadyState.set(false);
    try {
      audio.load();
    } catch {
      // no-op
    }

    if (wasPlaying) {
      this.tryPendingTrack();
    }
  }
}
