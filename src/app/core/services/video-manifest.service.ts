import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, finalize, map, of, shareReplay, tap } from 'rxjs';
import { DeviceClass, VideoManifestItem, VideoManifestResponse, VideoSurface } from '../models/video-manifest.model';

@Injectable({ providedIn: 'root' })
export class VideoManifestService {
  private readonly manifestCache = new Map<string, { expiresAt: number; payload: VideoManifestResponse }>();
  private readonly inFlight = new Map<string, Observable<VideoManifestResponse>>();
  private requestNonce = 0;

  constructor(private http: HttpClient) { }

  getManifest(surface: VideoSurface, device: DeviceClass): Observable<VideoManifestResponse> {
    const cacheKey = `${surface}:${device}`;
    const now = Date.now();
    const cached = this.manifestCache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      return of(this.cloneManifest(cached.payload));
    }

    const pending = this.inFlight.get(cacheKey);
    if (pending) {
      return pending;
    }

    const startedAt = performance.now();
    const params = new HttpParams()
      .set('surface', surface)
      .set('device', device)
      .set('_mv', String(this.requestNonce));

    const request$ = this.http.get<VideoManifestResponse>('/api/public/video-manifest', { params }).pipe(
      map((payload) => this.normalizeManifest(payload)),
      tap((payload) => this.setCache(cacheKey, payload, payload.cacheTtlSec)),
      tap((payload) => {
        const elapsed = Math.round(performance.now() - startedAt);
        console.info(`[video-metrics] manifest:${surface}:${device} loaded in ${elapsed}ms (items=${payload.items.length})`);
      }),
      catchError((error) => {
        const elapsed = Math.round(performance.now() - startedAt);
        console.warn(`[video-metrics] manifest:${surface}:${device} fallback after ${elapsed}ms`, error);
        const fallback = this.buildFallbackManifest(surface, device);
        this.setCache(cacheKey, fallback, 20);
        return of(this.cloneManifest(fallback));
      }),
      finalize(() => this.inFlight.delete(cacheKey)),
      shareReplay(1)
    );

    this.inFlight.set(cacheKey, request$);
    return request$;
  }

  clearManifestCache(): void {
    this.manifestCache.clear();
    this.inFlight.clear();
    this.requestNonce += 1;
  }

  private normalizeManifest(payload: VideoManifestResponse | null | undefined): VideoManifestResponse {
    const rawItems = Array.isArray(payload?.items) ? payload?.items : [];
    const items = rawItems
      .map((item) => this.normalizeItem(item))
      .filter((item) => !!item)
      .sort((a, b) => a.priority - b.priority) as VideoManifestItem[];

    return {
      version: String(payload?.version || 'v1'),
      cacheTtlSec: Number(payload?.cacheTtlSec || 300),
      items
    };
  }

  private setCache(cacheKey: string, payload: VideoManifestResponse, ttlSec: number): void {
    const safeTtl = Math.max(10, Math.min(300, Number(ttlSec || 0)));
    this.manifestCache.set(cacheKey, {
      expiresAt: Date.now() + safeTtl * 1000,
      payload: this.cloneManifest(payload)
    });
  }

  private cloneManifest(payload: VideoManifestResponse): VideoManifestResponse {
    return {
      version: payload.version,
      cacheTtlSec: payload.cacheTtlSec,
      items: payload.items.map((item) => ({ ...item }))
    };
  }

  private normalizeItem(item: VideoManifestItem | null | undefined): VideoManifestItem | null {
    if (!item) {
      return null;
    }

    const id = String(item.id || '').trim();
    const url = String(item.url || '').trim();
    if (!id || !url) {
      return null;
    }

    return {
      id,
      title: String(item.title || '').trim(),
      quote: String(item.quote || '').trim(),
      url,
      posterUrl: String(item.posterUrl || '').trim(),
      durationSec: Number(item.durationSec || 0),
      priority: Number(item.priority || 0),
      active: Boolean(item.active),
      soundEnabled: item.soundEnabled !== false
    };
  }

  private buildFallbackManifest(surface: VideoSurface, device: DeviceClass): VideoManifestResponse {
    return {
      version: 'fallback-v1',
      cacheTtlSec: 45,
      items: []
    };
  }
}
