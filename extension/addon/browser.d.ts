import { Message, MessageToContent, MessageToBackground, MessageToPopup } from "addon/lib/messages";

interface BrowserOnMessage {
  addListener(
    handler: (message: Message, sender: void, sendResponse: (message: Message) => void) => void,
  ): void;
}

interface Tab {
  id: number;
}

interface TabQuery {
  currentWindow: boolean;
  active: boolean;
}

interface BrowserTabs {
  query: (_: TabQuery) => Promise<Tab[]>;
  sendMessage(tabId: number, message: MessageToContent): Promise<Message>;
}

interface Runtime {
  sendMessage(message: MessageToBackground | MessageToPopup): Promise<Message>;
  onMessage: BrowserOnMessage;
}

interface StorageLocal {
  get<T>(): Promise<T>;
  set<T>(data: T): void;
}

interface Storage {
  local: StorageLocal;
}

interface Browser {
  runtime: Runtime;
  tabs: BrowserTabs;
  storage: Storage;
}

declare global {
  const browser: Browser;
  interface Window {
    hasRun: boolean;
  }
}
