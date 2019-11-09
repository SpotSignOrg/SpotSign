const MSG_GET_CONTENT = "getContent";
const MSG_SEND_CONTENT = "sendContent";

/**
 * Listen for clicks on the buttons, and send the appropriate message to
 * the content script in the page.
 */
function listenForClicks() {
  document.addEventListener("click", (e) => {
    console.log("clicked");
    /**
     * Insert the page-hiding CSS into the active tab,
     * then get the beast URL and
     * send a "beastify" message to the content script in the active tab.
     */
    function sendGetContent(tabs) {
      console.log("sending message");
      browser.tabs.sendMessage(tabs[0].id, {
        command: MSG_GET_CONTENT,
      });
    }

    /**
     * Just log the error to the console.
     */
    function reportError(error) {
      console.error(`Could not sign: ${error}`);
    }

    /**
     * Get the active tab,
     */
    browser.tabs.query({active: true, currentWindow: true})
      .then(sendGetContent)
      .catch(reportError);
  });
}

/**
 * There was an error executing the script.
 * Display the popup's error message, and hide the normal UI.
 */
function reportExecuteScriptError(error) {
  console.error(`Failed to execute content script: ${error.message}`);
}

/**
 * When the popup loads, inject a content script into the active tab,
 * and add a click handler.
 * If we couldn't inject the script, handle the error.
 */
browser.tabs.executeScript({file: "/content_scripts/content.js"})
  .then(listenForClicks)
  .catch(reportExecuteScriptError);

browser.runtime.onMessage.addListener((message) => {
  console.log("received message in popup:", message);
});