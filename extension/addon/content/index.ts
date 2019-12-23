import {
  MessageTarget,
  MessageType,
  MessageToContent,
  listen,
  sendToBackground,
} from "addon/lib/messages";
import { assertNever } from "addon/lib/never";
import { State } from "addon/popup/state";

declare global {
  interface Window {
    hasRun: boolean;
  }
}

function escapeRegExp(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

function stripContent(input: string) {
  return input.replace(/(\r\n|\n|\r)/gm, "").trim();
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
    const re = new RegExp(
      /http:\/\/spotsign\.org\/v\/\?a=(.{1})&b=(.{1})&c=(\d+)&s=([a-zA-Z0-9\_\-\=]*)/gm,
    );

    for (const currElem of document.querySelectorAll("*")) {
      const elem = currElem as HTMLElement;
      if (elem.childElementCount > 0) {
        continue;
      }

      const signatureMatches = Array.from(elem.innerText.matchAll(re));

      if (!signatureMatches.length) {
        continue;
      }

      console.log("Found signature", Array.from(signatureMatches), "in", elem);

      for (const signatureMatch of signatureMatches) {
        console.log("found match", signatureMatch);
        const a = signatureMatch[1];
        const b = signatureMatch[2];
        const c = parseInt(signatureMatch[3]);
        const signature = signatureMatch[4];
        const contentRe = new RegExp(
          `${escapeRegExp(a)}[\\s\\S]{${c - 2}}${escapeRegExp(b)}`,
          "gm",
        );

        console.log("Searching for", contentRe);

        const contentMatches = document.body.innerText.matchAll(contentRe);

        for (const contentMatch of contentMatches) {
          const content = stripContent(contentMatch[0]);
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
              console.log("Verified", content, signature);
              const verifiedRe = new RegExp(`http:\/\/spotsign.org.*${signature}`, "gm");
              console.log("Replacing with verifiedre", elem.innerHTML, verifiedRe);
              elem.innerHTML = elem.innerHTML.replace(
                verifiedRe,
                `Verified: ${response.verification.datetime}`,
              );
            } else {
              console.log("Failed to verify", content, signature);
            }
          }
        }
      }
    }
  }

  findSignatures();

  function getActiveContent() {
    const content =
      (document.activeElement as HTMLInputElement).value ||
      (document.activeElement as HTMLElement).innerText;
    console.log("Found content:", content);
    return content;
  }

  function formatSignature(content: string, signature: string) {
    const a = content[0];
    const b = content[content.length - 1];
    const c = content.length;
    return `http://spotsign.org/v/?a=${a}&b=${b}&c=${c}&s=${signature}`;
  }

  function writeActiveSignature(signature: string) {
    const element = document.activeElement;
    const content = getActiveContent();
    const signatureUrl = formatSignature(content, signature);
    const signedContent = `${content}\n\n${signatureUrl}`;

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
          content: stripContent(getActiveContent()),
        };
      case MessageType.WRITE_SIGNATURE:
        return writeActiveSignature(message.signature);
      default:
        return assertNever(message);
    }
  });
})();
