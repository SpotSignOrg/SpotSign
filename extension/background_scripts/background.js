const MSG_GET_CONTENT = "getContent";
const MSG_SEND_CONTENT = "sendContent";

browser.runtime.onMessage.addListener((message) => {
  console.log("received message in background:", message);
});