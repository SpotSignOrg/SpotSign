const signerPkg = import("signer/pkg");

import { assertNever } from "addon/lib/never";
import { MessageType, MessageToBackground, sendToPopup, listen } from "addon/lib/messages";
import { Keys, Signature } from "addon/signer";

signerPkg.then(signer => {
  listen((message: MessageToBackground) => {
    switch (message.type) {
      case MessageType.GET_KEYS:
        const keys = signer.get_keys() as Keys;
        sendToPopup({
          type: MessageType.SEND_KEYS,
          keys,
        });
        break;
      case MessageType.SIGN_CONTENT:
        const { content, privateKey, publicKey } = message;
        const datetime = new Date().toISOString();
        const signature = (signer.sign_message(privateKey, publicKey, content, datetime) as Signature).signature;
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
