import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { catchError, finalize, map, Observable, of, tap } from 'rxjs';
import { AgentVideoItem, AgentVideoListResponse } from '../models/agent-video.model';
import { VideoManifestService } from './video-manifest.service';

@Injectable({ providedIn: 'root' })
export class AgentVideoApiService {
  private readonly videosState = signal<AgentVideoItem[]>([]);
  private readonly loadingState = signal<boolean>(false);
  private readonly actionBusyState = signal<boolean>(false);
  private readonly actionErrorState = signal<string>('');
  private readonly actionContextState = signal<string>('');
  private readonly uploadProgressState = signal<number>(0);

  readonly videos = this.videosState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly actionBusy = this.actionBusyState.asReadonly();
  readonly actionError = this.actionErrorState.asReadonly();
  readonly actionContext = this.actionContextState.asReadonly();
  readonly uploadProgress = this.uploadProgressState.asReadonly();

  constructor(
    private http: HttpClient,
    private videoManifestService: VideoManifestService
  ) {}

  loadVideos(forceRefresh: boolean = false): Observable<AgentVideoItem[]> {
    if (!forceRefresh && this.videosState().length > 0) {
      return of(this.videosState());
    }

    this.loadingState.set(true);
    return this.http.get<AgentVideoListResponse>('/api/agent/videos').pipe(
      map((response) => Array.isArray(response?.videos) ? response.videos : []),
      tap((videos) => this.videosState.set(this.sortVideos(videos))),
      catchError(() => of(this.videosState())),
      finalize(() => this.loadingState.set(false))
    );
  }

  createVideo(input: {
    title: string;
    quote: string;
    priority: number;
    durationSec: number;
    showInHero: boolean;
    soundEnabled: boolean;
    videoFile: File;
  }): Observable<AgentVideoItem | null> {
    this.actionErrorState.set('');
    this.actionBusyState.set(true);
    this.actionContextState.set('create');
    this.uploadProgressState.set(0);

    const formData = new FormData();
    formData.append('title', input.title.trim());
    formData.append('quote', String(input.quote || '').trim());
    formData.append('priority', String(input.priority));
    formData.append('duration_sec', String(Math.max(0, Math.floor(input.durationSec || 0))));
    formData.append('show_in_hero', String(Boolean(input.showInHero)));
    formData.append('sound_enabled', String(Boolean(input.soundEnabled)));
    formData.append('video_file', input.videoFile);

    return this.http.post<{ video?: AgentVideoItem }>('/api/agent/videos', formData, {
      observe: 'events',
      reportProgress: true
    }).pipe(
      map((event) => {
        if (event.type === HttpEventType.UploadProgress) {
          const total = Number(event.total || 0);
          const loaded = Number(event.loaded || 0);
          this.uploadProgressState.set(total > 0 ? Math.max(0, Math.min(100, Math.round((loaded / total) * 100))) : 0);
          return null;
        }
        if (event.type === HttpEventType.Response) {
          return event.body?.video || null;
        }
        return null;
      }),
      tap((created) => {
        if (!created) return;
        this.videosState.update((current) => this.sortVideos([created, ...current.filter((item) => item.id !== created.id)]));
        this.videoManifestService.clearManifestCache();
        this.uploadProgressState.set(100);
      }),
      catchError((error) => {
        this.actionErrorState.set(this.extractError(error, 'Unable to upload video.'));
        return of(null);
      }),
      finalize(() => {
        this.actionBusyState.set(false);
        this.actionContextState.set('');
        this.uploadProgressState.set(0);
      })
    );
  }

  updateVideo(videoId: number, patch: Partial<{
    title: string;
    quote: string;
    priority: number;
    duration_sec: number;
    show_in_hero: boolean;
    is_active: boolean;
    sound_enabled: boolean;
  }>): Observable<AgentVideoItem | null> {
    this.actionErrorState.set('');
    this.actionBusyState.set(true);
    this.actionContextState.set(`video:${videoId}`);
    this.uploadProgressState.set(0);

    return this.http.patch<{ video?: AgentVideoItem }>(`/api/agent/videos/${videoId}`, patch).pipe(
      map((response) => response?.video || null),
      tap((updated) => {
        if (!updated) return;
        this.videosState.update((current) => this.sortVideos(
          current.map((video) => video.id === updated.id ? updated : video)
        ));
        this.videoManifestService.clearManifestCache();
      }),
      catchError((error) => {
        this.actionErrorState.set(this.extractError(error, 'Unable to update video.'));
        return of(null);
      }),
      finalize(() => {
        this.actionBusyState.set(false);
        this.actionContextState.set('');
      })
    );
  }

  private sortVideos(items: AgentVideoItem[]): AgentVideoItem[] {
    return [...items].sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return a.id - b.id;
    });
  }

  private extractError(error: unknown, fallback: string): string {
    if (!(error instanceof HttpErrorResponse)) {
      return fallback;
    }
    const payload = error.error;
    if (payload && typeof payload === 'object') {
      const entries = Object.entries(payload as Record<string, unknown>);
      if (entries.length > 0) {
        const [key, value] = entries[0];
        if (Array.isArray(value) && value.length > 0) {
          return `${key}: ${String(value[0])}`;
        }
        if (value != null && String(value).trim()) {
          return `${key}: ${String(value)}`;
        }
      }
    }
    if (typeof payload === 'string' && payload.trim()) {
      return payload.trim();
    }
    return fallback;
  }
}
