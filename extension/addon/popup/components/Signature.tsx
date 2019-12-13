import * as React from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

import { useKeys } from "addon/popup/state/keys";
import { useContent } from "addon/popup/state/content";
import { useSignature, SignatureActions } from "addon/popup/state/signature";

export default function SignatureManager() {
  const [keys] = useKeys();
  const [content] = useContent();
  const [signature, signatureDispatch] = useSignature();

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
            <Button
              onClick={() =>
                signatureDispatch({
                  type: SignatureActions.GET_SIGNATURE,
                  privateKey: keys.privateKey,
                  publicKey: keys.publicKey,
                  content: content,
                })
              }
            >
              Sign Content
            </Button>
          </Form.Group>
        </Col>
      </Row>
    </React.Fragment>
  );
}
