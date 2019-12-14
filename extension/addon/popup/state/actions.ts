import { sendToContent, sendToBackground, MessageType, MessageTarget } from "addon/lib/messages";
import { State, SetState } from "addon/popup/state";

export const getKeys = async (state: State, setState: SetState) => {
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

export const getContent = async (state: State, setState: SetState) => {
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

export const getSignature = async (state: State, setState: SetState) => {
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

export const getVerification = async (state: State, setState: SetState) => {
  const response = await sendToBackground({
    type: MessageType.GET_VERIFICATION,
    sender: MessageTarget.POPUP,
    publicKey: state.keys.publicKey,
    content: state.content,
    signature: state.signature,
  });
  if (response.type === MessageType.SEND_VERIFICATION) {
    setState({
      ...state,
      verification: response.verification,
    });
  }
};
