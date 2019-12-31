import * as React from "react";
import Container from "react-bootstrap/Container";

import { IdentityList } from "addon/popup/components/Identity/IdentityList";
import { StoredState, StateProvider } from "addon/popup/state";

export const Popup: React.FunctionComponent<{ storedState: StoredState }> = ({ storedState }) => {
  const style = {
    width: "300px",
  };

  return (
    <StateProvider storedState={storedState}>
      <Container className="py-3" style={style}>
        <IdentityList />
      </Container>
    </StateProvider>
  );
};
