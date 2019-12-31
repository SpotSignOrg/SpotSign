import * as React from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Collapse from "react-bootstrap/Collapse";
import Row from "react-bootstrap/Row";

import { Identity } from "addon/popup/state";
import { IdentityKeys } from "addon/popup/components/Identity/IdentityKeys";
import { signContent } from "addon/popup/state/actions";
import { useState } from "addon/popup/state";

export const IdentityDisplay: React.FunctionComponent<{ identity: Identity }> = ({ identity }) => {
  const { dispatch } = useState();

  const [open, setOpen] = React.useState(false);
  const ariaId = `${identity.publicKey}-collapse`;

  return (
    <div className="alert alert-info">
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
          <IdentityKeys identity={identity} />
          <Row>
            <Col className="text-right">
              <Button onClick={() => dispatch(signContent(identity))}>Sign</Button>
            </Col>
          </Row>
        </div>
      </Collapse>
    </div>
  );
};
