import * as React from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

interface ContentProps {
  content: string;
  handleGetContent: () => void;
}

export default function ContentManager({ content, handleGetContent }: ContentProps) {
  return (
    <React.Fragment>
      <Row>
        <Col>
          <Form.Group>
            <Form.Label>Content</Form.Label>
            <Form.Control value={content} />
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col>
          <Form.Group>
            <Button onClick={handleGetContent}>Fetch Content</Button>
          </Form.Group>
        </Col>
      </Row>
    </React.Fragment>
  );
}
