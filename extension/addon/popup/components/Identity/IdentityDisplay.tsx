import * as React from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

import { Identity } from "addon/popup/state";
import { IdentityKeys } from "addon/popup/components/Identity/IdentityKeys";
import { signContent } from "addon/popup/state/actions";
import { useState } from "addon/popup/state";

export const IdentityDisplay: React.FunctionComponent<{ identity: Identity }> = ({ identity }) => {
  const { dispatch } = useState();

  return (
    <React.Fragment>
      <IdentityKeys identity={identity} />
      <Row>
        <Col className="text-right">
          <Button onClick={() => dispatch(signContent(identity))}>Sign</Button>
        </Col>
      </Row>
    </React.Fragment>
  );
};
