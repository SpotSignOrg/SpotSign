import * as React from "react";

import {
  listen,
  sendToBackground,
  MessageType,
  MessageTarget,
  MessageToPopup,
} from "addon/lib/messages";

const initialKeys = {
  privateKey: "No Private Key",
  publicKey: "No Public Key",
};

export const KeysContext = React.createContext({
  keys: initialKeys,
  getKeys: () => {},
});

export const KeysProvider: React.FunctionComponent = ({ children }) => {
  const [keys, setKeys] = React.useState(initialKeys);

  const getKeys = () =>
    sendToBackground({ type: MessageType.GET_KEYS, sender: MessageTarget.POPUP });

  React.useEffect(() => {
    listen(MessageTarget.POPUP, (message: MessageToPopup) => {
      if (message.type === MessageType.SEND_KEYS) {
        setKeys({ privateKey: message.keys.private_key, publicKey: message.keys.public_key });
      }
    });
  });

  return <KeysContext.Provider value={{ keys, getKeys }}>{children}</KeysContext.Provider>;
};

export const useKeys = () => React.useContext(KeysContext);
