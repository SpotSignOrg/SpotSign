import { MessageTarget, MessageType, MessageToContent, listen } from "addon/lib/messages";
import { assertNever } from "addon/lib/never";
import { getActiveContent, writeActiveSignature } from "addon/content/sign";
import { verifySignatures, observeDOM } from "addon/content/verify";

(async () => {
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

  listen(MessageTarget.CONTENT, async (message: MessageToContent) => {
    switch (message.type) {
      case MessageType.GET_CONTENT:
        return {
          type: MessageType.SEND_CONTENT,
          sender: MessageTarget.CONTENT,
          content: getActiveContent(),
        };
      case MessageType.WRITE_SIGNATURE:
        return writeActiveSignature(message.content, message.signature, message.publicKey);
      default:
        return assertNever(message);
    }
  });

  verifySignatures(document.body.innerText, document.querySelectorAll("*"));
  observeDOM();
})().catch(console.error);
