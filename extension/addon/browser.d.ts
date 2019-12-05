import { Message, MessageToContent, MessageToBackground, MessageToPopup } from "addon/lib/messages";

export interface Window {
  hasRun: boolean;
}

export interface BrowserOnMessage {
  addListener(handler: (message: Message) => void): void;
}

export interface Tab {
  id: number;
}

export type Tabs = Array<Tab>;

export interface TabQuery {
  currentWindow: boolean;
  active: boolean;
}

export interface BrowserTabs {
  query: (_: TabQuery) => Promise<Tabs>;
  sendMessage: (tabId: number, message: MessageToContent) => void;
}

export interface Runtime {
  sendMessage(message: MessageToBackground | MessageToPopup): void;
  onMessage: BrowserOnMessage;
}

export interface Browser {
  runtime: Runtime;
  tabs: BrowserTabs;
}

declare global {
  const browser: Browser;
}
