import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import Input from "../components/atoms/Input/Input";
import { MdDriveFileRenameOutline } from "react-icons/md";
import Button from "../components/atoms/Button/Button";

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  padding: 10px;
  background: black;
  color: white;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const MessageBubble = styled.div<{ isMine: boolean }>`
  max-width: 70%;
  padding: 10px;
  border-radius: 12px;
  background: ${({ isMine }) => (isMine ? "#3333FF" : "#222")};
  align-self: ${({ isMine }) => (isMine ? "flex-end" : "flex-start")};
`;

const InputContainer = styled.div`
  display: flex;
  padding: 10px;
  background: #111;
  border-top: 1px solid #333;
`;

// const Input = styled.input`
//   flex: 1;
//   padding: 10px;
//   border: none;
//   border-radius: 6px;
//   outline: none;
//   background: #222;
//   color: white;
// `;

// const SendButton = styled.button`
//   margin-left: 8px;
//   padding: 10px 16px;
//   border: none;
//   border-radius: 6px;
//   background: #3333ff;
//   color: white;
//   cursor: pointer;
//   transition: background 0.2s;

//   &:hover {
//     background: #2222ff;
//   }
// `;

export default function Chat() {
  const [messages, setMessages] = useState<{ text: string; isMine: boolean }[]>(
    []
  );
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { text: input, isMine: true }]);
    setInput("");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleInputBlur = () => {
    console.log("received the data: ");
  };

  return (
    <ChatContainer>
      <MessagesContainer>
        {messages.map((msg, index) => (
          <MessageBubble key={index} isMine={msg.isMine}>
            {msg.text}
          </MessageBubble>
        ))}
        <div ref={messagesEndRef} />
      </MessagesContainer>
      <InputContainer>
        {/* <Input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        /> */}
        <Input
          type="text"
          id="title"
          name="title"
          value={input}
          placeholder="Enter the name of the event"
          // value={eventData.title}
          onChange={(e) => setInput(e.target.value)}
          onBlur={handleInputBlur}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          // error={
          //   hasError.title ? "Please enter a valid title name" : ""
          // }
          icon={<MdDriveFileRenameOutline />}
        />
        <Button onClick={sendMessage} variant="submit">Send</Button>
      </InputContainer>
    </ChatContainer>
  );
}
