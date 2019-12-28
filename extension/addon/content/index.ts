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
(async function() {
  function escapeRegExp(input: string) {
    return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
  }

  const SIGN_HOST = "https://spotsign.org";
  const SPECIAL_CHARACTERS = "\r\n !\"#$%&'()*+,-./:;<=>?@[]^_`{|}~";
  const SPECIAL_CHARACTERS_RE = new RegExp(
    SPECIAL_CHARACTERS.split("")
      .map(e => `\\${e}`)
      .join("|"),
    "gm",
  );
  const SIGNATURES_RE = new RegExp(
    `${escapeRegExp(
      SIGN_HOST,
    )}\\/v\\/\\?a=(.)&(?:amp;)?b=(.)&(?:amp;)?c=(\\d+)&(?:amp;)?s=([a-zA-Z0-9\\_\\-\\=%]*)`,
    "gm",
  );

  function stripContent(content: string) {
    return content.replace(SPECIAL_CHARACTERS_RE, "").trim();
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

  function findSignatureElements(nodes: NodeList) {
    const signatureElements = new Map<string, HTMLElement>();
    for (const node of nodes) {
      const element = node as HTMLElement;

      const signatureMatches = Array.from(unescape(element.outerHTML).matchAll(SIGNATURES_RE));
      if (!signatureMatches.length) continue;

      for (const signatureMatch of signatureMatches) {
        const signature = unescape(signatureMatch[4]);
        const existingElement = signatureElements.get(signature);

        if (existingElement && !existingElement.contains(element)) continue;

        signatureElements.set(signature, element);
      }
    }
    return signatureElements;
  }

  async function verifySignatures(state: State, documentContent: string, nodes: NodeList) {
    const signatureElements = findSignatureElements(nodes);
    const strippedContent = stripContent(documentContent);

    for (const signatureElement of signatureElements.values()) {
      const signatureMatches = unescape(signatureElement.outerHTML).matchAll(SIGNATURES_RE);

      for (const signatureMatch of signatureMatches) {
        const signatureUrl = signatureMatch[0];
        const a = signatureMatch[1];
        const b = signatureMatch[2];
        const c = parseInt(signatureMatch[3]);
        const signature = unescape(signatureMatch[4]);
        let verification;

        if (c === 1) {
          const content = a;
          verification = await verifySignature(state, content, signature);
        } else if (c === 2) {
          const content = `${a}${b}`;
          verification = await verifySignature(state, content, signature);
        } else {
          const contentRe = new RegExp(
            `(?=(${escapeRegExp(a)}[\\s\\S]{${c - 2}}${escapeRegExp(b)}))`,
            "gm",
          );
          const contentMatches = Array.from(strippedContent.matchAll(contentRe));
          for (const contentMatch of contentMatches) {
            const content = contentMatch[1];
            verification = await verifySignature(state, content, signature);
            if (verification && verification.verified) {
              break;
            }
          }
        }

        if (verification && verification.datetime) {
          signatureElement.innerHTML = `<a href=${signatureUrl}>Signed by Jared on ${new Date(
            verification.datetime,
          ).toLocaleString("en-US")}</a>`;
        }
      }
    }
  }

  function getActiveContent() {
    return (
      (document.activeElement as HTMLInputElement).value ||
      (document.activeElement as HTMLElement).innerText
    );
  }

  function findContentElement(parent: HTMLElement, content: string) {
    const reverse = (str: string) =>
      str
        .split("")
        .reverse()
        .join("");

    if (!parent.childElementCount) return parent;

    const reversedContent = reverse(content);

    let contentElement = parent;
    for (const node of parent.querySelectorAll("*")) {
      const element = node as HTMLElement;
      if (element.textContent) {
        const reversedElementContent = reverse(element.textContent);

        if (reversedElementContent && reversedContent.search(reversedElementContent) === 0) {
          if (contentElement && !contentElement.contains(element)) continue;

          contentElement = element;
        }
      }
    }

    return contentElement;
  }

  function writeActiveSignature(signedContent: string, signature: string) {
    const activeElement = document.activeElement;
    if (!activeElement) return;

    const content = getActiveContent();

    const contentElement = findContentElement(activeElement as HTMLElement, content);

    const signatureUrl = formatSignature(signedContent, signature);

    if ((contentElement as HTMLInputElement).value) {
      (contentElement as HTMLInputElement).value += `\n\n${signatureUrl}`;
    } else {
      contentElement.textContent += `\n\n${signatureUrl}`;
      activeElement.dispatchEvent(new Event("input", { bubbles: true }));
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
})().catch(console.error);
