import { Identity, MakeIdentity, State, SetState } from "addon/popup/state";
import { sendToBackground, MessageType, MessageTarget } from "addon/lib/messages";

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

export const signContent = (identity: Identity) => () => {
  sendToBackground({
    type: MessageType.GET_SIGNATURE,
    sender: MessageTarget.POPUP,
    publicKey: identity.publicKey,
  });
  window.close();
};
