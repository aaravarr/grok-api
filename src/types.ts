export type AccountStatus = "active" | "exhausted" | "expired" | "error" | "pending";

export interface AccountTokens {
  access: string;
  refresh: string;
  expires: number;
}

export interface CreditSnapshot {
  creditUsagePercent: number;
  remainingPercent: number;
  periodType?: string;
  periodStart?: string;
  periodEnd?: string;
  productUsage?: Array<{ product: string; usagePercent: number }>;
  prepaidBalance?: number;
  onDemandCap?: number;
  onDemandUsed?: number;
  subscriptionTier?: string;
  checkedAt: number;
  raw?: unknown;
}

export interface Account {
  id: string;
  name: string;
  status: AccountStatus;
  tokens: AccountTokens;
  createdAt: number;
  updatedAt: number;
  lastUsedAt?: number;
  useCount: number;
  lastError?: string;
  note?: string;
  credits?: CreditSnapshot;
}

export interface ApiKeyRecord {
  id: string;
  /** Full key only returned once at creation; stored hashed after. */
  keyHash: string;
  /** Prefix for display e.g. gk_live_ab12… */
  keyPrefix: string;
  alias: string;
  enabled: boolean;
  createdAt: number;
  updatedAt: number;
  expiresAt: number | null;
  lastUsedAt?: number;
  useCount: number;
  note?: string;
}

export type RoutingMode = "auto" | "manual";

export interface RoutingState {
  mode: RoutingMode;
  /** Currently selected account for routing / highlight */
  currentAccountId: string | null;
  /** Round-robin cursor among accounts */
  cursor: number;
}

export interface AccountsStore {
  version: 2;
  accounts: Account[];
  apiKeys: ApiKeyRecord[];
  routing: RoutingState;
}

export interface DeviceSession {
  id: string;
  name?: string;
  deviceCode: string;
  userCode: string;
  verificationUri: string;
  verificationUriComplete?: string;
  intervalMs: number;
  expiresAt: number;
  status: "pending" | "success" | "error";
  accountId?: string;
  error?: string;
  createdAt: number;
}

export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
  error?: string;
  error_description?: string;
}
