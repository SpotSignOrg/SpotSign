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

const SIGN_HOST = "https://localhost:8080";
const SPECIAL_CHARACTERS = "\r\n !\"#$%&'()*+,-./:;<=>?@[]^_`{|}~";
const SPECIAL_CHARACTERS_RE = new RegExp(
  SPECIAL_CHARACTERS.split("")
    .map(e => `\\${e}`)
    .join("|"),
  "gm",
);
const SIGNATURES_RE = new RegExp(
  `${escapeRegExp(SIGN_HOST)}\\/v\\/\\?a=(.)&b=(.)&c=(\\d+)&s=([a-zA-Z0-9\\_\\-\\=]*)`,
  "gm",
);

function stripContent(input: string) {
  return input.replace(SPECIAL_CHARACTERS_RE, "").trim();
}

function formatSignature(content: string, signature: string) {
  const a = content[0];
  const b = content[content.length - 1];
  const c = content.length;
  return `${SIGN_HOST}/v/?a=${a}&b=${b}&c=${c}&s=${signature}`;
}

async function verifySignature(
  state: State,
  elem: HTMLElement,
  content: string,
  signature: string,
  signatureUrl: string,
) {
  console.log("Verifying signature");
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
      elem.innerHTML = `<a href=${signatureUrl}>Signed by Jared on ${response.verification.datetime}</a>`;
      return true;
    }
  }
  console.log("Failed to verify", content, signature);
  return false;
}

async function verifySignatures(state: State) {
  for (const currElem of document.querySelectorAll("*")) {
    const elem = currElem as HTMLElement;
    if (elem.childElementCount > 0) continue;

    const signatureMatches = Array.from(elem.innerText.matchAll(SIGNATURES_RE));
    if (!signatureMatches.length) continue;

    for (const signatureMatch of signatureMatches) {
      const signatureUrl = signatureMatch[0];
      const a = signatureMatch[1];
      const b = signatureMatch[2];
      const c = parseInt(signatureMatch[3]);
      const signature = signatureMatch[4];

      if (c === 1) {
        const content = a;
        verifySignature(state, elem, content, signature, signatureUrl);
      } else if (c === 2) {
        const content = `${a}${b}`;
        verifySignature(state, elem, content, signature, signatureUrl);
      } else {
        const contentRe = new RegExp(
          `${escapeRegExp(a)}[\\s\\S]{${c - 2}}${escapeRegExp(b)}`,
          "gm",
        );
        const contentMatches = stripContent(document.body.innerText).matchAll(contentRe);

        for (const contentMatch of contentMatches) {
          const content = stripContent(contentMatch[0]);
          const verified = await verifySignature(state, elem, content, signature, signatureUrl);
          if (verified) {
            break;
          }
        }
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
