import * as React from "react";
import * as Immutable from "immutable";

export interface IdentityProps {
  readonly edit: boolean;
  readonly name: string;
  readonly publicKey: string;
}

export interface Identity extends Immutable.RecordOf<IdentityProps>, IdentityProps {}

export const MakeIdentity = Immutable.Record<IdentityProps>({
  edit: true,
  name: "No Name",
  publicKey: "No Public Key",
});

export interface StateProps {
  readonly identities: Immutable.List<Identity>;
}
export interface StoredState {
  identities: Array<IdentityProps>;
}

export interface State extends Immutable.RecordOf<StateProps>, StateProps {}

export const MakeState = Immutable.Record<StateProps>({
  identities: Immutable.List<Identity>(),
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
  let identities = Immutable.List();

  if (storedState.identities) {
    identities = Immutable.List(storedState.identities.map(MakeIdentity));
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
