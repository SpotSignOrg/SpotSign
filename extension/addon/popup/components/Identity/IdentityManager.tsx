import * as React from "react";
import Col from "react-bootstrap/Col";
import Collapse from "react-bootstrap/Collapse";
import Row from "react-bootstrap/Row";

import { Identity } from "addon/popup/state";
import { IdentityEdit } from "addon/popup/components/Identity/IdentityEdit";
import { IdentityDisplay } from "addon/popup/components/Identity/IdentityDisplay";

export const IdentityManager: React.FunctionComponent<{ identity: Identity }> = ({ identity }) => {
  const [open, setOpen] = React.useState(identity.edit);
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
