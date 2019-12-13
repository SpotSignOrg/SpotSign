import * as React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import Keys from "addon/popup/components/Keys";
import Content from "addon/popup/components/Content";
import Author from "addon/popup/components/Author";
import Signature from "addon/popup/components/Signature";
import { KeysProvider } from "addon/popup/state/keys";
import { ContentProvider } from "addon/popup/state/content";
import { SignatureProvider } from "addon/popup/state/signature";

export default function Popup() {
  return (
    <KeysProvider>
      <ContentProvider>  
        <SignatureProvider>
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
        </SignatureProvider>      
      </ContentProvider>
    </KeysProvider>

  );
}
