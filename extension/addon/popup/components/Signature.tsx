import * as React from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

import { useKeys } from "addon/popup/state/keys";
import { useContent } from "addon/popup/state/content";
import { useSignature } from "addon/popup/state/signature";

export default function SignatureManager() {
  const { keys } = useKeys();
  const { content } = useContent();
  const { signature, getSignature } = useSignature();

  return (
    <React.Fragment>
      <Row>
        <Col>
          <Form.Group>
            <Form.Label>Signature</Form.Label>
            <Form.Control readOnly value={signature} />
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col>
          <Form.Group>
            <Button onClick={() => getSignature(content, keys.privateKey, keys.publicKey)}>
              Sign Content
            </Button>
          </Form.Group>
        </Col>
      </Row>
    </React.Fragment>
  );
}
