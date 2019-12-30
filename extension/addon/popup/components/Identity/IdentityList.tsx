import * as React from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";

import { createIdentity } from "addon/popup/state/actions";
import { IdentityDisplay } from "addon/popup/components/Identity/IdentityDisplay";
import { useState } from "addon/popup/state";

export const IdentityList = () => {
  const { state, dispatch } = useState();
  return (
    <React.Fragment>
      <Row className="mb-4">
        <Col>
          <h4>{state.identities.size} Identities</h4>
        </Col>
        <Col className="text-right">
          <Button onClick={() => dispatch(createIdentity)}>Add Identity</Button>
        </Col>
      </Row>
      {state.identities.map((identity, i) => (
        <IdentityDisplay key={i} identity={identity} />
      ))}
    </React.Fragment>
  );
};
