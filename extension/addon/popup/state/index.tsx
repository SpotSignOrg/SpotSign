import * as React from "react";
import * as Immutable from "immutable";

export interface IdentityProps {
  readonly edit: boolean;
  readonly name: string;
  readonly password: string;
  readonly publicKey: string;
  readonly privateKey: string;
}

export interface Identity extends Immutable.RecordOf<IdentityProps>, IdentityProps {}

export const MakeIdentity = Immutable.Record<IdentityProps>({
  edit: true,
  name: "No Name",
  password: "No Password",
  publicKey: "No Public Key",
  privateKey: "No Private Key",
});

export interface StateProps {
  readonly identities: Immutable.OrderedMap<string, Identity>;
}
export interface StoredState {
  identities: Record<string, IdentityProps>;
}

export interface State extends Immutable.RecordOf<StateProps>, StateProps {}

export const MakeState = Immutable.Record<StateProps>({
  identities: Immutable.OrderedMap(),
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

const rehydrate = (storedState: StoredState) => {
  let identities = Immutable.OrderedMap<string, Identity>();

  for (const publicKey in storedState.identities) {
    identities = identities.set(publicKey, MakeIdentity(storedState.identities[publicKey]));
  }

  return MakeState({ identities });
};

export const StateProvider: React.FunctionComponent<{ storedState: StoredState }> = ({
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
