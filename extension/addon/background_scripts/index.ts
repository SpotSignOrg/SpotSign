const signerPkg = import("signer/pkg");

import { assertNever } from "addon/lib/never";
import { MessageType, MessageToBackground, sendToPopup } from "addon/lib/messages";
import { Keys } from "addon/signer";

signerPkg.then(signer => {
  browser.runtime.onMessage.addListener((message: MessageToBackground) => {
    console.log("received message in background:", message);

    switch (message.type) {
      case MessageType.GET_KEYS:
        const keys = signer.get_keys() as Keys;
        console.log("background sending keys", keys);
        sendToPopup({
          type: MessageType.SEND_KEYS,
          keys,
        });
        break;
      case MessageType.SIGN_CONTENT:
        const { content, privateKey, publicKey } = message;
        const datetime = new Date().toISOString();
        const signature = signer.sign_message(privateKey, publicKey, content, datetime).signature;
        console.log("Signed:", signature);
        sendToPopup({
          type: MessageType.CONTENT_SIGNED,
          signature,
        });
        break;
      default:
        assertNever(message);
    }
  });
});
