import { Message, MessageToContent, MessageToBackground, MessageToPopup } from "addon/lib/messages";

interface BrowserOnMessage {
  addListener(handler: (message: Message) => void): void;
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
  sendMessage: (tabId: number, message: MessageToContent) => void;
}

interface Runtime {
  sendMessage(message: MessageToBackground | MessageToPopup): void;
  onMessage: BrowserOnMessage;
}

interface Browser {
  runtime: Runtime;
  tabs: BrowserTabs;
}

declare global {
  const browser: Browser;
}
