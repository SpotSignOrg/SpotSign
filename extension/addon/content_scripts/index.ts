import { MessageToPopup, MessageType, MessageToContent } from "addon/lib/messages";

declare global {
  interface Window {
    hasRun: boolean;
  }
}

(function(): void {
  /**
   * Check and set a global guard variable.
   * If this content script is injected into the same page again,
   * it will do nothing next time.
   */
  console.log("Entering content script");
  if (window.hasRun) {
    return;
  }
  window.hasRun = true;

  function sendMessage(message: MessageToPopup): void {
    console.log("sending message from content");
    browser.runtime.sendMessage(message);
  }

  sendMessage({ type: MessageType.CONTENT_ALIVE });

  function getActiveContent(): string {
    const element = document.activeElement;
    console.log("Active element:", element);
    const content =
      (document.activeElement as HTMLInputElement).value || (document.activeElement as HTMLElement).innerText;
    console.log("Found content:", content);
    return content;
  }

  console.log("content listening");
  browser.runtime.onMessage.addListener((message: MessageToContent) => {
    console.log("received message in content", message);
    switch (message.type) {
      case MessageType.GET_CONTENT:
        const content = getActiveContent();
        sendMessage({
          type: MessageType.SEND_CONTENT,
          content,
        });
    }
  });
})();
