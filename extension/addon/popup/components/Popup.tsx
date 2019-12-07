import * as React from "React";

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
      <div className="container">
        <div className="row my-4">
          <div className="col">
            <h3>SpotSign</h3>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <div className="form-group">
              <label>Private Key</label>
              <input className="form-control" value={this.state.privateKey} />
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <div className="form-group">
              <label>Public Key</label>
              <input className="form-control" value={this.state.publicKey} />
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <div className="form-group">
              <button className="btn btn-primary" onClick={this.handleGetKeys}>
                Generate Keys
              </button>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <div className="form-group">
              <label>Author</label>
              <input className="form-control" value="Jared" />
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <div className="form-group">
              <label>Content</label>
              <input className="form-control" value={this.state.content} />
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <div className="form-group">
              <button className="btn btn-primary" onClick={this.handleGetContent}>
                Fetch Content
              </button>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <div className="form-group">
              <label>Signature</label>
              <input className="form-control" value={this.state.signature} />
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <div className="form-group">
              <button className="btn btn-primary" onClick={this.handleSignContent}>
                Sign
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
