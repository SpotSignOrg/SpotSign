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

export const StateContext = React.createContext({
  state: initialState,
  setState: (state: State) => {
    state;
  },
});

export const StateProvider: React.FunctionComponent = ({ children }) => {
  const [state, setState] = React.useState(initialState);
  return <StateContext.Provider value={{ state, setState }}>{children}</StateContext.Provider>;
};

export const useState = () => React.useContext(StateContext);
