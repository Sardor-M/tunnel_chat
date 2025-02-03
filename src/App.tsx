import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";

const ChatContainer = styled.div`
  width: 400px;
  margin: 50px auto;
  padding: 20px;
  border-radius: 10px;
  background: #f4f4f4;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
`;

const MessagesContainer = styled.div`
  height: 300px;
  overflow-y: auto;
  border: 1px solid #ddd;
  padding: 10px;
  border-radius: 5px;
  background: #fff;
`;

const Message = styled.p`
  padding: 8px;
  background: #0084ff;
  color: white;
  border-radius: 5px;
  width: fit-content;
  max-width: 80%;
  margin-bottom: 5px;
`;

const InputContainer = styled.div`
  display: flex;
  margin-top: 10px;
`;

const Input = styled.input`
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  outline: none;
`;

const Button = styled.button`
  padding: 10px;
  margin-left: 5px;
  border: none;
  background: #0084ff;
  color: white;
  border-radius: 5px;
  cursor: pointer;
`;

const App: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    socketRef.current = new WebSocket("ws://localhost:8080");

    socketRef.current.onopen = () => console.log("Connected to server");

    socketRef.current.onmessage = (event) => {
      setMessages((prevMessages) => [...prevMessages, event.data]);
    };

    return () => {
      socketRef.current?.close();
    };
  }, []);

  const sendMessage = () => {
    if (socketRef.current && inputMessage.trim()) {
      
      socketRef.current.send(inputMessage);
      setMessages((prev) => [...prev, `You: ${inputMessage}`]);
      setInputMessage("");
    }
  };

  return (
    <ChatContainer>
      <h2>Real-Time Chat</h2>
      <MessagesContainer>
        {messages.map((msg, index) => (
          <Message key={index}>{msg}</Message>
        ))}
      </MessagesContainer>
      <InputContainer>
        <Input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
        />
        <Button onClick={sendMessage}>Send</Button>
      </InputContainer>
    </ChatContainer>
  );
};

export default App;
