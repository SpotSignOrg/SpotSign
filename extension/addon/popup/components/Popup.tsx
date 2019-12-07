import * as React from "React";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

import {
  listen,
  sendToBackground,
  MessageType,
  MessageTarget,
  MessageToPopup,
  sendToContent,
} from "addon/lib/messages";
import { assertNever } from "addon/lib/never";

export default class Popup extends React.Component {
  state = {
    privateKey: "",
    publicKey: "",
    content: "",
    signature: "",
  };

  componentDidMount = () => {
    listen(MessageTarget.POPUP, (message: MessageToPopup) => {
      switch (message.type) {
        case MessageType.SEND_KEYS:
          this.setState({
            privateKey: message.keys.private_key,
            publicKey: message.keys.public_key,
          });
          break;
        case MessageType.SEND_CONTENT:
          this.setState({
            content: message.content,
          });
          break;
        case MessageType.CONTENT_SIGNED:
          this.setState({
            signature: message.signature,
          });
          break;
        case MessageType.CONTENT_ALIVE:
          break;
        default:
          assertNever(message);
      }
    });
  };

  handleGetKeys = () => {
    sendToBackground({
      type: MessageType.GET_KEYS,
      sender: MessageTarget.POPUP,
    });
  };

  handleGetContent = () => {
    sendToContent({
      type: MessageType.GET_CONTENT,
      sender: MessageTarget.POPUP,
    });
  };

  handleSignContent = () => {
    console.log(this);
    sendToBackground({
      type: MessageType.SIGN_CONTENT,
      sender: MessageTarget.POPUP,
      content: this.state.content,
      privateKey: this.state.privateKey,
      publicKey: this.state.publicKey,
    });
  };

  render() {
    return (
      <Container>
        <Row className="my-4">
          <Col>
            <h3>SpotSign</h3>
          </Col>
        </Row>

        <Row>
          <Col>
            <Form.Group>
              <Form.Label>Private Key</Form.Label>
              <Form.Control value={this.state.privateKey} />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col>
            <Form.Group>
              <Form.Label>Public Key</Form.Label>
              <Form.Control value={this.state.publicKey} />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col>
            <Form.Group>
              <Button onClick={this.handleGetKeys}>Generate Keys</Button>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col>
            <Form.Group>
              <Form.Label>Author</Form.Label>
              <Form.Control value="Jared" />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col>
            <Form.Group>
              <Form.Label>Content</Form.Label>
              <Form.Control value={this.state.content} />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col>
            <Form.Group>
              <Button onClick={this.handleGetContent}>Fetch Content</Button>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col>
            <Form.Group>
              <Form.Label>Signature</Form.Label>
              <Form.Control value={this.state.signature} />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col>
            <Form.Group>
              <Button onClick={this.handleSignContent}>Sign</Button>
            </Form.Group>
          </Col>
        </Row>
      </Container>
    );
  }
}
