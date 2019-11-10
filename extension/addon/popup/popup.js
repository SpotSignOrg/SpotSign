import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import { GET_KEYS, SEND_KEYS } from 'addon/lib/messages';

document.getElementById("generate").addEventListener("click", e => {
  const message = {
    message: GET_KEYS,
  };
  console.log("sending message from popup", message);
  browser.runtime.sendMessage(message);
});

browser.runtime.onMessage.addListener(message => {
  console.log("received message in popup", message);
  
  switch(message.message) {
    case SEND_KEYS:
      console.log("received keys in popup", message.keys);
      document.getElementById("privatekey").value = message.keys.private_key;
      document.getElementById("publickey").value = message.keys.public_key;
      break;
  }
});