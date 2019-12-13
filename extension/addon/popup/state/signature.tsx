import * as React from "react";

import {
  listen,
  sendToBackground,
  MessageType,
  MessageTarget,
  MessageToPopup,
} from "addon/lib/messages";

type Signature = string;

export enum SignatureActions {
  GET_SIGNATURE = "getSignature",
  SEND_SIGNATURE = "sendSignature",
}

export interface GetSignatureAction {
  type: SignatureActions.GET_SIGNATURE;
  privateKey: string;
  publicKey: string;
  content: string;
}

export interface SendSignatureAction {
  type: SignatureActions.SEND_SIGNATURE;
  signature: Signature;
}

export type SignatureAction = GetSignatureAction | SendSignatureAction;

const initialSignature: Signature = "No Signature";

const reducer = (state: Signature, action: SignatureAction) => {
  switch (action.type) {
    case SignatureActions.GET_SIGNATURE:
      console.log("get Signature action");
      sendToBackground({
        type: MessageType.GET_SIGNATURE,
        sender: MessageTarget.POPUP,
        privateKey: action.privateKey,
        publicKey: action.publicKey,
        content: action.content,
      });
      return state;
    case SignatureActions.SEND_SIGNATURE:
      console.log("send Signature action");
      return action.signature;
    default:
      return state;
  }
};

export const SignatureContext = React.createContext([
  initialSignature,
  (action: SignatureAction) => action,
] as [Signature, React.Dispatch<SignatureAction>]);

export const SignatureProvider: React.FunctionComponent = ({ children }) => {
  const [Signature, SignatureDispatch] = React.useReducer(reducer, initialSignature);

  React.useEffect(() => {
    listen(MessageTarget.POPUP, (message: MessageToPopup) => {
      if (message.type === MessageType.SEND_SIGNATURE) {
        SignatureDispatch({
          type: SignatureActions.SEND_SIGNATURE,
          signature: message.signature,
        });
      }
    });
  });

  return (
    <SignatureContext.Provider value={[Signature, SignatureDispatch]}>
      {children}
    </SignatureContext.Provider>
  );
};

export const useSignature = () => React.useContext(SignatureContext);
