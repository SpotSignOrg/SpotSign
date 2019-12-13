import * as React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import {
  listen,
  sendToBackground,
  MessageType,
  MessageTarget,
  MessageToPopup,
  sendToContent,
} from "addon/lib/messages";
import { assertNever } from "addon/lib/never";
import Keys from "addon/popup/components/Keys";
import Content from "addon/popup/components/Content";
import Author from "addon/popup/components/Author";
import Signature from "addon/popup/components/Signature";

export default function Popup() {
  const [keys, setKeys] = React.useState({
    privateKey: "",
    publicKey: "",
  });

  const [content, setContent] = React.useState("");

  const [signature, setSignature] = React.useState("");

  React.useEffect(() => {
    listen(MessageTarget.POPUP, (message: MessageToPopup) => {
      switch (message.type) {
        case MessageType.SEND_KEYS:
          setKeys({
            privateKey: message.keys.private_key,
            publicKey: message.keys.public_key,
          });
          break;
        case MessageType.SEND_CONTENT:
          setContent(message.content);
          break;
        case MessageType.CONTENT_SIGNED:
          setSignature(message.signature);
          break;
        case MessageType.CONTENT_ALIVE:
          break;
        default:
          assertNever(message);
      }
    });
  });

  const handleGetKeys = () => {
    sendToBackground({
      type: MessageType.GET_KEYS,
      sender: MessageTarget.POPUP,
    });
  };

  const handleGetContent = () => {
    sendToContent({
      type: MessageType.GET_CONTENT,
      sender: MessageTarget.POPUP,
    });
  };

  const handleSignContent = () => {
    sendToBackground({
      type: MessageType.SIGN_CONTENT,
      sender: MessageTarget.POPUP,
      content: content,
      privateKey: keys.privateKey,
      publicKey: keys.publicKey,
    });
  };

  return (
    <Container>
      <Row className="my-4">
        <Col>
          <h3>SpotSign</h3>
        </Col>
      </Row>

      <Keys privateKey={keys.privateKey} publicKey={keys.publicKey} handleGetKeys={handleGetKeys} />

      <Author author="Jared" />

      <Content content={content} handleGetContent={handleGetContent} />

      <Signature signature={signature} handleGetSignature={handleSignContent} />
    </Container>
  );
}
