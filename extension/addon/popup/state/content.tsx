import * as React from "react";

import {
  listen,
  sendToContent,
  MessageType,
  MessageTarget,
  MessageToPopup,
} from "addon/lib/messages";

const initialContent = "No Content";

export const ContentContext = React.createContext({
  content: initialContent,
  getContent: () => {},
});

export const ContentProvider: React.FunctionComponent = ({ children }) => {
  const [content, setContent] = React.useState(initialContent);

  const getContent = () =>
    sendToContent({ type: MessageType.GET_CONTENT, sender: MessageTarget.POPUP });

  React.useEffect(() => {
    listen(MessageTarget.POPUP, (message: MessageToPopup) => {
      if (message.type === MessageType.SEND_CONTENT) {
        setContent(message.content);
      }
    });
  });

  return (
    <ContentContext.Provider value={{ content, getContent }}>{children}</ContentContext.Provider>
  );
};

export const useContent = () => React.useContext(ContentContext);
