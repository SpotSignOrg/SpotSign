const rust = import('../../../signer/pkg');


const MSG_GET_CONTENT = "getContent";
const MSG_SEND_CONTENT = "sendContent";


rust
  .then(signer => {
    browser.runtime.onMessage.addListener((message) => {
      console.log("received message in background:", message);

      const keys = signer.get_keys();
      console.log("Generated keys", keys);

      const datetime = new Date().toISOString();

      const signature = signer.sign_message(keys.private_key, keys.public_key, message.content, datetime);

      console.log("Signed:", signature);
    });
  });