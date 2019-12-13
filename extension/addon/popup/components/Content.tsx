import * as React from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";

import { useState } from "addon/popup/state";

export default function ContentManager() {
  const { state, getContent } = useState();
  return (
    <React.Fragment>
      <Row>
        <Col>
          <Form.Group>
            <Form.Label>Content</Form.Label>
            <Form.Control readOnly value={state.content} />
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
