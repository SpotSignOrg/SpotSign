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

interface Browser {
  runtime: Runtime;
  tabs: BrowserTabs;
}

declare global {
  const browser: Browser;
}
