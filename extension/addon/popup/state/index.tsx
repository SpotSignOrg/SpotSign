import * as React from "react";
import { Record, RecordOf, List } from "immutable";

export interface IdentityProps {
  readonly edit: boolean;
  readonly name: string;
  readonly privateKey: string;
  readonly publicKey: string;
}

export interface Identity extends RecordOf<IdentityProps>, IdentityProps {}

export const MakeIdentity = Record<IdentityProps>({
  edit: true,
  name: "No Name",
  privateKey: "No Private Key",
  publicKey: "No Public Key",
});

export interface StateProps {
  readonly identities: List<Identity>;
}

export interface State extends RecordOf<StateProps>, StateProps {}

export const MakeState = Record<StateProps>({
  identities: List<Identity>(),
});

const initialState = MakeState();

export type SetState = (state: State) => void;
export type Action = (state: State, setState: SetState) => void;

export const StateContext = React.createContext({
  state: initialState,
  dispatch: (action: Action) => {
    action;
  },
});

const rehydrate = (storedState: StateProps) => {
  let identities = List();

  if (storedState.identities) {
    identities = List(storedState.identities.map(MakeIdentity));
  }

  return MakeState({ identities });
};

export const StateProvider: React.FunctionComponent<{ storedState: StateProps }> = ({
  storedState,
  children,
}) => {
  const [state, setState] = React.useState(initialState.merge(rehydrate(storedState)));

  const storeState = (state: State) => {
    const toStore = state.toJS();
    console.log("Storing state", toStore);
    browser.storage.local.set(toStore);
    console.log("Stored state", toStore);
    setState(state);
    console.log("Updated state", state);
  };

  const dispatch = (action: Action) => action(state, storeState);

  return <StateContext.Provider value={{ state, dispatch }}>{children}</StateContext.Provider>;
};

export const useState = () => React.useContext(StateContext);
