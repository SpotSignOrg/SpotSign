import { assertNever } from "addon/lib/never";
import {
  listen,
  MessageTarget,
  MessageToBackground,
  MessageType,
  sendToContent,
  VerificationFailReason,
} from "addon/lib/messages";
import signer from "addon/lib/sign";

const KEYS = new Map<string, CryptoKeyPair>();

(async () => {
  const getContent = async () => {
    const responses = await sendToContent({
      type: MessageType.GET_CONTENT,
      sender: MessageTarget.BACKGROUND,
    });
    for (const response of responses) {
      if (response.type === MessageType.SEND_CONTENT) {
        return response.content;
      }
    }
    return;
  };

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

      case MessageType.SIGN_CONTENT: {
        const keyPair = KEYS.get(message.publicKey);
        const content = await getContent();

        if (keyPair && content) {
          const signature = (await signer.signMessage(keyPair.privateKey, content)).signature;

          await sendToContent({
            type: MessageType.WRITE_SIGNATURE,
            sender: MessageTarget.BACKGROUND,
            content: content,
            signature: signature,
            publicKey: message.publicKey,
          });

          return {
            type: MessageType.CONTENT_SIGNED_SUCCESS,
            sender: MessageTarget.BACKGROUND,
          };
        }

        return {
          type: MessageType.CONTENT_SIGNED_FAIL,
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
