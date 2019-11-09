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

  const MSG_GET_CONTENT = "getContent";
  const MSG_SEND_CONTENT = "sendContent";

  function getActiveContent() {
    return document.activeElement.value;
  }

  browser.runtime.onMessage.addListener((message) => {
    console.log("received message", message);
    if (message.command === MSG_GET_CONTENT) {
      const content = getActiveContent();
      console.log("sending content", content);
      browser.runtime.sendMessage({
        command: MSG_SEND_CONTENT,
        content
      })
    };
  });
})();
