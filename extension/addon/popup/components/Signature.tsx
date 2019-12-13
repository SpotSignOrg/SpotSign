import * as React from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

interface SignatureProps {
  signature: string;
  handleGetSignature: () => void;
}

export default function SignatureManager({ signature, handleGetSignature }: SignatureProps) {
  return (
    <React.Fragment>
      <Row>
        <Col>
          <Form.Group>
            <Form.Label>Signature</Form.Label>
            <Form.Control value={signature} />
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col>
          <Form.Group>
            <Button onClick={handleGetSignature}>Sign Content</Button>
          </Form.Group>
        </Col>
      </Row>
    </React.Fragment>
  );
}
