import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import { GET_KEYS, SEND_KEYS, POPUP_GET_CONTENT, CONTENT_SEND_CONTENT } from 'addon/lib/messages';

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

  function onError(error) {
    console.error(`Error: ${error}`);
  }
    
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
  }).catch(onError);

});

browser.runtime.onMessage.addListener(message => {
  console.log("received message in popup", message);

  switch (message.message) {
    case SEND_KEYS:
      console.log("received keys in popup", message.keys);
      document.getElementById("privatekey").value = message.keys.private_key;
      document.getElementById("publickey").value = message.keys.public_key;
      break;
    case CONTENT_SEND_CONTENT:
      console.log("received content in popup", message.content);
      document.getElementById("message").value = message.content;
      break;
  }
});