import { assertNever } from "addon/lib/never";
import {
  MessageTarget,
  MessageType,
  MessageToBackground,
  listen,
  VerificationFailReason,
} from "addon/lib/messages";
import signer from "addon/lib/sign";

const KEYS = new Map<string, CryptoKeyPair>();

(async () => {
  listen(MessageTarget.BACKGROUND, async (message: MessageToBackground) => {
    switch (message.type) {
      case MessageType.GET_KEYS: {
        const keys = await signer.getKeys();
        KEYS.set(keys.publicKey, keys.keyPair);

        return {
          type: MessageType.SEND_KEYS,
          sender: MessageTarget.BACKGROUND,
          publicKey: keys.publicKey,
        };
      }

      case MessageType.GET_SIGNATURE: {
        const keyPair = KEYS.get(message.publicKey);

        if (keyPair) {
          const signature = (await signer.signMessage(keyPair.privateKey, message.content))
            .signature;
          return {
            type: MessageType.SEND_SIGNATURE_SUCCESS,
            sender: MessageTarget.BACKGROUND,
            signature,
          };
        }
        return {
          type: MessageType.SEND_SIGNATURE_FAIL,
          sender: MessageTarget.BACKGROUND,
        };
      }

      case MessageType.GET_VERIFICATION: {
        const keyPair = KEYS.get(message.publicKey);

        if (keyPair) {
          const verification = await signer.verifyMessage(
            keyPair.publicKey,
            message.signature,
            message.content,
          );

          if (verification.verified) {
            return {
              type: MessageType.SEND_VERIFICATION_SUCCESS,
              sender: MessageTarget.BACKGROUND,
              datetime: verification.datetime,
            };
          } else {
            return {
              type: MessageType.SEND_VERIFICATION_FAIL,
              sender: MessageTarget.BACKGROUND,
              reason: VerificationFailReason.INVALID_SIGNATURE,
            };
          }
        } else {
          return {
            type: MessageType.SEND_VERIFICATION_FAIL,
            sender: MessageTarget.BACKGROUND,
            reason: VerificationFailReason.KEYS_NOT_FOUND,
          };
        }
      }

      default:
        return assertNever(message);
    }
  });
})();
