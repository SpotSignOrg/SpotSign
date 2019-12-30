import * as React from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";

import { editIdentity } from "addon/popup/state/actions";
import { Identity } from "addon/popup/state";
import { IdentityKeys } from "addon/popup/components/Identity/IdentityKeys";
import { useState } from "addon/popup/state";

export const IdentityEdit: React.FunctionComponent<{ identity: Identity }> = ({ identity }) => {
  const [name, setName] = React.useState("");
  const { dispatch } = useState();

  return (
    <React.Fragment>
      <Row>
        <Col>
          <Form.Group>
            <Form.Label>Name</Form.Label>
            <Form.Control
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            />
          </Form.Group>
        </Col>
      </Row>

      <IdentityKeys identity={identity} />

      <Row>
        <Col className="text-right">
          <Button
            onClick={() => dispatch(editIdentity(identity.set("name", name).set("edit", false)))}
          >
            Save
          </Button>
        </Col>
      </Row>
    </React.Fragment>
  );
};
