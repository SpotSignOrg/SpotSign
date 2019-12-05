import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import {
  GET_KEYS,
  SEND_KEYS,
  POPUP_GET_CONTENT,
  CONTENT_SEND_CONTENT,
  SIGN_CONTENT,
  CONTENT_SIGNED,
} from "addon/lib/messages";

function sendToContent(message): void {
  browser.tabs
    .query({
      currentWindow: true,
      active: true,
    })
    .then(tabs => {
      for (const tab of tabs) {
        console.log("sending message from popup", message, "to tab", tab.id);
        browser.tabs.sendMessage(tab.id, message);
      }
    })
    .catch(console.log);
}

document.getElementById("generate").addEventListener("click", () => {
  const message = {
    message: GET_KEYS,
  };
  console.log("sending message from popup", message);
  browser.runtime.sendMessage(message);
});

document.getElementById("fetch-content").addEventListener("click", () => {
  const message = {
    message: POPUP_GET_CONTENT,
  };
  sendToContent(message);
});

document.getElementById("sign").addEventListener("click", () => {
  const content = (document.getElementById("message") as HTMLInputElement).value;
  const privateKey = (document.getElementById("privatekey") as HTMLInputElement).value;
  const publicKey = (document.getElementById("publickey") as HTMLInputElement).value;
  const message = {
    message: SIGN_CONTENT,
    content,
    privateKey,
    publicKey,
  };
  console.log("sending message from popup", message);
  browser.runtime.sendMessage(message);
});

browser.runtime.onMessage.addListener(message => {
  console.log("received message in popup", message);

  switch (message.message) {
    case SEND_KEYS:
      console.log("received keys in popup", message.keys);
      (document.getElementById("privatekey") as HTMLInputElement).value = message.keys.private_key;
      (document.getElementById("publickey") as HTMLInputElement).value = message.keys.public_key;
      break;
    case CONTENT_SEND_CONTENT:
      console.log("received content in popup", message.content);
      (document.getElementById("message") as HTMLInputElement).value = message.content;
      break;
    case CONTENT_SIGNED:
      console.log("received signature in popup", message.signature);
      (document.getElementById("signature") as HTMLInputElement).value = message.signature;
      break;
  }
});
