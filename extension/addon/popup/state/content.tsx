import * as React from "react";

import {
  listen,
  sendToContent,
  MessageType,
  MessageTarget,
  MessageToPopup,
} from "addon/lib/messages";

type Content = string;

export enum ContentActions {
  GET_CONTENT = "getContent",
  SEND_CONTENT = "sendContent",
}

export interface GetContentAction {
  type: ContentActions.GET_CONTENT;
}

export interface SendContentAction {
  type: ContentActions.SEND_CONTENT;
  content: Content;
}

export type ContentAction = GetContentAction | SendContentAction;

const initialContent: Content = "No Content";

const reducer = (state: Content, action: ContentAction) => {
  switch (action.type) {
    case ContentActions.GET_CONTENT:
      console.log("get Content action");
      sendToContent({
        type: MessageType.GET_CONTENT,
        sender: MessageTarget.POPUP,
      });
      return state;
    case ContentActions.SEND_CONTENT:
      console.log("send Content action");
      return action.content;
    default:
      return state;
  }
};

export const ContentContext = React.createContext([
  initialContent,
  (action: ContentAction) => action,
] as [Content, React.Dispatch<ContentAction>]);

export const ContentProvider: React.FunctionComponent = ({ children }) => {
  const [content, contentDispatch] = React.useReducer(reducer, initialContent);

  React.useEffect(() => {
    listen(MessageTarget.POPUP, (message: MessageToPopup) => {
      if (message.type === MessageType.SEND_CONTENT) {
        contentDispatch({
          type: ContentActions.SEND_CONTENT,
          content: message.content,
        });
      }
    });
  });

  return (
    <ContentContext.Provider value={[content, contentDispatch]}>{children}</ContentContext.Provider>
  );
};

export const useContent = () => React.useContext(ContentContext);
