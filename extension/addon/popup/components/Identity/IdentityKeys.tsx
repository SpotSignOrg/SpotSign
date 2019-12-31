import * as React from "react";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";

import { Identity } from "addon/popup/state";

export const IdentityKeys: React.FunctionComponent<{ identity: Identity }> = ({ identity }) => {
  return (
    <React.Fragment>
      <Row>
        <Col>
          <Form.Group>
            <Form.Label>Public Key</Form.Label>
            <Form.Control readOnly value={identity.publicKey} />
          </Form.Group>
        </Col>
      </Row>
    </React.Fragment>
  );
};
