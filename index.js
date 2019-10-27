import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import { toUtf32, fromUtf32 } from './encode';

const rust = import('./pkg');

rust
  .then(m => {
    document.getElementById("generate").addEventListener("click", e => {
      let keys = m.get_keys();
      console.log(keys);
      document.getElementById("privatekey").value = keys.private_key;
      document.getElementById("publickey").value = keys.public_key;
    })
    document.getElementById("sign").addEventListener("click", e => {
      let private_key = document.getElementById("privatekey").value;
      let public_key = document.getElementById("publickey").value;
      let message = document.getElementById("message").value;
      let signature = m.sign_message(private_key, public_key, message);
      console.log(signature);
      document.getElementById("signature").value = toUtf32(signature.signature);
    })
    document.getElementById("verify").addEventListener("click", e => {
      let message = document.getElementById("message").value;
      let public_key = document.getElementById("publickey").value;
      let signature = fromUtf32(document.getElementById("signature").value);
      let verification = m.verify_message(public_key, signature, message);
      document.getElementById("verification").innerHTML = verification.verified;
    })
  })
  .catch(console.error);