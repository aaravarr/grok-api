export type AccountStatus = "active" | "exhausted" | "expired" | "error" | "pending";

/** How the seat is being authorized */
export type OAuthMode = "browser" | "auto";

/** Progress of in-flight device-code authorization */
export type OAuthPhase =
  | "waiting_user"
  | "automating"
  | "failed"
  | "authorized";

export interface AccountOAuthMeta {
  sessionId: string;
  mode: OAuthMode;
  phase: OAuthPhase;
  userCode: string;
  verificationUri: string;
  verificationUriComplete?: string;
  expiresAt: number;
  lastMessage?: string;
}

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
  /** App user who contributed this xAI account (null/undefined = admin-managed pool) */
  donorUserId?: string | null;
  /**
   * When true, only the donor can route through this account.
   * Default false = joins the public shared pool.
   * Ignored when allowedUserIds is non-empty (allowlist wins).
   */
  private?: boolean;
  /**
   * When non-empty, only these app user ids may route through this account.
   * Also excludes the seat from the public shared pool.
   */
  allowedUserIds?: string[] | null;
  /** In-flight device OAuth (pending seats only; cleared when active) */
  oauth?: AccountOAuthMeta | null;
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
  /** Owning app user (multi-user). Legacy keys may omit. */
  userId?: string | null;
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
  /** Contributor user id when started from /contribute */
  donorUserId?: string | null;
  private?: boolean;
  allowedUserIds?: string[] | null;
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
