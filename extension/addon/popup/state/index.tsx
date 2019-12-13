import * as React from "react";

import {
  listen,
  sendToContent,
  sendToBackground,
  MessageType,
  MessageTarget,
  MessageToPopup,
} from "addon/lib/messages";

import { assertNever } from "addon/lib/never";

const initialState = {
  keys: { privateKey: "No Private Key", publicKey: "No Public Key" },
  content: "No Content",
  signature: "No Signature",
};

export const StateContext = React.createContext({
  state: initialState,
  getKeys: () => {},
  getContent: () => {},
  getSignature: () => {},
});

export const StateProvider: React.FunctionComponent = ({ children }) => {
  const [state, setState] = React.useState(initialState);

  const getContent = () =>
    sendToContent({ type: MessageType.GET_CONTENT, sender: MessageTarget.POPUP });

  const getKeys = () =>
    sendToBackground({ type: MessageType.GET_KEYS, sender: MessageTarget.POPUP });

  const getSignature = () =>
    sendToBackground({
      type: MessageType.GET_SIGNATURE,
      sender: MessageTarget.POPUP,
      content: state.content,
      privateKey: state.keys.privateKey,
      publicKey: state.keys.publicKey,
    });

  React.useEffect(() => {
    console.log("creating listener");
    listen(MessageTarget.POPUP, (message: MessageToPopup) => {
      switch (message.type) {
        case MessageType.SEND_KEYS:
          setState({
            ...state,
            keys: {
              privateKey: message.keys.private_key,
              publicKey: message.keys.public_key,
            },
          });
          break;
        case MessageType.SEND_CONTENT:
          setState({
            ...state,
            content: message.content,
          });
          break;
        case MessageType.SEND_SIGNATURE:
          setState({
            ...state,
            signature: message.signature,
          });
          break;
        default:
          assertNever(message);
      }
    });
  });

  return (
    <StateContext.Provider value={{ state, getKeys, getContent, getSignature }}>
      {children}
    </StateContext.Provider>
  );
};

export const useState = () => React.useContext(StateContext);
