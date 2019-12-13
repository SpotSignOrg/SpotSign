import * as React from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";

import { useState } from "addon/popup/state";

export default function KeyManager() {
  const { state, getKeys } = useState();
  return (
    <React.Fragment>
      <Row>
        <Col>
          <Form.Group>
            <Form.Label>Private Key</Form.Label>
            <Form.Control readOnly value={state.keys.privateKey} />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Form.Group>
            <Form.Label>Public Key</Form.Label>
            <Form.Control readOnly value={state.keys.publicKey} />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Form.Group>
            <Button onClick={getKeys}>Generate Keys</Button>
          </Form.Group>
        </Col>
      </Row>
    </React.Fragment>
  );
}
