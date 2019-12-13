import * as React from "react";

import { sendToContent, sendToBackground, MessageType, MessageTarget } from "addon/lib/messages";

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

  const getKeys = async () => {
    const response = await sendToBackground({
      type: MessageType.GET_KEYS,
      sender: MessageTarget.POPUP,
    });
    if (response.type === MessageType.SEND_KEYS) {
      setState({
        ...state,
        keys: {
          privateKey: response.keys.private_key,
          publicKey: response.keys.public_key,
        },
      });
    }
  };

  const getContent = async () => {
    const responses = await sendToContent({
      type: MessageType.GET_CONTENT,
      sender: MessageTarget.POPUP,
    });
    for (const response of responses) {
      if (response.type === MessageType.SEND_CONTENT) {
        setState({
          ...state,
          content: response.content,
        });
      }
    }
  };

  const getSignature = async () => {
    const response = await sendToBackground({
      type: MessageType.GET_SIGNATURE,
      sender: MessageTarget.POPUP,
      content: state.content,
      privateKey: state.keys.privateKey,
      publicKey: state.keys.publicKey,
    });
    if (response.type === MessageType.SEND_SIGNATURE) {
      setState({
        ...state,
        signature: response.signature,
      });
    }
  };

  return (
    <StateContext.Provider value={{ state, getKeys, getContent, getSignature }}>
      {children}
    </StateContext.Provider>
  );
};

export const useState = () => React.useContext(StateContext);
