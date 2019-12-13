import * as React from "react";

import {
  listen,
  sendToBackground,
  MessageType,
  MessageTarget,
  MessageToPopup,
} from "addon/lib/messages";

export interface Keys {
  privateKey: string;
  publicKey: string;
}

export enum KeyActions {
  GET_KEYS = "getKeys",
  SEND_KEYS = "sendKeys",
}

export interface GetKeysAction {
  type: KeyActions.GET_KEYS;
}

export interface SendKeysAction {
  type: KeyActions.SEND_KEYS;
  keys: Keys;
}

export type KeysAction = GetKeysAction | SendKeysAction;

const initialKeys: Keys = {
  privateKey: "No Private Key",
  publicKey: "No Public Key",
};

const reducer = (state: Keys, action: KeysAction) => {
  switch (action.type) {
    case KeyActions.GET_KEYS:
      console.log("get keys action");
      sendToBackground({
        type: MessageType.GET_KEYS,
        sender: MessageTarget.POPUP,
      });
      return state;
    case KeyActions.SEND_KEYS:
      console.log("send keys action");
      return action.keys;
    default:
      return state;
  }
};

export const KeysContext = React.createContext([initialKeys, (action: KeysAction) => action] as [
  Keys,
  React.Dispatch<KeysAction>,
]);

export const KeysProvider: React.FunctionComponent = ({ children }) => {
  const [keys, keysDispatch] = React.useReducer(reducer, initialKeys);

  React.useEffect(() => {
    listen(MessageTarget.POPUP, (message: MessageToPopup) => {
      if (message.type === MessageType.SEND_KEYS) {
        keysDispatch({
          type: KeyActions.SEND_KEYS,
          keys: {
            privateKey: message.keys.private_key,
            publicKey: message.keys.public_key,
          },
        });
      }
    });
  });

  return <KeysContext.Provider value={[keys, keysDispatch]}>{children}</KeysContext.Provider>;
};

export const useKeys = () => React.useContext(KeysContext);
