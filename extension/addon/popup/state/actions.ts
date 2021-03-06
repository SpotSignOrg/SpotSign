import { Identity, MakeIdentity, State, SetState } from "addon/popup/state";
import { sendToBackground, MessageType, MessageTarget } from "addon/lib/messages";

export const createIdentity = () => async (state: State, setState: SetState) => {
  const response = await sendToBackground({
    type: MessageType.GET_KEYS,
    sender: MessageTarget.POPUP,
  });

  if (response.type === MessageType.SEND_KEYS) {
    const newIdentities = state.identities.set(
      response.publicKey,
      MakeIdentity({
        name: "New Identity",
        publicKey: response.publicKey,
        privateKey: response.privateKey,
      }),
    );
    setState(state.set("identities", newIdentities));
  }
};

export const saveIdentity = (identity: Identity, newName: string, newPassword: string) => (
  state: State,
  setState: SetState,
) => {
  const newIdentity = identity
    .set("name", newName)
    .set("edit", false)
    .set("password", newPassword);
  setState(state.set("identities", state.identities.set(identity.publicKey, newIdentity)));
};

export const deleteIdentity = (identity: Identity) => (state: State, setState: SetState) => {
  console.log("deleting", identity);
  setState(state.set("identities", state.identities.remove(identity.publicKey)));
};

export const signContent = (identity: Identity) => () => {
  sendToBackground({
    type: MessageType.SIGN_CONTENT,
    sender: MessageTarget.POPUP,
    publicKey: identity.publicKey,
    privateKey: identity.privateKey,
  });
  window.close();
};
