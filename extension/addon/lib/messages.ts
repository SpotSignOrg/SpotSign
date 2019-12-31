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
  SEND_SIGNATURE_SUCCESS = "sendSignatureSuccess",
  SEND_SIGNATURE_FAIL = "sendSignatureFail",
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

export interface MessageGetSignature extends MessageBase {
  type: MessageType.GET_SIGNATURE;
  publicKey: string;
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
  publicKey: string;
}

export interface MessageSendSignatureSuccess extends MessageBase {
  type: MessageType.SEND_SIGNATURE_SUCCESS;
  signature: string;
}

export interface MessageSendSignatureFail extends MessageBase {
  type: MessageType.SEND_SIGNATURE_FAIL;
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
  | MessageSendSignatureSuccess
  | MessageSendSignatureFail
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

export const sendToBackground = (message: MessageToBackground) => {
  console.log("Sending message to background", message);
  return browser.runtime.sendMessage(message);
};

export const sendToPopup = (message: MessageToPopup) => {
  console.log("Sending message to popup", message);
  return browser.runtime.sendMessage(message);
};

export function listen(receiver: MessageTarget, listener: (_: Message) => Promise<Message | void>) {
  browser.runtime.onMessage.addListener(async (message: Message) => {
    console.log(`Received message in ${receiver}:`, message);
    const response = await listener(message);
    console.log(`Responded with`, response);
    return response;
  });
}
