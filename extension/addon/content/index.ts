import { MessageTarget, MessageType, MessageToContent, listen } from "addon/lib/messages";
import { assertNever } from "addon/lib/never";
import { toUtf32 } from "addon/lib/encode";

declare global {
  interface Window {
    hasRun: boolean;
  }
}

(function() {
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

  function getActiveContent(): string {
    const content =
      (document.activeElement as HTMLInputElement).value ||
      (document.activeElement as HTMLElement).innerText;
    console.log("Found content:", content);
    return content;
  }

  function setActiveContent(content: string, signature: string) {
    const element = document.activeElement;
    const signedContent = `${content}\n\nSignature: ${toUtf32(signature)}`;

    if (!element) return;

    if ((element as HTMLInputElement).value) {
      (element as HTMLInputElement).value = signedContent;
    } else {
      (element as HTMLElement).innerText = signedContent;
    }
  }

  console.log("content listening");
  listen(MessageTarget.CONTENT, (message: MessageToContent) => {
    switch (message.type) {
      case MessageType.GET_CONTENT:
        return {
          type: MessageType.SEND_CONTENT,
          sender: MessageTarget.CONTENT,
          content: getActiveContent(),
        };
      case MessageType.WRITE_SIGNATURE:
        return setActiveContent(message.content, message.signature);
      default:
        return assertNever(message);
    }
  });
})();
