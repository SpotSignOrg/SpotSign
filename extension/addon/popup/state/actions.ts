import { MakeIdentity, State, SetState } from "addon/popup/state";
import { sendToBackground, MessageType, MessageTarget } from "addon/lib/messages";

export const createIdentity = async (state: State, setState: SetState) => {
  const response = await sendToBackground({
    type: MessageType.GET_KEYS,
    sender: MessageTarget.POPUP,
  });
  if (response.type === MessageType.SEND_KEYS) {
    const newIdentities = state.identities.push(
      MakeIdentity({
        name: "New Identity",
        privateKey: response.keys.private_key,
        publicKey: response.keys.public_key,
      }),
    );
    setState(state.set("identities", newIdentities));
  }
};

// const getContent = async () => {
//   const responses = await sendToContent({
//     type: MessageType.GET_CONTENT,
//     sender: MessageTarget.POPUP,
//   });
//   for (const response of responses) {
//     if (response.type === MessageType.SEND_CONTENT) {
//       return response.content;
//     }
//   }
//   return;
// };

// export const getSignature = async (state: State) => {
//   const content = await getContent();

//   if (!content) {
//     console.log("No content to sign, aborting");
//     return;
//   }

//   const response = await sendToBackground({
//     type: MessageType.GET_SIGNATURE,
//     sender: MessageTarget.POPUP,
//     content: content,
//     privateKey: state.keys.privateKey,
//     publicKey: state.keys.publicKey,
//   });

//   if (response.type === MessageType.SEND_SIGNATURE) {
//     await sendToContent({
//       type: MessageType.WRITE_SIGNATURE,
//       sender: MessageTarget.POPUP,
//       content: content,
//       signature: response.signature,
//     });
//     window.close();
//   }
// };

// export const getVerification = async (state: State, setState: SetState) => {
//   const response = await sendToBackground({
//     type: MessageType.GET_VERIFICATION,
//     sender: MessageTarget.POPUP,
//     publicKey: state.keys.publicKey,
//     content: "state.content",
//     signature: "state.signature",
//   });
//   if (response.type === MessageType.SEND_VERIFICATION) {
//     setState({
//       ...state,
//       verification: response.verification,
//     });
//   }
// };
