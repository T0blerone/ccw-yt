/**
 * Ambient declarations for `ccw-yt` shared namespaces and WebExtension APIs.
 */

interface CCWExtensionAPI {
  storage: {
    local: {
      get(keys?: string | string[] | Record<string, unknown> | null): Promise<Record<string, unknown>>;
      set(items: Record<string, unknown>): Promise<void>;
      remove(keys: string | string[]): Promise<void>;
    };
    onChanged: {
      addListener(
        callback: (
          changes: Record<string, { oldValue?: unknown; newValue?: unknown }>,
          areaName: string
        ) => void
      ): void;
      removeListener(
        callback: (
          changes: Record<string, { oldValue?: unknown; newValue?: unknown }>,
          areaName: string
        ) => void
      ): void;
    };
  };
  runtime: {
    sendMessage(message: unknown): Promise<unknown>;
    openOptionsPage(): Promise<void>;
    getURL(path: string): string;
    onMessage: {
      addListener(
        callback: (
          message: unknown,
          sender: unknown,
          sendResponse: (response?: unknown) => void
        ) => boolean | void | Promise<unknown>
      ): void;
    };
  };
}

interface CCWMessages {
  readonly OPEN_OPTIONS: "CCW_OPEN_OPTIONS";
}

interface CCWSession {
  startedAt: number;
  endsAt: number;
  durationSec: number;
}

type CCWLandingTarget = "home" | "subscriptions" | "watch_later" | "history";

interface CCWSettings {
  presetMinutes: number[];
  cooldownMinutes: number;
  defaultLanding: CCWLandingTarget;
}

interface CCWStateSnapshot {
  session: CCWSession | null;
  cooldownUntil: number;
  settings: CCWSettings;
  remainingSec: number;
  cooldownRemainingSec: number;
}

type CCWStartResult =
  | { ok: true; state: CCWStateSnapshot }
  | {
      ok: false;
      reason: "INVALID_DURATION" | "SESSION_ALREADY_ACTIVE" | "COOLDOWN_ACTIVE";
      state: CCWStateSnapshot;
    };

interface CCWStateAPI {
  readonly SCHEMA_VERSION: number;
  readonly MISCLICK_GRACE_MS: number;
  readonly DEFAULT_SETTINGS: Readonly<CCWSettings>;
  getState(now?: number): Promise<CCWStateSnapshot>;
  startTimedSession(durationSec: number, now?: number): Promise<CCWStartResult>;
  endSession(options?: { reason?: "manual" | "expired" }, now?: number): Promise<CCWStateSnapshot>;
  updateSettings(partial: Partial<CCWSettings>): Promise<CCWSettings>;
  getRemainingSeconds(session: CCWSession | null, now?: number): number;
  formatDuration(totalSeconds: number): string;
  subscribe(listener: (state: CCWStateSnapshot) => void): () => void;
}

type CCWTabMode = "active" | "single_video" | "cooldown" | "locked";

interface CCWTabResolution {
  mode: CCWTabMode;
  remainingSec: number;
  cooldownRemainingSec: number;
  allowedVideoId: string | null;
  currentVideoId: string | null;
  state: CCWStateSnapshot;
}

interface CCWTabAllowanceAPI {
  getCurrentVideoId(urlString?: string): string | null;
  getAllowedVideoId(): string | null;
  grantSingleVideo(videoId: string): void;
  clearAllowedVideo(): void;
  resolveTabState(
    state: CCWStateSnapshot,
    options?: {
      wasSessionActiveInTab?: boolean;
      isCurrentVideoEnded?: boolean;
      urlString?: string;
    }
  ): CCWTabResolution;
}

interface CCWNamespace {
  ext: CCWExtensionAPI;
  MESSAGES: CCWMessages;
  state: CCWStateAPI;
  tabAllowance?: CCWTabAllowanceAPI;
}

declare var CCW: CCWNamespace;

interface GlobalThis {
  CCW?: CCWNamespace;
  browser?: CCWExtensionAPI;
  chrome?: CCWExtensionAPI;
}
