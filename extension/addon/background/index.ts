const signerPkg = import("signer/pkg");

import { assertNever } from "addon/lib/never";
import { MessageTarget, MessageType, MessageToBackground, listen } from "addon/lib/messages";
import { Keys, Signature, Verification } from "addon/signer";

(async () => {
  const signer = await signerPkg;
  listen(MessageTarget.BACKGROUND, (message: MessageToBackground) => {
    switch (message.type) {
      case MessageType.GET_KEYS:
        return {
          type: MessageType.SEND_KEYS,
          sender: MessageTarget.BACKGROUND,
          keys: signer.get_keys() as Keys,
        };
      case MessageType.GET_SIGNATURE:
        return {
          type: MessageType.SEND_SIGNATURE,
          sender: MessageTarget.BACKGROUND,
          signature: (signer.sign_message(
            message.privateKey,
            message.publicKey,
            message.content,
            new Date().toISOString(),
          ) as Signature).signature,
        };
      case MessageType.GET_VERIFICATION:
        return {
          type: MessageType.SEND_VERIFICATION,
          sender: MessageTarget.BACKGROUND,
          verification: signer.verify_message(
            message.publicKey,
            message.signature,
            message.content,
          ) as Verification,
        };
      default:
        return assertNever(message);
    }
  });
})();
