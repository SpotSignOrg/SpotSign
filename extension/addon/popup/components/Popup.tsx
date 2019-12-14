import * as React from "react";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

import { State, StateProvider } from "addon/popup/state";
import Author from "addon/popup/components/Author";
import Keys from "addon/popup/components/Keys";
import Signature from "addon/popup/components/Signature";

export const Popup: React.FunctionComponent<{ storedState: State }> = ({ storedState }) => (
  <StateProvider storedState={storedState}>
    <Container>
      <Row className="my-4">
        <Col>
          <h3>SpotSign</h3>
        </Col>
      </Row>

      <Keys />

      <Author author="Jared" />

      <Signature />
    </Container>
  </StateProvider>
);
