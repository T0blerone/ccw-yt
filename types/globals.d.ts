/**
 * Ambient declarations for `ccw-yt` shared namespaces.
 */

interface CCWTabInfo {
  id?: number;
  url?: string;
}

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
  tabs?: {
    query(queryInfo: { active?: boolean; currentWindow?: boolean }): Promise<CCWTabInfo[]>;
    sendMessage(tabId: number, message: unknown): Promise<unknown>;
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
  readonly OPEN_INPAGE_SETTINGS: "CCW_OPEN_INPAGE_SETTINGS";
}

type CCWIconName =
  | "arrow-left"
  | "arrows-clockwise"
  | "clock-counter-clockwise"
  | "funnel-simple"
  | "gear"
  | "lock-simple"
  | "magnifying-glass"
  | "minus"
  | "play"
  | "plus";

interface CCWIconsAPI {
  create(name: CCWIconName, size?: number): SVGSVGElement;
}

interface CCWSession {
  startedAt: number;
  endsAt: number;
  durationSec: number;
}

type CCWLandingTarget =
  | "home"
  | "subscriptions"
  | "search_only"
  | "watch_later"
  | "library"
  | "history";

type CCWTimerVisibility = "always" | "feeds_only" | "hidden";

interface CCWSettings {
  defaultMinutes: number;
  cooldownMinutes: number;
  defaultLanding: CCWLandingTarget;
  timerVisibility: CCWTimerVisibility;
  allowLiveStreams: boolean;
  blockOverBudgetWatch: boolean;
  exemptSearch: boolean;
  exemptChannels: boolean;
  exemptPlaylistsAndHistory: boolean;
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
  startPostOvertimeCooldown(now?: number): Promise<CCWStateSnapshot>;
  updateSettings(partial: Partial<CCWSettings>): Promise<CCWSettings>;
  getRemainingSeconds(session: CCWSession | null, now?: number): number;
  formatDuration(totalSeconds: number): string;
  formatCalmDuration(totalSeconds: number): string;
  getLandingPath(landing: CCWLandingTarget): string;
  subscribe(listener: (state: CCWStateSnapshot) => void): () => void;
}

interface CCWSettingsPanelOptions {
  backLabel: string;
  onBack: () => void;
  onSettingsChanged?: (settings: CCWSettings) => void;
}

interface CCWSettingsPanelHandle {
  refresh(settings: CCWSettings): void;
  destroy(): void;
}

interface CCWSettingsPanelAPI {
  readonly STYLES: string;
  mount(
    container: HTMLElement,
    options: CCWSettingsPanelOptions
  ): CCWSettingsPanelHandle;
}

type CCWTabMode = "active" | "single_video" | "cooldown" | "locked";
type CCWSingleVideoOrigin = "direct" | "overtime";

interface CCWTabResolution {
  mode: CCWTabMode;
  remainingSec: number;
  cooldownRemainingSec: number;
  allowedVideoId: string | null;
  singleVideoOrigin: CCWSingleVideoOrigin | null;
  currentVideoId: string | null;
  isFreshDirectVideoLink: boolean;
  state: CCWStateSnapshot;
}

interface CCWTabAllowanceAPI {
  getCurrentVideoId(urlString?: string): string | null;
  getAllowedVideoId(): string | null;
  grantSingleVideo(videoId: string, origin?: CCWSingleVideoOrigin): void;
  clearAllowedVideo(): void;
  resolveTabState(
    state: CCWStateSnapshot,
    options?: {
      wasSessionActiveInTab?: boolean;
      isCurrentVideoEnded?: boolean;
      isCurrentVideoLive?: boolean;
      urlString?: string;
      now?: number;
    }
  ): CCWTabResolution;
}

interface CCWMediaGuardAPI {
  init(): void;
  setLocked(locked: boolean): void;
  isAdPlaying(videoEl?: HTMLMediaElement | null): boolean;
  isMainVideoLive(): boolean;
  isMainVideoEnded(): boolean;
  getMainVideo(): HTMLVideoElement | null;
}

interface CCWEntryGateAPI {
  init(callbacks: {
    onStartTimedSession: (minutes: number) => Promise<void>;
    onGrantSingleVideo: (videoId: string) => void;
    onSettingsOverlayVisibilityChange?: (open: boolean) => void;
  }): void;
  update(resolution: CCWTabResolution): void;
  openSettings(): void;
  closeSettings(): void;
}

interface CCWSearchOnlyAPI {
  update(active: boolean): void;
}

interface CCWHudAPI {
  init(callbacks: {
    onOpenSettings: () => void;
    onEndSession: () => Promise<void>;
  }): void;
  update(resolution: CCWTabResolution): void;
}

interface CCWFeedFilterAPI {
  init(callbacks: { onEndSession: () => Promise<void> }): void;
  update(resolution: CCWTabResolution): void;
  notifyNavigation(): void;
}

interface CCWWatchGuardAPI {
  init(callbacks: {
    onGoBack: () => void;
    onOpenSettings: () => void;
  }): void;
  update(resolution: CCWTabResolution): void;
}

interface CCWNamespace {
  ext: CCWExtensionAPI;
  MESSAGES: CCWMessages;
  icons: CCWIconsAPI;
  state: CCWStateAPI;
  settingsPanel: CCWSettingsPanelAPI;
  tabAllowance: CCWTabAllowanceAPI;
  mediaGuard: CCWMediaGuardAPI;
  entryGate: CCWEntryGateAPI;
  searchOnly: CCWSearchOnlyAPI;
  hud: CCWHudAPI;
  feedFilter: CCWFeedFilterAPI;
  watchGuard: CCWWatchGuardAPI;
}

declare var CCW: CCWNamespace;
