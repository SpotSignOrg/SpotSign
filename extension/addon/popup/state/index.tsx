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

export type State = Readonly<typeof initialState>;
export type SetState = (state: State) => void;
export type Action = (state: State, setState: SetState) => void;

export const StateContext = React.createContext({
  state: initialState as State,
  dispatch: (action: Action) => {
    action;
  },
});

export const StateProvider: React.FunctionComponent<{ storedState: State }> = ({
  storedState,
  children,
}) => {
  const [state, setState] = React.useState({ ...initialState, ...storedState } as State);
  const storeState = (state: State) => {
    console.log("Storing state", state);
    browser.storage.local.set(state);
    console.log("Stored state", state);
    setState(state);
    console.log("Updated state");
  };
  const dispatch = (action: Action) => action(state, storeState);

  return <StateContext.Provider value={{ state, dispatch }}>{children}</StateContext.Provider>;
};

export const useState = () => React.useContext(StateContext);
