const signerPkg = import('signer/pkg');
const messages = import('addon/lib/messages');

signerPkg
  .then(signer => {
    messages.then(({GET_KEYS, SEND_KEYS}) => {
      browser.runtime.onMessage.addListener(message => {
        console.log("received message in background:", message);

        switch (message.message) {
          case GET_KEYS:
            const keys = signer.get_keys();
            console.log("Generated keys", keys);
            browser.runtime.sendMessage({
              message: SEND_KEYS,
              keys
            })
            break;

          // case SIGN_CONTENT:
          //   const datetime = new Date().toISOString();
          //   const signature = signer.sign_message(keys.private_key, keys.public_key, message.content, datetime);
          //   console.log("Signed:", signature);
          //   break;
        }
      });
    })
  });