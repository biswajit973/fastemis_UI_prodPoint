import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import {
  AgentUserUiConfigDetail,
  AgentUserUiGlobalConfig,
  AgentUserUiGlobalConfigPatch,
  AgentUserUiOverrideConfig,
  AgentUserUiOverridePatch
} from '../models/user-ui-config.model';

interface RawUiConfig {
  support_chat_locked?: boolean | null;
  agreements_locked?: boolean | null;
  group_chat_locked?: boolean | null;
  private_chat_locked?: boolean | null;
  server_down?: boolean | null;
  updated_at?: string | null;
  updated_by_name?: string;
  has_overrides?: boolean;
}

interface RawAgentUserUiConfigDetailResponse {
  user?: {
    id?: string | number;
    full_name?: string;
    email?: string;
  };
  global?: RawUiConfig;
  override?: RawUiConfig;
  effective?: RawUiConfig;
}

@Injectable({
  providedIn: 'root'
})
export class UserUiConfigApiService {
  constructor(private http: HttpClient) {}

  getGlobalConfig(): Observable<AgentUserUiGlobalConfig | null> {
    return this.http.get<{ config?: RawUiConfig }>('/api/agent/ui-config/global').pipe(
      map((response) => response?.config ? this.mapGlobal(response.config) : null),
      catchError(() => of(null))
    );
  }

  updateGlobalConfig(patch: AgentUserUiGlobalConfigPatch): Observable<AgentUserUiGlobalConfig | null> {
    return this.http.patch<{ config?: RawUiConfig }>('/api/agent/ui-config/global', this.mapGlobalPatch(patch)).pipe(
      map((response) => response?.config ? this.mapGlobal(response.config) : null),
      catchError(() => of(null))
    );
  }

  getUserConfig(userId: string): Observable<AgentUserUiConfigDetail | null> {
    return this.http.get<RawAgentUserUiConfigDetailResponse>(`/api/agent/ui-config/users/${userId}`).pipe(
      map((response) => {
        if (!response?.user) {
          return null;
        }
        return {
          user: {
            id: String(response.user.id || ''),
            fullName: String(response.user.full_name || '').trim(),
            email: String(response.user.email || '').trim()
          },
          global: this.mapGlobal(response.global),
          override: this.mapOverride(response.override),
          effective: this.mapEffective(response.effective)
        };
      }),
      catchError(() => of(null))
    );
  }

  updateUserConfig(userId: string, patch: AgentUserUiOverridePatch): Observable<AgentUserUiConfigDetail | null> {
    return this.http.patch<RawAgentUserUiConfigDetailResponse>(
      `/api/agent/ui-config/users/${userId}`,
      this.mapOverridePatch(patch)
    ).pipe(
      map((response) => {
        if (!response?.user) {
          return null;
        }
        return {
          user: {
            id: String(response.user.id || ''),
            fullName: String(response.user.full_name || '').trim(),
            email: String(response.user.email || '').trim()
          },
          global: this.mapGlobal(response.global),
          override: this.mapOverride(response.override),
          effective: this.mapEffective(response.effective)
        };
      }),
      catchError(() => of(null))
    );
  }

  private mapGlobal(raw?: RawUiConfig | null): AgentUserUiGlobalConfig {
    return {
      supportChatLocked: !!raw?.support_chat_locked,
      agreementsLocked: !!raw?.agreements_locked,
      groupChatLocked: !!raw?.group_chat_locked,
      privateChatLocked: !!raw?.private_chat_locked,
      serverDown: !!raw?.server_down,
      updatedAt: raw?.updated_at || null,
      updatedByName: String(raw?.updated_by_name || '').trim()
    };
  }

  private mapOverride(raw?: RawUiConfig | null): AgentUserUiOverrideConfig {
    return {
      supportChatLocked: raw?.support_chat_locked ?? null,
      agreementsLocked: raw?.agreements_locked ?? null,
      groupChatLocked: raw?.group_chat_locked ?? null,
      privateChatLocked: raw?.private_chat_locked ?? null,
      serverDown: raw?.server_down ?? null,
      updatedAt: raw?.updated_at || null,
      updatedByName: String(raw?.updated_by_name || '').trim(),
      hasOverrides: !!raw?.has_overrides
    };
  }

  private mapEffective(raw?: RawUiConfig | null) {
    return {
      supportChatLocked: !!raw?.support_chat_locked,
      agreementsLocked: !!raw?.agreements_locked,
      groupChatLocked: !!raw?.group_chat_locked,
      privateChatLocked: !!raw?.private_chat_locked,
      serverDown: !!raw?.server_down
    };
  }

  private mapGlobalPatch(patch: AgentUserUiGlobalConfigPatch): Record<string, boolean> {
    const body: Record<string, boolean> = {};
    if (typeof patch.supportChatLocked === 'boolean') body['support_chat_locked'] = patch.supportChatLocked;
    if (typeof patch.agreementsLocked === 'boolean') body['agreements_locked'] = patch.agreementsLocked;
    if (typeof patch.groupChatLocked === 'boolean') body['group_chat_locked'] = patch.groupChatLocked;
    if (typeof patch.privateChatLocked === 'boolean') body['private_chat_locked'] = patch.privateChatLocked;
    if (typeof patch.serverDown === 'boolean') body['server_down'] = patch.serverDown;
    return body;
  }

  private mapOverridePatch(patch: AgentUserUiOverridePatch): Record<string, boolean | null> {
    const body: Record<string, boolean | null> = {};
    if (patch.supportChatLocked !== undefined) body['support_chat_locked'] = patch.supportChatLocked;
    if (patch.agreementsLocked !== undefined) body['agreements_locked'] = patch.agreementsLocked;
    if (patch.groupChatLocked !== undefined) body['group_chat_locked'] = patch.groupChatLocked;
    if (patch.privateChatLocked !== undefined) body['private_chat_locked'] = patch.privateChatLocked;
    if (patch.serverDown !== undefined) body['server_down'] = patch.serverDown;
    return body;
  }
}
