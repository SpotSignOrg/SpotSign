import { POPUP_GET_CONTENT, CONTENT_SEND_CONTENT } from 'addon/lib/messages';

declare global {
  interface Window {
    hasRun:any;
  }
  const browser:any;
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

  const message = {
    message: "content alive!",
  };
  console.log("sending message from content", message);
  browser.runtime.sendMessage(message);

  function getActiveContent() {
    const element = document.activeElement;
    console.log("Active element:", element);
    const content = (<HTMLInputElement>document.activeElement).value || (<HTMLElement>document.activeElement).innerText;
    console.log("Found content:", content);
    return content;
  }

  console.log("content listening");
  browser.runtime.onMessage.addListener(message => {
    console.log("received message in content", message);
    if (message.message === POPUP_GET_CONTENT) {
      const content = getActiveContent();
      const message = {
        message: CONTENT_SEND_CONTENT,
        content
      };
      console.log("sending message in content", message);
      browser.runtime.sendMessage(message);
    };
  });
})();
