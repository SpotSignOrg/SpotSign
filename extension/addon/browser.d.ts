interface Window {
  hasRun: boolean;
}

interface BrowserOnMessage {
  addListener(handler): void;
}

interface BrowserTabs {
  query;
  sendMessage;
}

interface Runtime {
  sendMessage(message): void;
  onMessage: BrowserOnMessage;
}

interface Browser {
  runtime: Runtime;
  tabs: BrowserTabs;
}

declare const browser: Browser;
