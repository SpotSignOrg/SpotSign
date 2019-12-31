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
  CONTENT_SIGNED_SUCCESS = "sendSignatureSuccess",
  CONTENT_SIGNED_FAIL = "sendSignatureFail",
  GET_VERIFICATION = "getVerification",
  SEND_VERIFICATION_SUCCESS = "sendVerificationSuccess",
  SEND_VERIFICATION_FAIL = "sendVerificationFail",
  WRITE_SIGNATURE = "writeSignature",
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
}

export interface MessageGetVerification extends MessageBase {
  type: MessageType.GET_VERIFICATION;
  publicKey: string;
  content: string;
  signature: string;
}

export type MessageToBackground = MessageGetKeys | MessageSignContent | MessageGetVerification;

export interface MessageSendKeys extends MessageBase {
  type: MessageType.SEND_KEYS;
  publicKey: string;
  privateKey: string;
}

export interface MessageContentSignedSuccess extends MessageBase {
  type: MessageType.CONTENT_SIGNED_SUCCESS;
}

export interface MessageContentSignedFail extends MessageBase {
  type: MessageType.CONTENT_SIGNED_FAIL;
}

export interface MessageSendContent extends MessageBase {
  type: MessageType.SEND_CONTENT;
  content: string;
}

export interface MessageSendVerificationSuccess extends MessageBase {
  type: MessageType.SEND_VERIFICATION_SUCCESS;
  datetime: string;
}

export enum VerificationFailReason {
  KEYS_NOT_FOUND = "keysNotFound",
  INVALID_SIGNATURE = "invalidSignature",
}

export interface MessageSendVerificationFail extends MessageBase {
  type: MessageType.SEND_VERIFICATION_FAIL;
  reason: VerificationFailReason;
}

export type MessageToPopup =
  | MessageSendKeys
  | MessageSendContent
  | MessageContentSignedSuccess
  | MessageContentSignedFail
  | MessageSendVerificationSuccess
  | MessageSendVerificationFail;

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

export const sendToContent = async (message: MessageToContent) => {
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
};

export const sendToBackground = async (message: MessageToBackground) => {
  console.log("Sending message to background", message);
  const response = await browser.runtime.sendMessage(message);
  console.log("Received response from background", response);
  return response;
};

export const sendToPopup = async (message: MessageToPopup) => {
  console.log("Sending message to popup", message);
  const response = await browser.runtime.sendMessage(message);
  console.log("Received response from popup", response);
  return response;
};

export function listen(receiver: MessageTarget, listener: (_: Message) => Promise<Message | void>) {
  browser.runtime.onMessage.addListener(async (message: Message) => {
    console.log(`Received message in ${receiver}:`, message);
    const response = await listener(message);
    console.log(`Responded with`, response);
    return response;
  });
}
