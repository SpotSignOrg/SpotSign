import { Identity, MakeIdentity, State, SetState } from "addon/popup/state";
import { sendToContent, sendToBackground, MessageType, MessageTarget } from "addon/lib/messages";

export const createIdentity = () => async (state: State, setState: SetState) => {
  const response = await sendToBackground({
    type: MessageType.GET_KEYS,
    sender: MessageTarget.POPUP,
  });
  console.log("received response", response);
  if (response.type === MessageType.SEND_KEYS) {
    const newIdentities = state.identities.push(
      MakeIdentity({
        name: "New Identity",
        publicKey: response.publicKey,
      }),
    );
    setState(state.set("identities", newIdentities));
  }
};

export const editIdentity = (newIdentity: Identity) => (state: State, setState: SetState) => {
  const newIdentities = state.identities.map(identity => {
    if (identity.publicKey === newIdentity.publicKey) {
      return newIdentity;
    } else {
      return identity;
    }
  });

  setState(state.set("identities", newIdentities));
};

const getContent = async () => {
  const responses = await sendToContent({
    type: MessageType.GET_CONTENT,
    sender: MessageTarget.POPUP,
  });
  for (const response of responses) {
    if (response.type === MessageType.SEND_CONTENT) {
      return response.content;
    }
  }
  return;
};

export const signContent = (identity: Identity) => async () => {
  const content = await getContent();

  if (!content) {
    console.log("No content to sign, aborting");
    return;
  }

  const response = await sendToBackground({
    type: MessageType.GET_SIGNATURE,
    sender: MessageTarget.POPUP,
    content: content,
    publicKey: identity.publicKey,
  });

  if (response.type === MessageType.SEND_SIGNATURE_SUCCESS) {
    await sendToContent({
      type: MessageType.WRITE_SIGNATURE,
      sender: MessageTarget.POPUP,
      content: content,
      signature: response.signature,
      publicKey: identity.publicKey,
    });
    window.close();
  }
};
