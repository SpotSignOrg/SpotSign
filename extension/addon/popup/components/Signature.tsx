import * as React from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

import { useState } from "addon/popup/state";
import { getSignature } from "addon/popup/state/actions";

export default function SignatureManager() {
  const { dispatch } = useState();

  return (
    <React.Fragment>
      <Row>
        <Col>
          <Form.Group>
            <Button onClick={() => dispatch(getSignature)}>Sign Content</Button>
          </Form.Group>
        </Col>
      </Row>
    </React.Fragment>
  );
}
