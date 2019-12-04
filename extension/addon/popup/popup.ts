import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import { GET_KEYS, SEND_KEYS, POPUP_GET_CONTENT, CONTENT_SEND_CONTENT, SIGN_CONTENT, CONTENT_SIGNED } from 'addon/lib/messages';

function sendToContent(message){    
  browser.tabs.query({
    currentWindow: true,
    active: true
  }).then(tabs => {
    for (const tab of tabs) {
      console.log("sending message from popup", message, "to tab", tab.id);
      browser.tabs.sendMessage(
        tab.id,
        message
      );
    }
  }).catch(console.log);
}

document.getElementById("generate").addEventListener("click", e => {
  const message = {
    message: GET_KEYS,
  };
  console.log("sending message from popup", message);
  browser.runtime.sendMessage(message);
});

document.getElementById("fetch-content").addEventListener("click", e => {
  const message = {
    message: POPUP_GET_CONTENT,
  };
  sendToContent(message);
});

document.getElementById("sign").addEventListener("click", e => {
  const content = (<HTMLInputElement>document.getElementById("message")).value;
  const privateKey = (<HTMLInputElement>document.getElementById("privatekey")).value;
  const publicKey = (<HTMLInputElement>document.getElementById("publickey")).value;
  const message = {
    message: SIGN_CONTENT,
    content,
    privateKey,
    publicKey
  };
  console.log("sending message from popup", message);
  browser.runtime.sendMessage(message);
})

browser.runtime.onMessage.addListener(message => {
  console.log("received message in popup", message);

  switch (message.message) {
    case SEND_KEYS:
      console.log("received keys in popup", message.keys);
      (<HTMLInputElement>document.getElementById("privatekey")).value = message.keys.private_key;
      (<HTMLInputElement>document.getElementById("publickey")).value = message.keys.public_key;
      break;
    case CONTENT_SEND_CONTENT:
      console.log("received content in popup", message.content);
      (<HTMLInputElement>document.getElementById("message")).value = message.content;
      break;
    case CONTENT_SIGNED:
      console.log("received signature in popup", message.signature);
      (<HTMLInputElement>document.getElementById("signature")).value = message.signature;
      break;
  }
});