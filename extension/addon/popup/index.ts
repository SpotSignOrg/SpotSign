import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import { assertNever } from "addon/lib/never";
import {
  MessageTarget,
  MessageType,
  MessageToPopup,
  sendToContent,
  sendToBackground,
  listen,
} from "addon/lib/messages";

function htmlGet(id: string): string {
  return (document.getElementById(id) as HTMLInputElement).value;
}

function htmlSet(id: string, value: string): void {
  (document.getElementById(id) as HTMLInputElement).value = value;
}

(document.getElementById("generate") as HTMLElement).addEventListener("click", () => {
  sendToBackground({
    type: MessageType.GET_KEYS,
    sender: MessageTarget.POPUP,
  });
});

(document.getElementById("fetch-content") as HTMLElement).addEventListener("click", () => {
  sendToContent({
    type: MessageType.GET_CONTENT,
    sender: MessageTarget.POPUP,
  });
});

const sign = document.getElementById("sign");
if (sign) {
  sign.addEventListener("click", () => {
    sendToBackground({
      type: MessageType.SIGN_CONTENT,
      sender: MessageTarget.POPUP,
      content: htmlGet("message"),
      privateKey: htmlGet("privatekey"),
      publicKey: htmlGet("publickey"),
    });
  });
}

listen(MessageTarget.POPUP, (message: MessageToPopup) => {
  switch (message.type) {
    case MessageType.SEND_KEYS:
      htmlSet("privatekey", message.keys.private_key);
      htmlSet("publickey", message.keys.public_key);
      break;
    case MessageType.SEND_CONTENT:
      htmlSet("message", message.content);
      break;
    case MessageType.CONTENT_SIGNED:
      htmlSet("signature", message.signature);
      break;
    case MessageType.CONTENT_ALIVE:
      break;
    default:
      assertNever(message);
  }
});
