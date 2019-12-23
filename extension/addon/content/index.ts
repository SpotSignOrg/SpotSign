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

function getContentRegExp(signatureMatch: RegExpMatchArray) {
  const a = signatureMatch[1];
  const b = signatureMatch[2];
  const c = parseInt(signatureMatch[3]);
  return new RegExp(`${escapeRegExp(a)}[\\s\\S]{${c - 2}}${escapeRegExp(b)}`, "gm");
}

async function verifySignature(
  state: State,
  elem: HTMLElement,
  content: string,
  signature: string,
) {
  const response = await sendToBackground({
    type: MessageType.GET_VERIFICATION,
    sender: MessageTarget.CONTENT,
    publicKey: state.keys.publicKey,
    content,
    signature,
  });

  console.log(response);

  if (response.type === MessageType.SEND_VERIFICATION) {
    if (response.verification.datetime) {
      console.log("Verified", content, signature);
      const verifiedRe = new RegExp(`http:\/\/spotsign.org.*${signature}`, "gm");
      elem.innerHTML = elem.innerHTML.replace(
        verifiedRe,
        `Verified: ${response.verification.datetime}`,
      );
    } else {
      console.log("Failed to verify", content, signature);
    }
  }
}

async function verifySignatures(state: State) {
  const signaturesRe = new RegExp(
    /http:\/\/spotsign\.org\/v\/\?a=(.{1})&b=(.{1})&c=(\d+)&s=([a-zA-Z0-9\_\-\=]*)/gm,
  );

  for (const currElem of document.querySelectorAll("*")) {
    const elem = currElem as HTMLElement;
    if (elem.childElementCount > 0) continue;

    const signatureMatches = Array.from(elem.innerText.matchAll(signaturesRe));
    if (!signatureMatches.length) continue;

    for (const signatureMatch of signatureMatches) {
      const contentMatches = document.body.innerText.matchAll(getContentRegExp(signatureMatch));
      for (const contentMatch of contentMatches) {
        const signature = signatureMatch[4];
        const content = stripContent(contentMatch[0]);
        console.log("Found content:", content, "signature:", signature);
        verifySignature(state, elem, content, signature);
      }
    }
  }
}

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

function writeActiveSignature(signedContent: string, signature: string) {
  const element = document.activeElement;
  const content = getActiveContent();
  const signatureUrl = formatSignature(signedContent, signature);
  const contentWithSignature = `${content}\n\n${signatureUrl}`;

  if (!element) return;

  if ((element as HTMLInputElement).value) {
    (element as HTMLInputElement).value = contentWithSignature;
  } else {
    (element as HTMLElement).innerText = contentWithSignature;
  }
}

function setupListener() {
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
        return writeActiveSignature(message.content, message.signature);
      default:
        return assertNever(message);
    }
  });
}

(async function() {
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

  const state: State = await browser.storage.local.get();

  verifySignatures(state);
  setupListener();
})();
