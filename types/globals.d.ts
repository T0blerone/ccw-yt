/**
 * Minimal ambient declarations so `jsconfig.json` type-checks cleanly
 * even before optional `@types/*` packages are installed.
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

interface CCWNamespace {
  ext: CCWExtensionAPI;
  MESSAGES: CCWMessages;
}

declare var CCW: CCWNamespace;

interface GlobalThis {
  CCW?: CCWNamespace;
  browser?: CCWExtensionAPI;
  chrome?: CCWExtensionAPI;
}
