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
console.log(SIGNATURES_RE);

function stripContent(input: string) {
  return input.replace(SPECIAL_CHARACTERS_RE, "").trim();
}

function formatSignature(content: string, signature: string) {
  const a = content[0];
  const b = content[content.length - 1];
  const c = content.length;
  return `${SIGN_HOST}/v/?a=${a}&b=${b}&c=${c}&s=${signature}`;
}

async function verifySignature(state: State, content: string, signature: string) {
  const response = await sendToBackground({
    type: MessageType.GET_VERIFICATION,
    sender: MessageTarget.CONTENT,
    publicKey: state.keys.publicKey,
    content,
    signature,
  });

  if (response.type === MessageType.SEND_VERIFICATION) {
    if (response.verification.verified) {
      return response.verification;
    }
  }
  return;
}

async function verifySignatures(state: State, documentContent: string, nodes: NodeList) {
  const strippedContent = stripContent(documentContent);

  for (const node of nodes) {
    const elem = node as HTMLElement;

    if (elem.childElementCount > 0 || !elem.innerText) continue;

    const signatureMatches = Array.from(elem.innerText.matchAll(SIGNATURES_RE));

    if (!signatureMatches.length) continue;

    for (const signatureMatch of signatureMatches) {
      const signatureUrl = signatureMatch[0];
      const a = signatureMatch[1];
      const b = signatureMatch[2];
      const c = parseInt(signatureMatch[3]);
      const signature = signatureMatch[4];

      let verification;

      if (c === 1) {
        const content = a;
        verification = await verifySignature(state, content, signature);
      } else if (c === 2) {
        const content = `${a}${b}`;
        verification = await verifySignature(state, content, signature);
      } else {
        const contentRe = new RegExp(
          `${escapeRegExp(a)}[\\s\\S]{${c - 2}}${escapeRegExp(b)}`,
          "gm",
        );
        const contentMatches = Array.from(strippedContent.matchAll(contentRe));
        for (const contentMatch of contentMatches) {
          const content = stripContent(contentMatch[0]);
          verification = await verifySignature(state, content, signature);
          if (verification) {
            break;
          }
        }
      }

      if (verification) {
        elem.innerHTML = `<a href=${signatureUrl}>Signed by Jared on ${verification.datetime}</a>`;
      }
    }
  }
}

function getActiveContent() {
  const content =
    (document.activeElement as HTMLInputElement).value ||
    (document.activeElement as HTMLElement).innerText;
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

function observeDOM(state: State) {
  const observer = new MutationObserver(mutationsList => {
    for (const mutation of mutationsList) {
      for (const node of mutation.addedNodes) {
        const elements = (node as Element).querySelectorAll("*");
        if (elements.length) {
          verifySignatures(state, document.body.innerText, elements);
        }
      }
    }
  });

  // Start observing the target node for configured mutations
  observer.observe(document.body, { childList: true, subtree: true });
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

  setupListener();
  verifySignatures(state, document.body.innerText, document.querySelectorAll("*"));
  observeDOM(state);
})();
