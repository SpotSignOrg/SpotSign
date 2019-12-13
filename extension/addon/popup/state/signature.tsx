import * as React from "react";

import {
  listen,
  sendToBackground,
  MessageType,
  MessageTarget,
  MessageToPopup,
} from "addon/lib/messages";

const initialSignature = "No Signature";

export const SignatureContext = React.createContext({
  signature: initialSignature,
  getSignature: (content: string, privateKey: string, publicKey: string) => {
    [content, privateKey, publicKey];
  },
});

export const SignatureProvider: React.FunctionComponent = ({ children }) => {
  const [signature, setSignature] = React.useState(initialSignature);

  const getSignature = (content: string, privateKey: string, publicKey: string) =>
    sendToBackground({
      type: MessageType.GET_SIGNATURE,
      sender: MessageTarget.POPUP,
      content,
      privateKey,
      publicKey,
    });

  React.useEffect(() => {
    listen(MessageTarget.POPUP, (message: MessageToPopup) => {
      if (message.type === MessageType.SEND_SIGNATURE) {
        setSignature(message.signature);
      }
    });
  });

  return (
    <SignatureContext.Provider value={{ signature, getSignature }}>
      {children}
    </SignatureContext.Provider>
  );
};

export const useSignature = () => React.useContext(SignatureContext);
