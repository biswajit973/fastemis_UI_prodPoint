import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, finalize, map, Observable, of, tap } from 'rxjs';
import { AgentStocksResponse, DeviceStock, PublicStocksResponse } from '../models/device-stock.model';

@Injectable({ providedIn: 'root' })
export class DeviceStockApiService {
  private readonly publicStocksState = signal<DeviceStock[]>([]);
  private readonly agentStocksState = signal<DeviceStock[]>([]);
  private readonly loadingPublicState = signal<boolean>(false);
  private readonly loadingAgentState = signal<boolean>(false);
  private readonly actionBusyState = signal<boolean>(false);
  private readonly actionErrorState = signal<string>('');

  readonly publicStocks = this.publicStocksState.asReadonly();
  readonly agentStocks = this.agentStocksState.asReadonly();
  readonly loadingPublic = this.loadingPublicState.asReadonly();
  readonly loadingAgent = this.loadingAgentState.asReadonly();
  readonly actionBusy = this.actionBusyState.asReadonly();
  readonly actionError = this.actionErrorState.asReadonly();

  constructor(private http: HttpClient) {}

  loadPublicStocks(forceRefresh: boolean = false): Observable<DeviceStock[]> {
    if (!forceRefresh && this.publicStocksState().length > 0) {
      return of(this.publicStocksState());
    }
    this.loadingPublicState.set(true);
    return this.http.get<PublicStocksResponse>('/api/stocks').pipe(
      map((response) => this.sortStocks(Array.isArray(response?.stocks) ? response.stocks : [])),
      tap((stocks) => this.publicStocksState.set(stocks)),
      catchError(() => of(this.publicStocksState())),
      finalize(() => this.loadingPublicState.set(false))
    );
  }

  loadAgentStocks(forceRefresh: boolean = false): Observable<DeviceStock[]> {
    if (!forceRefresh && this.agentStocksState().length > 0) {
      return of(this.agentStocksState());
    }
    this.loadingAgentState.set(true);
    return this.http.get<AgentStocksResponse>('/api/agent/stocks').pipe(
      map((response) => this.sortStocks(Array.isArray(response?.stocks) ? response.stocks : [])),
      tap((stocks) => this.agentStocksState.set(stocks)),
      catchError(() => of(this.agentStocksState())),
      finalize(() => this.loadingAgentState.set(false))
    );
  }

  createStock(payload: {
    device_code: string;
    category?: string;
    brand: string;
    model: string;
    variant?: string;
    color?: string;
    device_type?: string;
    price: number;
    in_stock: boolean;
    is_active: boolean;
  }): Observable<DeviceStock | null> {
    this.actionErrorState.set('');
    this.actionBusyState.set(true);
    return this.http.post<{ stock?: DeviceStock }>('/api/agent/stocks', payload).pipe(
      map((response) => response?.stock || null),
      tap((stock) => {
        if (!stock) return;
        this.agentStocksState.update((rows) => this.sortStocks([stock, ...rows.filter((row) => row.id !== stock.id)]));
        this.publicStocksState.update((rows) => this.sortStocks([stock, ...rows.filter((row) => row.id !== stock.id)]));
      }),
      catchError((error) => {
        this.actionErrorState.set(this.extractError(error, 'Unable to create stock.'));
        return of(null);
      }),
      finalize(() => this.actionBusyState.set(false))
    );
  }

  updateStock(stockId: number, patch: Partial<{
    category: string;
    brand: string;
    model: string;
    variant: string;
    color: string;
    device_type: string;
    price: number;
    in_stock: boolean;
    is_active: boolean;
  }>): Observable<DeviceStock | null> {
    this.actionErrorState.set('');
    this.actionBusyState.set(true);
    return this.http.patch<{ stock?: DeviceStock }>(`/api/agent/stocks/${stockId}`, patch).pipe(
      map((response) => response?.stock || null),
      tap((stock) => {
        if (!stock) return;
        this.agentStocksState.update((rows) => this.sortStocks(rows.map((row) => row.id === stock.id ? stock : row)));
        this.publicStocksState.update((rows) => this.sortStocks(rows.map((row) => row.id === stock.id ? stock : row)));
      }),
      catchError((error) => {
        this.actionErrorState.set(this.extractError(error, 'Unable to update stock.'));
        return of(null);
      }),
      finalize(() => this.actionBusyState.set(false))
    );
  }

  deleteStock(stockId: number): Observable<boolean> {
    this.actionErrorState.set('');
    this.actionBusyState.set(true);
    return this.http.delete<{ message?: string }>(`/api/agent/stocks/${stockId}`).pipe(
      map(() => true),
      tap(() => {
        this.agentStocksState.update((rows) => rows.filter((row) => row.id !== stockId));
        this.publicStocksState.update((rows) => rows.filter((row) => row.id !== stockId));
      }),
      catchError((error) => {
        this.actionErrorState.set(this.extractError(error, 'Unable to delete stock.'));
        return of(false);
      }),
      finalize(() => this.actionBusyState.set(false))
    );
  }

  private sortStocks(rows: DeviceStock[]): DeviceStock[] {
    return [...rows].sort((a, b) => {
      const codeA = Number(a.device_code || 0);
      const codeB = Number(b.device_code || 0);
      if (!Number.isNaN(codeA) && !Number.isNaN(codeB) && codeA !== codeB) {
        return codeA - codeB;
      }
      return String(a.device_code || '').localeCompare(String(b.device_code || ''));
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
