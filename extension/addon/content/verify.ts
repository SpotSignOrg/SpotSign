import { MessageTarget, MessageType, sendToBackground } from "addon/lib/messages";
import * as Util from "addon/content/util";
import { stripContent, undiffContent } from "addon/content/strip";

const verifySignature = async (content: string, signature: string, publicKey: string) => {
  const response = await sendToBackground({
    type: MessageType.GET_VERIFICATION,
    sender: MessageTarget.CONTENT,
    publicKey: publicKey,
    content,
    signature,
  });

  if (response.type === MessageType.SEND_VERIFICATION_SUCCESS) {
    return response;
  }
  return;
};

const findSignatureElements = (nodes: NodeList) => {
  const signaturesElements = new Map<string, Set<HTMLElement>>();

  for (const node of nodes) {
    const element = node as HTMLElement;

    const signatureMatches = Array.from(element.outerHTML.matchAll(Util.SIGNATURES_RE));
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
};

export const verifySignatures = async (documentContent: string, nodes: NodeList) => {
  const signaturesElements = findSignatureElements(nodes);
  const strippedContent = stripContent(documentContent);

  for (const [signatureUrl, signatureElements] of signaturesElements.entries()) {
    const signatureMatches = Array.from(signatureUrl.matchAll(Util.SIGNATURES_RE));

    for (const signatureMatch of signatureMatches) {
      const a = signatureMatch[1];
      const b = signatureMatch[2];
      const c = parseInt(signatureMatch[3]);
      const diff = unescape(signatureMatch[4]);
      const signature = unescape(signatureMatch[5]);
      const publicKey = unescape(signatureMatch[6]);
      let verification;

      const contentRe = new RegExp(
        `(?=(${Util.escapeRegExp(a)}[\\s\\S]{${c - 2}}${Util.escapeRegExp(b)}))`,
        "gm",
      );

      const contentMatches = Array.from(strippedContent.matchAll(contentRe));

      for (const contentMatch of contentMatches) {
        const strippedContent = contentMatch[1];
        const content = undiffContent(strippedContent, diff);
        verification = await verifySignature(content, signature, publicKey);
        if (verification) {
          break;
        }
      }

      for (const signatureElement of signatureElements) {
        if (verification) {
          signatureElement.innerHTML = `<a href=${signatureUrl}>✅ Signed by ${
            verification.author
          } on ${new Date(verification.datetime).toLocaleString("en-US")}</a>`;
        } else {
          signatureElement.innerHTML = "❗️" + signatureElement.innerHTML;
        }
      }
    }
  }
};

export const observeDOM = () => {
  const observer = new MutationObserver(mutationsList => {
    for (const mutation of mutationsList) {
      for (const node of mutation.addedNodes) {
        const elements = (node as Element).querySelectorAll("*");
        if (elements.length) {
          verifySignatures(document.body.innerText, elements);
        }
      }
    }
  });

  // Start observing the target node for configured mutations
  observer.observe(document.body, { childList: true, subtree: true });
};
