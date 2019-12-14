import * as React from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

import { useState } from "addon/popup/state";
import { getSignature, getVerification } from "addon/popup/state/actions";

export default function SignatureManager() {
  const { state, setState } = useState();

  return (
    <React.Fragment>
      <Row>
        <Col>
          <Form.Group>
            <Form.Label>Signature</Form.Label>
            <Form.Control readOnly value={state.signature} />
            <p>Verified: {state.verification.datetime}</p>
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col>
          <Form.Group>
            <Button onClick={() => getSignature(state, setState)}>Sign Content</Button>
            <Button onClick={() => getVerification(state, setState)}>Verify Signature</Button>
          </Form.Group>
        </Col>
      </Row>
    </React.Fragment>
  );
}
