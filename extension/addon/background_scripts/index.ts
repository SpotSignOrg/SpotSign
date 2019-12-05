const signerPkg = import("signer/pkg");

import { GET_KEYS, SEND_KEYS, SIGN_CONTENT, CONTENT_SIGNED } from "addon/lib/messages";

signerPkg.then(signer => {
  browser.runtime.onMessage.addListener(message => {
    console.log("received message in background:", message);

    switch (message.message) {
      case GET_KEYS:
        const keys = signer.get_keys();
        console.log("background sending keys", keys);
        browser.runtime.sendMessage({
          message: SEND_KEYS,
          keys,
        });
        break;
      case SIGN_CONTENT:
        const { content, privateKey, publicKey } = message;
        const datetime = new Date().toISOString();
        const signature = signer.sign_message(privateKey, publicKey, content, datetime).signature;
        console.log("Signed:", signature);
        browser.runtime.sendMessage({
          message: CONTENT_SIGNED,
          signature,
        });
        break;
    }
  });
});
