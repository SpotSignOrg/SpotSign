import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import { MessageType, MessageToPopup, sendToContent, sendToBackground } from "addon/lib/messages";

document.getElementById("generate").addEventListener("click", () => {
  sendToBackground({
    type: MessageType.GET_KEYS,
  });
});

document.getElementById("fetch-content").addEventListener("click", () => {
  sendToContent({
    type: MessageType.GET_CONTENT,
  });
});

document.getElementById("sign").addEventListener("click", () => {
  const content = (document.getElementById("message") as HTMLInputElement).value;
  const privateKey = (document.getElementById("privatekey") as HTMLInputElement).value;
  const publicKey = (document.getElementById("publickey") as HTMLInputElement).value;
  sendToBackground({
    type: MessageType.SIGN_CONTENT,
    content,
    privateKey,
    publicKey,
  });
});

browser.runtime.onMessage.addListener((message: MessageToPopup) => {
  console.log("received message in popup", message);

  switch (message.type) {
    case MessageType.SEND_KEYS:
      console.log("received keys in popup", message.keys);
      (document.getElementById("privatekey") as HTMLInputElement).value = message.keys.private_key;
      (document.getElementById("publickey") as HTMLInputElement).value = message.keys.public_key;
      break;
    case MessageType.SEND_CONTENT:
      console.log("received content in popup", message.content);
      (document.getElementById("message") as HTMLInputElement).value = message.content;
      break;
    case MessageType.CONTENT_SIGNED:
      console.log("received signature in popup", message.signature);
      (document.getElementById("signature") as HTMLInputElement).value = message.signature;
      break;
  }
});
