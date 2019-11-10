import { GET_CONTENT, SEND_CONTENT } from 'addon/lib/messages';

(function() {
  /**
   * Check and set a global guard variable.
   * If this content script is injected into the same page again,
   * it will do nothing next time.
   */
  if (window.hasRun) {
    return;
  }
  window.hasRun = true;

  function getActiveContent() {
    const element = document.activeElement;
    console.log("Active element:", element);
    const content = document.activeElement.value || document.activeElement.innerText;
    console.log("Found content:", content);
    return content;
  }

  browser.runtime.onMessage.addListener((message) => {
    console.log("received message in content", message);
    if (message.message === GET_CONTENT) {
      const content = getActiveContent();
      const response = {
        message: SEND_CONTENT,
        content
      };
      console.log("sending message in content", response);
      browser.runtime.sendMessage(response);
    };
  });
})();
