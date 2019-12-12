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

interface MessageBase {
  type: string;
  sender: MessageTarget;
}

export interface MessageGetKeys extends MessageBase {
  type: MessageType.GET_KEYS;
}

export interface MessageSignContent extends MessageBase {
  type: MessageType.SIGN_CONTENT;
  publicKey: string;
  privateKey: string;
  content: string;
}

export type MessageToBackground = MessageGetKeys | MessageSignContent;

export interface MessageSendKeys extends MessageBase {
  type: MessageType.SEND_KEYS;
  keys: Keys;
}

export interface MessageContentSigned extends MessageBase {
  type: MessageType.CONTENT_SIGNED;
  signature: string;
}

export interface MessageContentAlive extends MessageBase {
  type: MessageType.CONTENT_ALIVE;
}

export interface MessageSendContent extends MessageBase {
  type: MessageType.SEND_CONTENT;
  content: string;
}

export type MessageToPopup =
  | MessageSendKeys
  | MessageContentSigned
  | MessageContentAlive
  | MessageSendContent;

export interface MessageGetContent extends MessageBase {
  type: MessageType.GET_CONTENT;
}

export type MessageToContent = MessageGetContent;

export type Message = MessageToBackground | MessageToPopup | MessageToContent;

export async function sendToContent(message: MessageToContent) {
  const tabs = await browser.tabs.query({
    currentWindow: true,
    active: true,
  });
  for (const tab of tabs) {
    console.log("Sending message", message, "to content tab", tab.id);
    browser.tabs.sendMessage(tab.id, message);
  }
}

export function sendToBackground(message: MessageToBackground) {
  console.log("Sending message to background", message);
  browser.runtime.sendMessage(message);
}

export function sendToPopup(message: MessageToPopup) {
  console.log("Sending message to popup", message);
  browser.runtime.sendMessage(message);
}

export function listen(receiver: MessageTarget, listener: (_: Message) => void) {
  browser.runtime.onMessage.addListener((message: Message) => {
    console.log(`Received message in ${receiver}:`, message);
    listener(message);
  });
}
