import * as React from "react";
import Col from "react-bootstrap/Col";
import Collapse from "react-bootstrap/Collapse";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";

import { Identity } from "addon/popup/state";

export const IdentityDisplay: React.FunctionComponent<{ identity: Identity }> = ({ identity }) => {
  const [open, setOpen] = React.useState(false);
  const ariaId = `${identity.publicKey}-collapse`;

  return (
    <React.Fragment>
      <Row
        onClick={() => setOpen(!open)}
        aria-controls={ariaId}
        aria-expanded={open}
        style={{
          cursor: "pointer",
        }}
      >
        <Col>
          <h4>{identity.name}</h4>
        </Col>
      </Row>
      <Collapse in={open}>
        <div id={ariaId}>
          <Row>
            <Col>
              <Form.Group>
                <Form.Label>Private Key</Form.Label>
                <Form.Control readOnly value={identity.privateKey} />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col>
              <Form.Group>
                <Form.Label>Public Key</Form.Label>
                <Form.Control readOnly value={identity.publicKey} />
              </Form.Group>
            </Col>
          </Row>
        </div>
      </Collapse>
    </React.Fragment>
  );
};
