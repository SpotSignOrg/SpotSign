import * as React from "react";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";

interface AuthorProps {
  author: string;
}

export default function AuthorManager({ author }: AuthorProps) {
  return (
    <React.Fragment>
      <Row>
        <Col>
          <Form.Group>
            <Form.Label>Author</Form.Label>
            <Form.Control readOnly value={author} />
          </Form.Group>
        </Col>
      </Row>
    </React.Fragment>
  );
}
