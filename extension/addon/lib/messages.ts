import { Keys } from "addon/signer";

export enum MessageTarget {
  BACKGROUND = "background",
  POPUP = "popup",
  CONTENT = "content",
}

export enum MessageType {
  GET_CONTENT = "getContent",
  SEND_CONTENT = "sendContent",
  GET_KEYS = "getKeys",
  SEND_KEYS = "sendKeys",
  SIGN_CONTENT = "signContent",
  CONTENT_SIGNED = "contentSigned",
  CONTENT_ALIVE = "contentAlive",
}

interface MessageWithSender {
  sender: MessageTarget;
}

export interface MessageGetKeys extends MessageWithSender {
  type: MessageType.GET_KEYS;
}

export interface MessageSignContent extends MessageWithSender {
  type: MessageType.SIGN_CONTENT;
  publicKey: string;
  privateKey: string;
  content: string;
}

export type MessageToBackground = MessageGetKeys | MessageSignContent;

export interface MessageSendKeys extends MessageWithSender {
  type: MessageType.SEND_KEYS;
  keys: Keys;
}

export interface MessageContentSigned extends MessageWithSender {
  type: MessageType.CONTENT_SIGNED;
  signature: string;
}

export interface MessageContentAlive extends MessageWithSender {
  type: MessageType.CONTENT_ALIVE;
}

export interface MessageSendContent extends MessageWithSender {
  type: MessageType.SEND_CONTENT;
  content: string;
}

export type MessageToPopup =
  | MessageSendKeys
  | MessageContentSigned
  | MessageContentAlive
  | MessageSendContent;

export interface MessageGetContent extends MessageWithSender {
  type: MessageType.GET_CONTENT;
}

export type MessageToContent = MessageGetContent;

export type Message = MessageToBackground | MessageToPopup | MessageToContent;

export function sendToContent(message: MessageToContent): void {
  browser.tabs
    .query({
      currentWindow: true,
      active: true,
    })
    .then(tabs => {
      for (const tab of tabs) {
        console.log("sending message from popup", message, "to tab", tab.id);
        browser.tabs.sendMessage(tab.id, message);
      }
    })
    .catch(console.log);
}

export function sendToBackground(message: MessageToBackground): void {
  console.log("Sending message to background", message);
  browser.runtime.sendMessage(message);
}

export function sendToPopup(message: MessageToPopup): void {
  console.log("Sending message to popup", message);
  browser.runtime.sendMessage(message);
}

export function listen(receiver: MessageTarget, listener: (_: Message) => void): void {
  browser.runtime.onMessage.addListener((message: Message) => {
    console.log(`Received message in ${receiver}:`, message);
    listener(message);
  });
}
