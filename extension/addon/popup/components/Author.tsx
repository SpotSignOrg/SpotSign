import * as React from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";

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
            <Form.Control value={author} />
          </Form.Group>
        </Col>
      </Row>
    </React.Fragment>
  );
}
