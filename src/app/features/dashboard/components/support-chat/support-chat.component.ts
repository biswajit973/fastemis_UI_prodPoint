import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ChatMessage, ChatService, ChatThreadSummary } from '../../../../core/services/chat.service';

@Component({
  selector: 'app-support-chat',
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
      <div class="mx-auto flex h-full w-full max-w-4xl flex-col overflow-hidden">
        <header class="sticky top-0 z-20 border-b border-white/70 bg-surface/84 px-3 pb-3 pt-3 backdrop-blur-2xl sm:px-4">
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
              {{ initials(thread()?.assignedAgentName || 'Support Executive') }}
            </div>

            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <h2 class="truncate text-[17px] font-semibold tracking-tight text-primary">Chat With Support</h2>
                <span *ngIf="thread()" class="inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em]"
                  [ngClass]="thread()?.isActiveNow ? 'border-success/20 bg-success/10 text-success' : 'border-border bg-white/70 text-muted'">
                  {{ thread()?.isActiveNow ? 'Online' : 'Offline' }}
                </span>
              </div>
              <p class="mt-1 truncate text-[12px] leading-5 text-secondary">
                {{ thread()?.assignedAgentName || 'Support Executive' }}
                <span *ngIf="thread()?.lastLoginAt"> • Last login {{ formatDateTime(thread()?.lastLoginAt) }}</span>
              </p>
              <p *ngIf="!thread() && !loading()" class="mt-0.5 text-[12px] text-secondary">Support thread will appear once assigned.</p>
            </div>

            <div class="flex shrink-0 items-center gap-2">
              <button
                *ngIf="thread()"
                type="button"
                (click)="toggleMediaGallery()"
                class="inline-flex min-w-[3rem] items-center justify-center rounded-[16px] border border-white/70 bg-white/80 px-3 py-2 text-[12px] font-semibold text-secondary shadow-sm transition hover:text-primary"
                [attr.aria-label]="'Open media gallery, ' + sharedMedia().length + ' items'">
                {{ sharedMedia().length }}
              </button>
              <button
                type="button"
                (click)="refresh(true)"
                [disabled]="loading()"
                class="flex h-10 w-10 items-center justify-center rounded-[16px] border border-white/70 bg-white/80 text-secondary shadow-sm transition hover:text-primary disabled:opacity-60">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <polyline points="1 20 1 14 7 14"></polyline>
                  <path d="M3.51 9a9 9 0 0 1 14.13-3.36L23 10"></path>
                  <path d="M20.49 15a9 9 0 0 1-14.13 3.36L1 14"></path>
                </svg>
              </button>
            </div>
          </div>
        </header>

        <main class="relative flex-1 min-h-0 overflow-hidden">
          <div *ngIf="loading() && messagesState().length === 0" class="flex h-full items-center justify-center px-4 text-center text-[14px] text-secondary">
            Loading support chat...
          </div>

          <div *ngIf="!loading() && !thread()" class="flex h-full items-center justify-center px-6 text-center text-[14px] leading-6 text-secondary">
            Support thread not ready yet. Please refresh in a moment.
          </div>

          <div *ngIf="thread()" class="relative h-full">
            <div *ngIf="!showMediaGallery()" class="relative h-full">
              <div class="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center px-3 pt-3">
                <span class="rounded-full border border-white/80 bg-white/88 px-3 py-1 text-[11px] font-medium text-secondary shadow-sm backdrop-blur">
                  Secure support chat
                </span>
              </div>

              <div
                #scrollContainer
                (scroll)="onScroll()"
                class="chat-scroll h-full overflow-y-auto overscroll-contain px-3 pb-32 pt-14 sm:px-4 sm:pb-36">
                <div class="mx-auto flex max-w-4xl flex-col gap-3">
                  <ng-container *ngFor="let msg of messagesState(); let i = index">
                    <div *ngIf="shouldShowDateDivider(i)" class="flex justify-center py-1">
                      <span class="rounded-full border border-white/70 bg-white/86 px-3 py-1 text-[11px] font-medium text-secondary shadow-sm">
                        {{ formatDayLabel(msg.timestamp) }}
                      </span>
                    </div>

                    <div class="flex" [ngClass]="rowClass(msg)">
                      <div class="max-w-[min(82vw,30rem)]">
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
                class="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white shadow-[0_14px_30px_rgba(15,38,75,0.28)] transition hover:bg-primary-light">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 5v14"></path>
                  <path d="m19 12-7 7-7-7"></path>
                </svg>
              </button>
            </div>

            <div *ngIf="showMediaGallery()" class="absolute inset-0 bg-surface/96 backdrop-blur-xl">
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
          </div>
        </main>

        <footer *ngIf="thread()" class="relative z-10 shrink-0 border-t border-white/70 bg-surface/92 px-3 pb-[calc(0.85rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-2xl sm:px-4">
          <div class="mx-auto flex max-w-4xl items-end gap-2">
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
              [disabled]="!newMessage.trim()"
              class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white shadow-[0_12px_26px_rgba(15,38,75,0.24)] transition"
              [ngClass]="newMessage.trim() ? 'bg-primary hover:bg-primary-light' : 'bg-slate-300'">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </footer>
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
export class SupportChatComponent implements OnInit, OnDestroy {
  @ViewChild('scrollContainer') private scrollContainer?: ElementRef<HTMLElement>;

  readonly thread = signal<ChatThreadSummary | null>(null);
  readonly messagesState = signal<ChatMessage[]>([]);
  readonly loading = signal<boolean>(false);
  readonly showMediaGallery = signal<boolean>(false);
  readonly previewMedia = signal<ChatMessage | null>(null);
  readonly showScrollToBottom = signal<boolean>(false);

  newMessage = '';
  private threadPoller: number | null = null;
  private messagesPoller: number | null = null;
  private scrollFrame: number | null = null;
  private stickToBottom = true;

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    this.refresh(true);
    this.threadPoller = window.setInterval(() => this.refresh(false), 10000);
    this.messagesPoller = window.setInterval(() => this.refreshMessages(true, false), 6000);
  }

  ngOnDestroy(): void {
    if (this.threadPoller !== null) {
      window.clearInterval(this.threadPoller);
      this.threadPoller = null;
    }
    if (this.messagesPoller !== null) {
      window.clearInterval(this.messagesPoller);
      this.messagesPoller = null;
    }
    this.clearScheduledScroll();
  }

  refresh(forceFullMessages: boolean): void {
    this.loading.set(true);
    this.chatService.loadUserThread().subscribe((thread) => {
      this.thread.set(thread);
      this.loading.set(false);
      if (thread?.userId) {
        this.refreshMessages(!forceFullMessages, forceFullMessages);
      } else {
        this.messagesState.set([]);
      }
    });
  }

  refreshMessages(incremental: boolean, forceScroll: boolean): void {
    const current = this.thread();
    if (!current?.userId) {
      return;
    }

    this.chatService.fetchMessages(current.userId, { forceFull: !incremental }).subscribe((messages) => {
      this.messagesState.set(messages);
      this.scheduleScrollToBottom(forceScroll);
    });
  }

  sendMessage(): void {
    const current = this.thread();
    const text = this.newMessage.trim();
    if (!current?.userId || !text) {
      return;
    }

    this.newMessage = '';
    this.stickToBottom = true;
    this.chatService.sendTextMessage(current.userId, text).subscribe(() => {
      this.refreshMessages(true, true);
      this.refresh(false);
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    const current = this.thread();
    if (!file || !current?.userId) {
      return;
    }

    this.stickToBottom = true;
    this.chatService.sendMediaMessage(current.userId, file).subscribe(() => {
      this.refreshMessages(true, true);
      this.refresh(false);
      input.value = '';
    });
  }

  toggleMediaGallery(): void {
    const next = !this.showMediaGallery();
    this.showMediaGallery.set(next);
    if (!next) {
      this.scheduleScrollToBottom(true);
    }
  }

  sharedMedia(): ChatMessage[] {
    return this.messagesState().filter((message) => message.type === 'media');
  }

  openMediaPreview(message: ChatMessage): void {
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

  rowClass(msg: ChatMessage): string {
    if (msg.sender === 'system') {
      return 'justify-center';
    }
    return msg.sender === 'user' ? 'justify-end' : 'justify-start';
  }

  bubbleClass(msg: ChatMessage): string {
    return msg.sender === 'user'
      ? 'rounded-tr-[10px] border-primary/25 bg-primary text-white'
      : 'rounded-tl-[10px] border-white/80 bg-white/92 text-primary';
  }

  senderLabel(msg: ChatMessage): string {
    return msg.sender === 'user' ? 'You' : (msg.senderName || this.thread()?.assignedAgentName || 'Support Executive');
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

  initials(name: string): string {
    if (!name) {
      return 'S';
    }
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('');
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
