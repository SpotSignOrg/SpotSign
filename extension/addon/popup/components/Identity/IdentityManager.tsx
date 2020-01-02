import * as React from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Collapse from "react-bootstrap/Collapse";
import Row from "react-bootstrap/Row";

import { Identity, useState } from "addon/popup/state";
import { deleteIdentity } from "addon/popup/state/actions";
import { IdentityEdit } from "addon/popup/components/Identity/IdentityEdit";
import { IdentityDisplay } from "addon/popup/components/Identity/IdentityDisplay";

export const IdentityManager: React.FunctionComponent<{ identity: Identity }> = ({ identity }) => {
  const { dispatch } = useState();
  const [open, setOpen] = React.useState(identity.edit);
  const ariaId = `${identity.publicKey}-collapse`;

  return (
    <div className="alert alert-primary">
      <Row>
        <Col>
          <h4
            onClick={() => setOpen(!open)}
            aria-controls={ariaId}
            aria-expanded={open}
            style={{
              cursor: "pointer",
            }}
          >
            {identity.name}
          </h4>
        </Col>
        <Col className="text-right">
          <Button onClick={() => dispatch(deleteIdentity(identity))}>X</Button>
        </Col>
      </Row>
      <Collapse in={open}>
        <div id={ariaId}>
          {identity.edit ? (
            <IdentityEdit identity={identity} />
          ) : (
            <IdentityDisplay identity={identity} />
          )}
        </div>
      </Collapse>
    </div>
  );
};
