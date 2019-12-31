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
  const BASE64_RE = "[a-zA-Z0-9\\_\\-%]*";
  const AMP_RE = "&(?:amp;)?";
  const SIGNATURES_RE = new RegExp(
    `${escapeRegExp(
      SIGN_HOST,
    )}\\/v\\/\\?a=(.)${AMP_RE}b=(.)${AMP_RE}c=(\\d+)${AMP_RE}s=(${BASE64_RE})${AMP_RE}k=(${BASE64_RE})`,
    "gm",
  );

  function stripContent(content: string) {
    return content.replace(SPECIAL_CHARACTERS_RE, "").trim();
  }

  function getAuthor(state: State, publicKey: string) {
    for (const identity of state.identities) {
      if (identity.publicKey === publicKey) return identity.name;
    }
    return;
  }

  async function verifySignature(
    state: State,
    content: string,
    signature: string,
    publicKey: string,
  ) {
    console.log("verifying signature", signature);
    const response = await sendToBackground({
      type: MessageType.GET_VERIFICATION,
      sender: MessageTarget.CONTENT,
      publicKey: publicKey,
      content,
      signature,
    });

    const verification = {
      verified: false,
      datetime: "",
      author: "",
    };

    if (response.type === MessageType.SEND_VERIFICATION_SUCCESS) {
      verification.verified = true;
      verification.datetime = response.datetime;

      const author = getAuthor(state, publicKey);

      if (author) {
        verification.author = author;
      }
    }
    return verification;
  }

  function findSignatureElements(nodes: NodeList) {
    const signaturesElements = new Map<string, Set<HTMLElement>>();

    for (const node of nodes) {
      const element = node as HTMLElement;

      const signatureMatches = Array.from(element.outerHTML.matchAll(SIGNATURES_RE));
      for (const signatureMatch of signatureMatches) {
        const signatureUrl = signatureMatch[0];
        let existingElements = signaturesElements.get(signatureUrl);

        if (!existingElements) {
          existingElements = new Set();
          signaturesElements.set(signatureUrl, existingElements);
        }

        existingElements.add(element);

        for (const existingElement of existingElements) {
          if (existingElement.contains(element) && element !== existingElement) {
            existingElements.delete(existingElement);
          }
        }
      }
    }
    return signaturesElements;
  }

  async function verifySignatures(state: State, documentContent: string, nodes: NodeList) {
    const signaturesElements = findSignatureElements(nodes);
    const strippedContent = stripContent(documentContent);

    for (const [signatureUrl, signatureElements] of signaturesElements.entries()) {
      const signatureMatches = Array.from(signatureUrl.matchAll(SIGNATURES_RE));

      for (const signatureMatch of signatureMatches) {
        const a = signatureMatch[1];
        const b = signatureMatch[2];
        const c = parseInt(signatureMatch[3]);
        const signature = unescape(signatureMatch[4]);
        const publicKey = unescape(signatureMatch[5]);
        let verification;

        if (c === 1) {
          const content = a;
          verification = await verifySignature(state, content, signature, publicKey);
        } else if (c === 2) {
          const content = `${a}${b}`;
          verification = await verifySignature(state, content, signature, publicKey);
        } else {
          const contentRe = new RegExp(
            `(?=(${escapeRegExp(a)}[\\s\\S]{${c - 2}}${escapeRegExp(b)}))`,
            "gm",
          );
          const contentMatches = Array.from(strippedContent.matchAll(contentRe));
          for (const contentMatch of contentMatches) {
            const content = contentMatch[1];
            verification = await verifySignature(state, content, signature, publicKey);
            if (verification && verification.verified) {
              break;
            }
          }
        }

        if (verification && verification.datetime && verification.author) {
          for (const signatureElement of signatureElements) {
            signatureElement.innerHTML = `<a href=${signatureUrl}>✅ Signed by ${
              verification.author
            } on ${new Date(verification.datetime).toLocaleString("en-US")}</a>`;
          }
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

  function formatMarkdown(signatureUrl: string) {
    const markdownDomains = ["reddit.com", "github.com"];

    let hasMarkdown = false;
    for (const markdownDomain of markdownDomains) {
      if (window.location.host.search(markdownDomain) > -1) {
        hasMarkdown = true;
      }
    }

    if (hasMarkdown) {
      return `[Verify Signature](${signatureUrl})`;
    }
    return signatureUrl;
  }

  function formatSignature(content: string, signature: string, publicKey: string) {
    const a = content[0];
    const b = content[content.length - 1];
    const c = content.length;
    const s = encodeURIComponent(signature);
    const k = encodeURIComponent(publicKey);
    const url = `${SIGN_HOST}/v/?a=${a}&b=${b}&c=${c}&s=${s}&k=${k}`;
    return `\n\n${formatMarkdown(url)}`;
  }

  function writeActiveSignature(signedContent: string, signature: string, publicKey: string) {
    const activeElement = document.activeElement;
    if (!activeElement) return;

    const content = getActiveContent();

    const contentElement = findContentElement(activeElement as HTMLElement, content);

    const signatureUrl = formatSignature(signedContent, signature, publicKey);

    if ((contentElement as HTMLInputElement).value) {
      (contentElement as HTMLInputElement).value += signatureUrl;
    } else {
      contentElement.textContent += signatureUrl;
      activeElement.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }

  function setupListener() {
    listen(MessageTarget.CONTENT, async (message: MessageToContent) => {
      switch (message.type) {
        case MessageType.GET_CONTENT:
          return {
            type: MessageType.SEND_CONTENT,
            sender: MessageTarget.CONTENT,
            content: stripContent(getActiveContent()),
          };
        case MessageType.WRITE_SIGNATURE:
          return writeActiveSignature(message.content, message.signature, message.publicKey);
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
