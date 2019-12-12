const signerPkg = import("signer/pkg");

import { assertNever } from "addon/lib/never";
import {
  MessageTarget,
  MessageType,
  MessageToBackground,
  sendToPopup,
  listen,
} from "addon/lib/messages";
import { Keys, Signature } from "addon/signer";

(async () => {
  const signer = await signerPkg;
  listen(MessageTarget.BACKGROUND, (message: MessageToBackground) => {
    switch (message.type) {
      case MessageType.GET_KEYS:
        sendToPopup({
          type: MessageType.SEND_KEYS,
          sender: MessageTarget.BACKGROUND,
          keys: signer.get_keys() as Keys,
        });
        break;
      case MessageType.SIGN_CONTENT:
        sendToPopup({
          type: MessageType.CONTENT_SIGNED,
          sender: MessageTarget.BACKGROUND,
          signature: (signer.sign_message(
            message.privateKey,
            message.publicKey,
            message.content,
            new Date().toISOString(),
          ) as Signature).signature,
        });
        break;
      default:
        assertNever(message);
    }
  });
})();
