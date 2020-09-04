import * as React from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

import { createIdentity } from "addon/popup/state/actions";
import { IdentityManager } from "addon/popup/components/Identity/IdentityManager";
import { useState } from "addon/popup/state";

export const IdentityList = () => {
  const { state, dispatch } = useState();
  return (
    <React.Fragment>
      <Container className="pb-3">
        <Row>
          <Col>
            <strong>SpotSign</strong>
          </Col>
          <Col className="text-right">
            <span>{state.identities.size} Identities</span>
          </Col>
        </Row>
      </Container>

      <hr className="p-0 m-0" />

      {Array.from(state.identities.values()).map((identity, i) => (
        <IdentityManager key={i} identity={identity} />
      ))}

      <Container className="pt-3">
        <Row>
          <Col className="text-right">
            <Button variant="link" onClick={() => dispatch(createIdentity())}>
              &#65291; Add Identity
            </Button>
          </Col>
        </Row>
      </Container>
    </React.Fragment>
  );
};
