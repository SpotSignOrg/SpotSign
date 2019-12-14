import {
  MessageTarget,
  MessageType,
  MessageToContent,
  listen,
  sendToBackground,
} from "addon/lib/messages";
import { assertNever } from "addon/lib/never";
import { toUtf32, fromUtf32 } from "addon/lib/encode";
import { State } from "addon/popup/state";

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

  async function findSignatures() {
    const signatureNodes = [];
    for (const node of document.querySelectorAll("*")) {
      if ((node as HTMLElement).innerText.search(/^\[.*\]/) > -1) {
        const parent = (node as HTMLElement).parentElement;
        if (parent) {
          if (parent.innerText.replace(/(\r\n|\n|\r)/gm, " ").search(/^\[.*\].*\{.*\}/) > -1) {
            signatureNodes.push(parent);
          }
        }
      }
    }

    console.log(signatureNodes);
    for (const signatureNode of signatureNodes) {
      let content: undefined | string;
      let signature: undefined | string;

      const contentMatches = signatureNode.innerText.match(/^\[(.*)\]/);
      if (contentMatches) {
        content = contentMatches[1];
      }

      const signatureMatches = signatureNode.innerText.match(/\{(.*)\}/);
      if (signatureMatches) {
        signature = fromUtf32(signatureMatches[1]);
      }

      if (content && signature) {
        console.log("Found content:", content, "signature:", signature);
        const state: State = await browser.storage.local.get();
        console.log("state", state);
        const response = await sendToBackground({
          type: MessageType.GET_VERIFICATION,
          sender: MessageTarget.CONTENT,
          publicKey: state.keys.publicKey,
          content,
          signature,
        });
        if (response.type === MessageType.SEND_VERIFICATION) {
          console.log(response);
          if (response.verification.datetime) {
            signatureNode.innerText = signatureNode.innerText.replace(
              /\{.*\}/,
              response.verification.datetime,
            );
          }
        }
      }
    }
  }

  findSignatures();

  function getActiveContent(): string {
    const content =
      (document.activeElement as HTMLInputElement).value ||
      (document.activeElement as HTMLElement).innerText;
    console.log("Found content:", content);
    return content;
  }

  function setActiveContent(content: string, signature: string) {
    const element = document.activeElement;
    const signatureBody = `Signature: {${toUtf32(signature)}}`;
    const urlBody = "Signed by http://spotsign.org";
    const signedContent = `[${content}]\n\n${signatureBody}\n\n${urlBody}`;

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
