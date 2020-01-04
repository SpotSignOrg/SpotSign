import * as Util from "addon/content/util";
import { stripContent, diffContent } from "addon/content/strip";

export const getActiveContent = () => {
  return (
    (document.activeElement as HTMLInputElement).value ||
    (document.activeElement as HTMLElement).innerText
  );
};

const findContentElement = (parent: HTMLElement, content: string) => {
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
};

const formatMarkdown = (signatureUrl: string) => {
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
};

const formatSignature = (
  signedContent: string,
  diff: string,
  signature: string,
  publicKey: string,
) => {
  const strippedContent = stripContent(signedContent);
  const a = strippedContent[0];
  const b = strippedContent[strippedContent.length - 1];
  const c = strippedContent.length - 2;
  const d = diff;
  const s = signature;
  const k = publicKey;
  const url = `${Util.SIGN_HOST}/v/?a=${a}&b=${b}&c=${c}&d=${d}&s=${s}&k=${k}`;
  return `\n\n${formatMarkdown(url)}`;
};

export const writeActiveSignature = (
  signedContent: string,
  signature: string,
  publicKey: string,
) => {
  const activeElement = document.activeElement;
  if (!activeElement) return;

  const diff = diffContent(signedContent);
  const contentElement = findContentElement(activeElement as HTMLElement, signedContent);
  const signatureUrl = formatSignature(signedContent, diff, signature, publicKey);

  if ((contentElement as HTMLInputElement).value) {
    (contentElement as HTMLInputElement).value += signatureUrl;
  } else {
    contentElement.textContent += signatureUrl;
    activeElement.dispatchEvent(new Event("input", { bubbles: true }));
  }
};
