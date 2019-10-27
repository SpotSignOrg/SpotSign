import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const rust = import('./pkg');

rust
  .then(m => {
      let keys = m.get_keys();
      console.log(keys);
      document.getElementById("privatekey").value = keys.private_key;
      document.getElementById("publickey").value = keys.public_key;
      document.getElementById("sign").addEventListener("click", e => {
          let message = document.getElementById("message").value;
          let signature = m.sign_message(keys.private_key, keys.public_key, message);
          document.getElementById("signature").value = signature.signature;

      })

  })
  .catch(console.error);