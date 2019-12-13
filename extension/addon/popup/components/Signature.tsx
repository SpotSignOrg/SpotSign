import * as React from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

import { useState } from "addon/popup/state";

export default function SignatureManager() {
  const { state, getSignature } = useState();

  return (
    <React.Fragment>
      <Row>
        <Col>
          <Form.Group>
            <Form.Label>Signature</Form.Label>
            <Form.Control readOnly value={state.signature} />
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col>
          <Form.Group>
            <Button onClick={getSignature}>Sign Content</Button>
          </Form.Group>
        </Col>
      </Row>
    </React.Fragment>
  );
}
