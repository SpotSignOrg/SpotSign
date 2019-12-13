import * as React from "react";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

import { StateProvider } from "addon/popup/state";
import Author from "addon/popup/components/Author";
import Content from "addon/popup/components/Content";
import Keys from "addon/popup/components/Keys";
import Signature from "addon/popup/components/Signature";

export default function Popup() {
  return (
    <StateProvider>
      <Container>
        <Row className="my-4">
          <Col>
            <h3>SpotSign</h3>
          </Col>
        </Row>

        <Keys />

        <Author author="Jared" />

        <Content />

        <Signature />
      </Container>
    </StateProvider>
  );
}
