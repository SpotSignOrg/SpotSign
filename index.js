import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import { toUtf32, fromUtf32 } from './encode';

const rust = import('./pkg');

rust
  .then(m => {
    document.getElementById("generate").addEventListener("click", e => {
      const keys = m.get_keys();
      console.log(keys);
      document.getElementById("privatekey").value = keys.private_key;
      document.getElementById("publickey").value = keys.public_key;
    })
    document.getElementById("sign").addEventListener("click", e => {
      const private_key = document.getElementById("privatekey").value;
      const public_key = document.getElementById("publickey").value;
      const message = document.getElementById("message").value;
      const datetime = new Date().toISOString();

      const signature = m.sign_message(private_key, public_key, message, datetime);

      console.log(signature);
      // document.getElementById("signature").value = signature.signature;
      document.getElementById("signature").value = toUtf32(signature.signature);

    })
    document.getElementById("verify").addEventListener("click", e => {
      const author = document.getElementById("author").value;
      const message = document.getElementById("message").value;
      const public_key = document.getElementById("publickey").value;
      // const signature = document.getElementById("signature").value;
      const signature = fromUtf32(document.getElementById("signature").value);

      const verification = m.verify_message(public_key, signature, message);
      if (verification.error) {
        document.getElementById("verification").innerHTML = verification.error;
      } else if (verification.verified) {
        document.getElementById("verification").innerHTML = `Signed by ${author} on ${verification.datetime}`;
      } else {
        document.getElementById("verification").innerHTML = `Signature verification failed: ${verification.error}`;

      }
    })
  })
  .catch(console.error);