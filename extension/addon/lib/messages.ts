import { Keys, Verification } from "addon/signer";

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
  GET_SIGNATURE = "getSignature",
  SEND_SIGNATURE = "sendSignature",
  GET_VERIFICATION = "getVerification",
  SEND_VERIFICATION = "sendVerification",
  WRITE_SIGNATURE = "writeSignature",
}

interface MessageBase {
  type: string;
  sender: MessageTarget;
}

export interface MessageGetKeys extends MessageBase {
  type: MessageType.GET_KEYS;
}

export interface MessageGetSignature extends MessageBase {
  type: MessageType.GET_SIGNATURE;
  publicKey: string;
  privateKey: string;
  content: string;
}

export interface MessageGetVerification extends MessageBase {
  type: MessageType.GET_VERIFICATION;
  publicKey: string;
  content: string;
  signature: string;
}

export type MessageToBackground = MessageGetKeys | MessageGetSignature | MessageGetVerification;

export interface MessageSendKeys extends MessageBase {
  type: MessageType.SEND_KEYS;
  keys: Keys;
}

export interface MessageSendSignature extends MessageBase {
  type: MessageType.SEND_SIGNATURE;
  signature: string;
}

export interface MessageSendContent extends MessageBase {
  type: MessageType.SEND_CONTENT;
  content: string;
}

export interface MessageSendVerification extends MessageBase {
  type: MessageType.SEND_VERIFICATION;
  verification: Verification;
}

export type MessageToPopup =
  | MessageSendKeys
  | MessageSendContent
  | MessageSendSignature
  | MessageSendVerification;

export interface MessageGetContent extends MessageBase {
  type: MessageType.GET_CONTENT;
}

export interface MessageWriteSignature extends MessageBase {
  type: MessageType.WRITE_SIGNATURE;
  content: string;
  signature: string;
  publicKey: string;
}

export type MessageToContent = MessageGetContent | MessageWriteSignature;

export type Message = MessageToBackground | MessageToPopup | MessageToContent;

export async function sendToContent(message: MessageToContent) {
  const tabs = await browser.tabs.query({
    currentWindow: true,
    active: true,
  });
  const responses = [];
  for (const tab of tabs) {
    console.log("Sending message", message, "to content tab", tab.id);
    responses.push(browser.tabs.sendMessage(tab.id, message));
  }
  const response = await Promise.all(responses);
  console.log("Responded with", response);
  return response;
}

export function sendToBackground(message: MessageToBackground) {
  console.log("Sending message to background", message);
  return browser.runtime.sendMessage(message);
}

export function sendToPopup(message: MessageToPopup) {
  console.log("Sending message to popup", message);
  return browser.runtime.sendMessage(message);
}

export function listen(receiver: MessageTarget, listener: (_: Message) => Message | void) {
  return browser.runtime.onMessage.addListener((message: Message, _, sendResponse) => {
    console.log(`Received message in ${receiver}:`, message);
    const response = listener(message);
    console.log(`Responded with`, response);
    if (response) {
      sendResponse(response);
    }
  });
}
