import * as React from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

import { useKeys, KeyActions } from "addon/popup/state/keys";

export default function KeyManager() {
  const [keys, keysDispatch] = useKeys();
  return (
    <React.Fragment>
      <Row>
        <Col>
          <Form.Group>
            <Form.Label>Private Key</Form.Label>
            <Form.Control readOnly value={keys.privateKey} />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Form.Group>
            <Form.Label>Public Key</Form.Label>
            <Form.Control readOnly value={keys.publicKey} />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Form.Group>
            <Button onClick={() => keysDispatch({ type: KeyActions.GET_KEYS })}>
              Generate Keys
            </Button>
          </Form.Group>
        </Col>
      </Row>
    </React.Fragment>
  );
}
