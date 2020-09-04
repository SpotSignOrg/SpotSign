import * as React from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Collapse from "react-bootstrap/Collapse";
import Container from "react-bootstrap/Container";
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
    <React.Fragment>
      <Container className="py-3">
        <Row>
          <Col>
            <strong
              onClick={() => setOpen(!open)}
              aria-controls={ariaId}
              aria-expanded={open}
              style={{
                cursor: "pointer",
              }}
            >
              {identity.name}
            </strong>
          </Col>
          <Col className="text-right">
            <Button className="close" onClick={() => dispatch(deleteIdentity(identity))}>
              <span aria-hidden="true">&times;</span>
            </Button>
          </Col>
        </Row>
        <Collapse in={open}>
          <div id={ariaId} className="pt-3">
            {identity.edit ? (
              <IdentityEdit identity={identity} />
            ) : (
              <IdentityDisplay identity={identity} />
            )}
          </div>
        </Collapse>
      </Container>
      <hr className="p-0 m-0" />
    </React.Fragment>
  );
};
