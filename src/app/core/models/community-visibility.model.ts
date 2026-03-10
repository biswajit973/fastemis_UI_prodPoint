export interface AgentCommunityVisibilityUserSummary {
  id: string;
  fullName: string;
  email: string;
  communityPostsAgentOnly: boolean;
}

export interface AgentCommunityVisibilityConfig {
  visibleToRealUsers: boolean;
  communityPostsAgentOnly: boolean;
  updatedAt: string | null;
  updatedByName: string;
}

export interface AgentCommunityVisibilityDetail {
  user: AgentCommunityVisibilityUserSummary;
  config: AgentCommunityVisibilityConfig;
}
