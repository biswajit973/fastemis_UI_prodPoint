import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import {
  AgentCommunityVisibilityConfig,
  AgentCommunityVisibilityDetail
} from '../models/community-visibility.model';

interface RawCommunityVisibilityConfig {
  visible_to_real_users?: boolean;
  community_posts_agent_only?: boolean;
  updated_at?: string | null;
  updated_by_name?: string;
}

interface RawCommunityVisibilityDetailResponse {
  user?: {
    id?: string | number;
    full_name?: string;
    email?: string;
    community_posts_agent_only?: boolean;
  };
  config?: RawCommunityVisibilityConfig;
}

@Injectable({
  providedIn: 'root'
})
export class CommunityVisibilityApiService {
  constructor(private http: HttpClient) {}

  getUserConfig(userId: string): Observable<AgentCommunityVisibilityDetail | null> {
    return this.http.get<RawCommunityVisibilityDetailResponse>(`/api/agent/community-visibility/users/${userId}`).pipe(
      map((response) => this.mapDetail(response)),
      catchError(() => of(null))
    );
  }

  updateUserConfig(userId: string, visibleToRealUsers: boolean): Observable<AgentCommunityVisibilityDetail | null> {
    return this.http.patch<RawCommunityVisibilityDetailResponse>(
      `/api/agent/community-visibility/users/${userId}`,
      { visible_to_real_users: visibleToRealUsers }
    ).pipe(
      map((response) => this.mapDetail(response)),
      catchError(() => of(null))
    );
  }

  private mapDetail(response?: RawCommunityVisibilityDetailResponse | null): AgentCommunityVisibilityDetail | null {
    if (!response?.user) {
      return null;
    }

    const config = this.mapConfig(response.config);
    return {
      user: {
        id: String(response.user.id || ''),
        fullName: String(response.user.full_name || '').trim(),
        email: String(response.user.email || '').trim(),
        communityPostsAgentOnly: !!response.user.community_posts_agent_only
      },
      config
    };
  }

  private mapConfig(raw?: RawCommunityVisibilityConfig | null): AgentCommunityVisibilityConfig {
    const visibleToRealUsers = !!raw?.visible_to_real_users;
    return {
      visibleToRealUsers,
      communityPostsAgentOnly: !!raw?.community_posts_agent_only || !visibleToRealUsers,
      updatedAt: raw?.updated_at || null,
      updatedByName: String(raw?.updated_by_name || '').trim()
    };
  }
}
