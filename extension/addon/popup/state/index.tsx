import * as React from "react";

import { Verification } from "addon/signer";

const initialState = {
  keys: { privateKey: "No Private Key", publicKey: "No Public Key" },
  content: "No Content",
  signature: "No Signature",
  verification: {
    verified: false,
    datetime: "Not verified",
    error: "Not verified",
  } as Verification,
};

export type State = typeof initialState;
export type SetState = (state: State) => void;
export type Action = (state: State, setState: SetState) => void;

export const StateContext = React.createContext({
  state: initialState,
  dispatch: (action: Action) => {
    action;
  },
});

export const StateProvider: React.FunctionComponent = ({ children }) => {
  const [state, setState] = React.useState(initialState);
  const dispatch = (action: Action) => action(state, setState);
  return <StateContext.Provider value={{ state, dispatch }}>{children}</StateContext.Provider>;
};

export const useState = () => React.useContext(StateContext);
