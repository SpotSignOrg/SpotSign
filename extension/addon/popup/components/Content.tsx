import * as React from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

import { useContent } from "addon/popup/state/content";

export default function ContentManager() {
  const { content, getContent } = useContent();
  return (
    <React.Fragment>
      <Row>
        <Col>
          <Form.Group>
            <Form.Label>Content</Form.Label>
            <Form.Control readOnly value={content} />
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col>
          <Form.Group>
            <Button onClick={getContent}>Fetch Content</Button>
          </Form.Group>
        </Col>
      </Row>
    </React.Fragment>
  );
}
