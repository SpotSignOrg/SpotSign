import * as React from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

interface KeyManagerProps {
  privateKey: string;
  publicKey: string;
  handleGetKeys: () => void;
}

export default function KeyManager({ privateKey, publicKey, handleGetKeys }: KeyManagerProps) {
  return (
    <React.Fragment>
      <Row>
        <Col>
          <Form.Group>
            <Form.Label>Private Key</Form.Label>
            <Form.Control readOnly value={privateKey} />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Form.Group>
            <Form.Label>Public Key</Form.Label>
            <Form.Control readOnly value={publicKey} />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Form.Group>
            <Button onClick={handleGetKeys}>Generate Keys</Button>
          </Form.Group>
        </Col>
      </Row>
    </React.Fragment>
  );
}
