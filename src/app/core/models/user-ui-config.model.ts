export interface EffectiveUserUiConfig {
  supportChatLocked: boolean;
  agreementsLocked: boolean;
  groupChatLocked: boolean;
  privateChatLocked: boolean;
  serverDown: boolean;
}

export interface AgentUserUiGlobalConfig {
  supportChatLocked: boolean;
  agreementsLocked: boolean;
  groupChatLocked: boolean;
  privateChatLocked: boolean;
  serverDown: boolean;
  updatedAt?: string | null;
  updatedByName?: string;
}

export interface AgentUserUiOverrideConfig {
  supportChatLocked: boolean | null;
  agreementsLocked: boolean | null;
  groupChatLocked: boolean | null;
  privateChatLocked: boolean | null;
  serverDown: boolean | null;
  updatedAt?: string | null;
  updatedByName?: string;
  hasOverrides?: boolean;
}

export interface AgentUserUiConfigUserSummary {
  id: string;
  fullName: string;
  email: string;
}

export interface AgentUserUiConfigDetail {
  user: AgentUserUiConfigUserSummary;
  global: AgentUserUiGlobalConfig;
  override: AgentUserUiOverrideConfig;
  effective: EffectiveUserUiConfig;
}

export interface AgentUserUiGlobalConfigPatch {
  supportChatLocked?: boolean;
  agreementsLocked?: boolean;
  groupChatLocked?: boolean;
  privateChatLocked?: boolean;
  serverDown?: boolean;
}

export interface AgentUserUiOverridePatch {
  supportChatLocked?: boolean | null;
  agreementsLocked?: boolean | null;
  groupChatLocked?: boolean | null;
  privateChatLocked?: boolean | null;
  serverDown?: boolean | null;
}
