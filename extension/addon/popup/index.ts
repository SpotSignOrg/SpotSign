import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import { assertNever } from "addon/lib/never";
import { MessageType, MessageToPopup, sendToContent, sendToBackground, listen } from "addon/lib/messages";

(document.getElementById("generate") as HTMLElement).addEventListener("click", () => {
  sendToBackground({
    type: MessageType.GET_KEYS,
  });
});

(document.getElementById("fetch-content") as HTMLElement).addEventListener("click", () => {
  sendToContent({
    type: MessageType.GET_CONTENT,
  });
});

const sign = document.getElementById("sign");
if (sign) {
  sign.addEventListener("click", () => {
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
}

listen((message: MessageToPopup) => {
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
    case MessageType.CONTENT_ALIVE:
      console.log("received content alive in popup!");
      break;
    default:
      assertNever(message);
  }
});
