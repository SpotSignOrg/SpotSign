import * as React from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";

import { createIdentity } from "addon/popup/state/actions";
import { IdentityManager } from "addon/popup/components/Identity/IdentityManager";
import { useState } from "addon/popup/state";

export const IdentityList = () => {
  const { state, dispatch } = useState();
  return (
    <React.Fragment>
      <Row className="mb-4">
        <Col>
          <h4 className="pt-1">{state.identities.size} Identities</h4>
        </Col>
      </Row>
      {Array.from(state.identities.values()).map((identity, i) => (
        <IdentityManager key={i} identity={identity} />
      ))}
      <Row>
        <Col className="text-right">
          <Button onClick={() => dispatch(createIdentity())}>Add Identity</Button>
        </Col>
      </Row>
    </React.Fragment>
  );
};
