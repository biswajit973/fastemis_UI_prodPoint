import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GhostChatService, GhostMessage, GhostThreadSummary } from '../../core/services/ghost-chat.service';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  styles: [`
    .chat-font {
      font-family: var(--font-body);
    }

    .wrap-anywhere {
      overflow-wrap: anywhere;
      word-break: break-word;
    }

    .chat-scroll {
      scrollbar-width: thin;
      scrollbar-color: rgba(148, 163, 184, 0.45) transparent;
    }

    .chat-scroll::-webkit-scrollbar {
      width: 6px;
    }

    .chat-scroll::-webkit-scrollbar-track {
      background: transparent;
    }

    .chat-scroll::-webkit-scrollbar-thumb {
      background: rgba(148, 163, 184, 0.45);
      border-radius: 999px;
    }
  `],
  template: `
    <div class="chat-font h-[100dvh] overflow-hidden bg-[linear-gradient(180deg,#eff4f9_0%,#e8eef6_100%)]">
      <div class="mx-auto flex h-full w-full max-w-5xl flex-col overflow-hidden">
        <header class="sticky top-0 z-30 border-b border-white/70 bg-surface/84 px-3 pb-3 pt-3 backdrop-blur-2xl sm:px-4">
          <div class="flex items-start gap-3">
            <a
              routerLink="/dashboard"
              class="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/70 bg-white/84 text-secondary shadow-sm transition hover:text-primary"
              aria-label="Back to dashboard">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </a>

            <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-[20px] bg-primary text-[15px] font-semibold text-white shadow-[0_10px_24px_rgba(15,38,75,0.22)]">
              {{ threadInitials(activeThread()) }}
            </div>

            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <h2 class="truncate text-[17px] font-semibold tracking-tight text-primary">Private Chats</h2>
              </div>
              <p class="mt-1 truncate text-[12px] leading-5 text-secondary">
                {{ activeThreadSubtitle() }}
              </p>
              <p *ngIf="!activeThread() && !loadingThreads()" class="mt-0.5 text-[12px] text-secondary">Open a private community thread to continue.</p>
            </div>

            <div class="flex shrink-0 items-center gap-2">
              <button
                *ngIf="activeThread() && sharedMedia().length > 0"
                type="button"
                (click)="toggleMediaGallery()"
                class="hidden min-w-[3rem] items-center justify-center rounded-[16px] border border-white/70 bg-white/80 px-3 py-2 text-[12px] font-semibold text-secondary shadow-sm transition hover:text-primary sm:inline-flex"
                [attr.aria-label]="'Open media gallery, ' + sharedMedia().length + ' items'">
                Media
              </button>
              <button
                type="button"
                (click)="toggleThreadList()"
                class="inline-flex h-10 w-10 items-center justify-center rounded-[16px] border border-white/70 bg-white/80 text-secondary shadow-sm transition hover:text-primary md:hidden"
                [attr.aria-label]="showThreadListMobile() ? 'Close chats' : 'Open chats'">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="4" y1="7" x2="20" y2="7"></line>
                  <line x1="4" y1="12" x2="20" y2="12"></line>
                  <line x1="4" y1="17" x2="14" y2="17"></line>
                </svg>
              </button>
            </div>
          </div>
        </header>

        <main class="relative flex-1 min-h-0 overflow-hidden md:grid md:grid-cols-[320px_1fr]">
          <aside
            class="chat-scroll border-r border-white/70 bg-white/88 backdrop-blur-xl md:relative md:block md:overflow-y-auto"
            [ngClass]="showThreadListMobile() ? 'absolute inset-0 z-20 overflow-y-auto' : 'hidden md:block'">
            <div class="sticky top-0 z-10 border-b border-border bg-white/92 px-4 py-4 backdrop-blur-xl">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Chats</p>
                    <p class="mt-1 text-[13px] leading-5 text-secondary">Open any conversation and continue talking.</p>
                  </div>
                  <button
                    type="button"
                  (click)="closeThreadList()"
                  class="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-secondary shadow-sm md:hidden">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

            </div>

            <div *ngIf="loadingThreads()" class="px-4 py-6 text-center text-[14px] text-secondary">Loading chats...</div>

            <div class="px-3 py-3" *ngIf="!loadingThreads() && threads().length > 0">
              <button
                *ngFor="let thread of threads(); trackBy: trackByThread"
                type="button"
                (click)="selectThread(thread.thread_id)"
                class="mb-2.5 w-full rounded-[22px] border px-3 py-3 text-left shadow-sm transition"
                [ngClass]="thread.thread_id === activeThreadId() ? 'border-primary/15 bg-[linear-gradient(180deg,#ffffff,#f7fbff)] shadow-[0_14px_28px_rgba(15,23,42,0.07)]' : 'border-border bg-white/88 hover:bg-white'">
                <div class="flex items-start gap-3">
                  <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] bg-primary text-[13px] font-semibold text-white shadow-[0_10px_20px_rgba(15,38,75,0.18)]">
                    {{ threadInitials(thread) }}
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-start justify-between gap-2">
                      <div class="min-w-0">
                        <p class="truncate text-[14px] font-semibold text-primary">{{ thread.persona.display_name }}</p>
                        <p class="mt-0.5 truncate text-[12px] text-secondary">{{ thread.persona.info || thread.persona.short_bio || 'Community member' }}</p>
                      </div>
                      <span *ngIf="thread.unread_for_user > 0" class="inline-flex min-w-[20px] items-center justify-center rounded-full bg-error px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                        {{ thread.unread_for_user > 99 ? '99+' : thread.unread_for_user }}
                      </span>
                    </div>
                    <div class="mt-2 flex items-center justify-between gap-2">
                      <p class="min-w-0 truncate text-[11px] text-slate-400">{{ thread.last_message?.preview || 'No messages yet' }}</p>
                      <span class="shrink-0 text-[10px] text-slate-400">{{ formatThreadTime(thread.last_message_at || thread.last_message?.created_at) }}</span>
                    </div>
                  </div>
                </div>
              </button>
            </div>

            <div *ngIf="!loadingThreads() && threads().length === 0" class="px-5 py-12 text-center text-[14px] leading-6 text-secondary">
              No private chats yet. Open one from Community.
            </div>
          </aside>

          <section class="relative flex min-h-0 flex-col" [ngClass]="showThreadListMobile() ? 'hidden md:flex' : 'flex'">
            <div *ngIf="!activeThread() && !loadingThreads()" class="flex h-full items-center justify-center px-6 text-center text-[14px] leading-6 text-secondary">
              Select a private chat from the thread list.
            </div>

            <div *ngIf="activeThread() as currentThread" class="relative flex h-full min-h-0 flex-col">
              <div class="border-b border-white/70 bg-white/84 px-3 py-3 backdrop-blur-xl sm:px-4">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <div class="flex items-center gap-2">
                      <h3 class="truncate text-[16px] font-semibold tracking-tight text-primary">{{ currentThread.persona.display_name }}</h3>
                    </div>
                    <p class="mt-1 truncate text-[12px] leading-5 text-secondary">{{ currentThread.persona.info || currentThread.persona.short_bio || 'Community member' }}</p>
                  </div>
                  <button
                    *ngIf="sharedMedia().length > 0"
                    type="button"
                    (click)="toggleMediaGallery()"
                    class="hidden shrink-0 rounded-[16px] border border-white/70 bg-white/88 px-3 py-2 text-[12px] font-semibold text-secondary shadow-sm transition hover:text-primary md:inline-flex">
                    Media ({{ sharedMedia().length }})
                  </button>
                </div>
              </div>

              <div *ngIf="!showMediaGallery()" class="relative min-h-0 flex-1">
                <div
                  #scrollContainer
                  (scroll)="onScroll()"
                  class="chat-scroll h-full overflow-y-auto overscroll-contain px-3 pb-32 pt-4 sm:px-4 sm:pb-36">
                  <div class="mx-auto flex max-w-3xl flex-col gap-3">
                    <ng-container *ngFor="let msg of messagesState(); let i = index">
                      <div *ngIf="shouldShowDateDivider(i)" class="flex justify-center py-1">
                        <span class="rounded-full border border-white/70 bg-white/86 px-3 py-1 text-[11px] font-medium text-secondary shadow-sm">
                          {{ formatDayLabel(msg.timestamp) }}
                        </span>
                      </div>

                      <div class="flex" [ngClass]="rowClass(msg)">
                        <div class="max-w-[min(84vw,28rem)]">
                          <div *ngIf="msg.sender !== 'system'" class="mb-1 px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400"
                            [ngClass]="msg.sender === 'user' ? 'text-right' : 'text-left'">
                            {{ senderLabel(msg) }}
                          </div>

                          <div
                            *ngIf="msg.sender !== 'system'"
                            class="overflow-hidden rounded-[22px] border px-3.5 py-3 shadow-[0_14px_30px_rgba(15,23,42,0.08)]"
                            [ngClass]="bubbleClass(msg)">
                            <span *ngIf="msg.type === 'text'" class="wrap-anywhere whitespace-pre-wrap text-[15px] leading-6">{{ msg.content }}</span>

                            <div *ngIf="msg.type === 'media'" class="space-y-2.5">
                              <img
                                *ngIf="msg.mediaUrl && isImage(msg.mediaName)"
                                [src]="msg.mediaUrl"
                                loading="lazy"
                                class="max-h-[20rem] w-full rounded-[18px] bg-white/80 object-contain p-1">

                              <video
                                *ngIf="msg.mediaUrl && isVideo(msg.mediaName)"
                                [src]="msg.mediaUrl"
                                controls
                                playsinline
                                class="max-h-[20rem] w-full rounded-[18px] bg-black object-contain"></video>

                              <div
                                *ngIf="!msg.mediaUrl || (!isImage(msg.mediaName) && !isVideo(msg.mediaName))"
                                class="wrap-anywhere rounded-[18px] bg-black/8 px-3 py-2 text-[12px]">
                                {{ msg.mediaName || 'Attachment' }}
                              </div>

                              <button
                                type="button"
                                (click)="openMediaPreview(msg)"
                                class="inline-flex items-center gap-1 rounded-full border border-current/20 px-3 py-1.5 text-[11px] font-medium">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"></path>
                                  <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                                Preview
                              </button>
                            </div>
                          </div>

                          <div *ngIf="msg.sender !== 'system'" class="mt-1 px-1 text-[11px] text-slate-400"
                            [ngClass]="msg.sender === 'user' ? 'text-right' : 'text-left'">
                            {{ formatClock(msg.timestamp) }}
                          </div>

                          <div *ngIf="msg.sender === 'system'" class="mx-auto rounded-full border border-white/70 bg-white/82 px-4 py-2 text-center text-[12px] text-secondary shadow-sm">
                            {{ msg.content }}
                          </div>
                        </div>
                      </div>
                    </ng-container>
                  </div>
                </div>

                <button
                  *ngIf="showScrollToBottom()"
                  type="button"
                  (click)="scrollToLatest()"
                  class="absolute bottom-4 right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white shadow-[0_14px_30px_rgba(15,38,75,0.28)] transition hover:bg-primary-light">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 5v14"></path>
                    <path d="m19 12-7 7-7-7"></path>
                  </svg>
                </button>
              </div>

              <div *ngIf="showMediaGallery()" class="absolute inset-0 z-10 bg-surface/96 backdrop-blur-xl">
                <div class="flex h-full flex-col">
                  <div class="flex items-center justify-between border-b border-border px-4 py-3">
                    <div>
                      <p class="text-[15px] font-semibold text-primary">Shared media</p>
                      <p class="text-[12px] text-secondary">{{ sharedMedia().length }} items</p>
                    </div>
                    <button
                      type="button"
                      (click)="toggleMediaGallery()"
                      class="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-secondary shadow-sm">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>

                  <div class="chat-scroll grid flex-1 grid-cols-1 gap-4 overflow-y-auto p-4 sm:grid-cols-2">
                    <div *ngIf="sharedMedia().length === 0" class="col-span-full flex items-center justify-center rounded-[24px] border border-dashed border-border bg-surface-2/60 px-4 py-12 text-center text-[14px] text-secondary">
                      No shared media yet.
                    </div>

                    <article *ngFor="let media of sharedMedia()" class="overflow-hidden rounded-[24px] border border-border bg-white shadow-sm">
                      <img *ngIf="media.mediaUrl && isImage(media.mediaName)" [src]="media.mediaUrl" class="h-44 w-full bg-white object-contain p-2">
                      <video *ngIf="media.mediaUrl && isVideo(media.mediaName)" [src]="media.mediaUrl" class="h-44 w-full bg-black object-contain" controls playsinline></video>
                      <div *ngIf="!media.mediaUrl || (!isImage(media.mediaName) && !isVideo(media.mediaName))" class="flex h-44 items-center justify-center bg-surface-2 text-secondary text-xs">
                        {{ media.mediaName || 'Attachment' }}
                      </div>
                      <div class="border-t border-border px-3 py-3">
                        <p class="wrap-anywhere text-[12px] font-medium text-primary">{{ media.mediaName || 'Attachment' }}</p>
                        <p class="mt-1 text-[11px] text-secondary">{{ formatDateTime(media.timestamp) }}</p>
                      </div>
                    </article>
                  </div>
                </div>
              </div>

              <footer class="relative z-10 shrink-0 border-t border-white/70 bg-surface/92 px-3 pb-[calc(0.85rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-2xl sm:px-4">
                <div class="mx-auto flex max-w-3xl flex-col gap-2">
                  <div *ngIf="restrictedMessage()" class="rounded-[18px] border border-error/20 bg-error/6 px-3 py-2 text-[12px] text-error">
                    Personal phone numbers and email ids are blocked in private chats.
                  </div>

                  <div class="flex items-end gap-2">
                    <input type="file" #fileInput class="hidden" (change)="onFileSelected($event)" accept="image/*,video/*,.pdf,.txt">

                    <button
                      type="button"
                      (click)="fileInput.click()"
                      class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/80 bg-white/88 text-secondary shadow-sm transition hover:text-primary"
                      title="Share media">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                      </svg>
                    </button>

                    <div class="flex min-h-[50px] flex-1 items-center rounded-[24px] border border-white/80 bg-white/92 px-4 shadow-sm">
                      <input
                        type="text"
                        [(ngModel)]="newMessage"
                        (keyup.enter)="sendMessage()"
                        placeholder="Type your message"
                        class="w-full bg-transparent text-[15px] text-primary placeholder:text-slate-400 outline-none">
                    </div>

                    <button
                      type="button"
                      (click)="sendMessage()"
                      [disabled]="!newMessage.trim() || restrictedMessage()"
                      class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white shadow-[0_12px_26px_rgba(15,38,75,0.24)] transition"
                      [ngClass]="newMessage.trim() && !restrictedMessage() ? 'bg-primary hover:bg-primary-light' : 'bg-slate-300'">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                      </svg>
                    </button>
                  </div>
                </div>
              </footer>
            </div>
          </section>
        </main>
      </div>
    </div>

    <div *ngIf="previewMedia()" class="fixed inset-0 z-[96] bg-black/88 backdrop-blur-[2px] p-4 flex flex-col">
      <button
        type="button"
        (click)="closeMediaPreview()"
        class="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white shadow-[0_10px_24px_rgba(0,0,0,0.35)]">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      <div class="mb-3 flex items-center justify-between text-white">
        <div class="min-w-0">
          <p class="truncate text-[14px] font-semibold">{{ previewMedia()?.mediaName || 'Attachment' }}</p>
          <p class="mt-0.5 text-[12px] text-white/70">{{ formatDateTime(previewMedia()?.timestamp || '') }}</p>
        </div>
        <button
          type="button"
          (click)="closeMediaPreview()"
          class="flex h-10 w-10 items-center justify-center rounded-full bg-white/16 text-white">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-[28px] border border-white/20 bg-black/28 p-2">
        <img
          *ngIf="previewMedia()?.mediaUrl && isImage(previewMedia()?.mediaName)"
          [src]="previewMedia()?.mediaUrl || ''"
          class="max-h-full max-w-full rounded-[22px] object-contain"
          alt="preview">
        <video
          *ngIf="previewMedia()?.mediaUrl && isVideo(previewMedia()?.mediaName)"
          [src]="previewMedia()?.mediaUrl || ''"
          controls
          autoplay
          playsinline
          class="max-h-full max-w-full rounded-[22px] bg-black"></video>
        <iframe
          *ngIf="previewMedia()?.mediaUrl && isEmbeddableFile(previewMedia()?.mediaName)"
          [src]="previewMedia()?.mediaUrl || ''"
          class="h-full w-full rounded-[22px] bg-white"
          title="File preview"></iframe>
        <div
          *ngIf="!previewMedia()?.mediaUrl || (!isImage(previewMedia()?.mediaName) && !isVideo(previewMedia()?.mediaName) && !isEmbeddableFile(previewMedia()?.mediaName))"
          class="px-4 text-center text-white/85">
          <p class="text-[14px]">Preview is not available for this file type.</p>
          <a
            *ngIf="previewMedia()?.mediaUrl"
            [href]="previewMedia()?.mediaUrl || ''"
            target="_blank"
            rel="noopener noreferrer"
            class="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-primary no-underline">
            Open file
          </a>
        </div>
      </div>
    </div>
  `
})
export class MessagesComponent implements OnInit, OnDestroy {
  @ViewChild('scrollContainer') private scrollContainer?: ElementRef<HTMLElement>;

  readonly threads = signal<GhostThreadSummary[]>([]);
  readonly messagesState = signal<GhostMessage[]>([]);
  readonly activeThreadId = signal<string>('');
  readonly showThreadListMobile = signal<boolean>(true);
  readonly showMediaGallery = signal<boolean>(false);
  readonly loadingThreads = signal<boolean>(false);
  readonly previewMedia = signal<GhostMessage | null>(null);
  readonly showScrollToBottom = signal<boolean>(false);

  newMessage = '';

  private threadsPoller: number | null = null;
  private messagesPoller: number | null = null;
  private scrollFrame: number | null = null;
  private stickToBottom = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ghostChatService: GhostChatService
  ) {}

  ngOnInit(): void {
    this.loadThreads(true);

    this.route.queryParamMap.subscribe((params) => {
      const threadId = String(params.get('thread') || '').trim();
      if (threadId) {
        this.selectThread(threadId, false);
      }
    });

    this.threadsPoller = window.setInterval(() => this.loadThreads(false), 9000);
    this.messagesPoller = window.setInterval(() => this.refreshMessages(true, false), 6000);
  }

  ngOnDestroy(): void {
    if (this.threadsPoller !== null) {
      window.clearInterval(this.threadsPoller);
      this.threadsPoller = null;
    }
    if (this.messagesPoller !== null) {
      window.clearInterval(this.messagesPoller);
      this.messagesPoller = null;
    }
    this.clearScheduledScroll();
  }

  activeThread(): GhostThreadSummary | null {
    return this.threads().find((item) => item.thread_id === this.activeThreadId()) || null;
  }

  activeThreadSubtitle(): string {
    const thread = this.activeThread();
    if (!thread) {
      return 'Threaded by community members. Same identity stays in the same thread.';
    }
    return thread.persona.info || thread.persona.short_bio || 'Community member';
  }

  threadInitials(thread: GhostThreadSummary | null): string {
    const name = thread?.persona?.display_name || 'PM';
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('') || 'PM';
  }

  safetyRules(): string[] {
    return this.ghostChatService.safetyRules();
  }

  toggleThreadList(): void {
    this.showThreadListMobile.update((value) => !value);
  }

  closeThreadList(): void {
    this.showThreadListMobile.set(false);
  }

  toggleMediaGallery(): void {
    const next = !this.showMediaGallery();
    this.showMediaGallery.set(next);
    if (!next) {
      this.scheduleScrollToBottom(true);
    }
  }

  selectThread(threadId: string, syncQuery: boolean = true): void {
    if (!threadId) {
      return;
    }

    this.activeThreadId.set(threadId);
    this.showThreadListMobile.set(false);
    this.showMediaGallery.set(false);
    this.stickToBottom = true;
    if (syncQuery) {
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { thread: threadId },
        queryParamsHandling: 'merge'
      });
    }
    this.refreshMessages(false, true);
  }

  restrictedMessage(): boolean {
    return GhostChatService.hasRestrictedContact(this.newMessage);
  }

  sendMessage(): void {
    const text = this.newMessage.trim();
    const threadId = this.activeThreadId();
    if (!text || !threadId || this.restrictedMessage()) {
      return;
    }

    this.newMessage = '';
    this.stickToBottom = true;
    this.ghostChatService.sendTextMessage(threadId, text).subscribe(() => {
      this.refreshMessages(true, true);
      this.loadThreads(false);
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    const threadId = this.activeThreadId();
    if (!file || !threadId) {
      return;
    }

    this.stickToBottom = true;
    this.ghostChatService.sendMediaMessage(threadId, file).subscribe(() => {
      this.refreshMessages(true, true);
      this.loadThreads(false);
      input.value = '';
    });
  }

  sharedMedia(): GhostMessage[] {
    return this.messagesState().filter((message) => message.type === 'media');
  }

  openMediaPreview(message: GhostMessage): void {
    this.previewMedia.set(message);
  }

  closeMediaPreview(): void {
    this.previewMedia.set(null);
  }

  onScroll(): void {
    const element = this.scrollContainer?.nativeElement;
    if (!element) {
      return;
    }
    const distanceFromBottom = element.scrollHeight - element.scrollTop - element.clientHeight;
    this.stickToBottom = distanceFromBottom < 80;
    this.showScrollToBottom.set(!this.stickToBottom && !this.showMediaGallery());
  }

  scrollToLatest(): void {
    this.stickToBottom = true;
    this.scheduleScrollToBottom(true);
  }

  rowClass(msg: GhostMessage): string {
    if (msg.sender === 'system') {
      return 'justify-center';
    }
    return msg.sender === 'user' ? 'justify-end' : 'justify-start';
  }

  bubbleClass(msg: GhostMessage): string {
    return msg.sender === 'user'
      ? 'rounded-tr-[10px] border-primary/25 bg-primary text-white'
      : 'rounded-tl-[10px] border-white/80 bg-white/92 text-primary';
  }

  senderLabel(msg: GhostMessage): string {
    if (msg.sender === 'user') {
      return 'You';
    }
    return msg.senderName || this.activeThread()?.persona?.display_name || 'Community member';
  }

  shouldShowDateDivider(index: number): boolean {
    const messages = this.messagesState();
    if (index === 0) {
      return true;
    }
    return this.dayKey(messages[index - 1]?.timestamp) !== this.dayKey(messages[index]?.timestamp);
  }

  formatDayLabel(value?: string): string {
    const date = this.parseDate(value);
    if (!date) {
      return 'Conversation';
    }
    const today = new Date();
    const currentDay = this.dayKey(today.toISOString());
    const messageDay = this.dayKey(date.toISOString());
    if (messageDay === currentDay) {
      return 'Today';
    }
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (messageDay === this.dayKey(yesterday.toISOString())) {
      return 'Yesterday';
    }
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  formatClock(value?: string | null): string {
    const date = this.parseDate(value || undefined);
    if (!date) {
      return '-';
    }
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDateTime(value?: string | null): string {
    const date = this.parseDate(value || undefined);
    if (!date) {
      return '-';
    }
    return date.toLocaleString([], {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatThreadTime(value?: string | null): string {
    const date = this.parseDate(value || undefined);
    if (!date) {
      return '';
    }
    const today = new Date();
    if (this.dayKey(today.toISOString()) === this.dayKey(date.toISOString())) {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric'
    });
  }

  isImage(name?: string): boolean {
    return !!name && /(png|jpg|jpeg|gif|webp)$/i.test(name);
  }

  isVideo(name?: string): boolean {
    return !!name && /(mp4|webm|ogg|mov)$/i.test(name);
  }

  isEmbeddableFile(name?: string): boolean {
    return !!name && /(pdf|txt)$/i.test(name);
  }

  trackByThread(_index: number, thread: GhostThreadSummary): string {
    return thread.thread_id;
  }

  private loadThreads(forceSelectFirst: boolean): void {
    this.loadingThreads.set(true);
    this.ghostChatService.loadUserThreads().subscribe((threads) => {
      this.loadingThreads.set(false);
      this.threads.set(threads);

      const activeId = this.activeThreadId();
      const activeExists = !!threads.find((thread) => thread.thread_id === activeId);

      if (!activeExists) {
        const first = threads[0];
        if (first) {
          this.activeThreadId.set(first.thread_id);
          this.showThreadListMobile.set(false);
          this.refreshMessages(false, true);
          return;
        }
      }

      if (forceSelectFirst && !activeId && threads.length > 0) {
        this.activeThreadId.set(threads[0].thread_id);
        this.showThreadListMobile.set(false);
        this.refreshMessages(false, true);
      }
    });
  }

  private refreshMessages(incremental: boolean, forceScroll: boolean): void {
    const threadId = this.activeThreadId();
    if (!threadId) {
      return;
    }

    this.ghostChatService.fetchMessages(threadId, { forceFull: !incremental }).subscribe((messages) => {
      this.messagesState.set(messages);
      const thread = this.activeThread();
      if (thread) {
        thread.unread_for_user = messages.filter((message) => message.sender === 'agent' && !message.read).length;
      }
      this.scheduleScrollToBottom(forceScroll);
    });
  }

  private scheduleScrollToBottom(force: boolean): void {
    if (this.showMediaGallery()) {
      return;
    }
    this.clearScheduledScroll();
    this.scrollFrame = window.requestAnimationFrame(() => {
      this.scrollFrame = null;
      const element = this.scrollContainer?.nativeElement;
      if (!element) {
        return;
      }
      if (force || this.stickToBottom) {
        element.scrollTo({
          top: element.scrollHeight,
          behavior: force ? 'auto' : 'smooth'
        });
        this.stickToBottom = true;
        this.showScrollToBottom.set(false);
      }
    });
  }

  private clearScheduledScroll(): void {
    if (this.scrollFrame !== null) {
      window.cancelAnimationFrame(this.scrollFrame);
      this.scrollFrame = null;
    }
  }

  private dayKey(value?: string): string {
    const date = this.parseDate(value);
    if (!date) {
      return 'unknown';
    }
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  }

  private parseDate(value?: string): Date | null {
    if (!value) {
      return null;
    }
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date : null;
  }
}
