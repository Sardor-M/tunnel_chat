import React from "react";
import styled from "styled-components";
import { TunnelChatUserProvider } from "./context/TunnelChatUserContext";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./layout/Layout";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Login from "./pages/Login";

// const ChatContainer = styled.div`
//   width: 400px;
//   margin: 50px auto;
//   padding: 20px;
//   border-radius: 10px;
//   background: #f4f4f4;
//   box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
// `;

// const MessagesContainer = styled.div`
//   height: 300px;
//   overflow-y: auto;
//   border: 1px solid #ddd;
//   padding: 10px;
//   border-radius: 5px;
//   background: #fff;
// `;

// const Message = styled.p`
//   padding: 8px;
//   background: #0084ff;
//   color: white;
//   border-radius: 5px;
//   width: fit-content;
//   max-width: 80%;
//   margin-bottom: 5px;
// `;

// const InputContainer = styled.div`
//   display: flex;
//   margin-top: 10px;
// `;

// const Input = styled.input`
//   flex: 1;
//   padding: 10px;
//   border: 1px solid #ddd;
//   border-radius: 5px;
//   outline: none;
// `;

// const Button = styled.button`
//   padding: 10px;
//   margin-left: 5px;
//   border: none;
//   background: #0084ff;
//   color: white;
//   border-radius: 5px;
//   cursor: pointer;
// `;

const App: React.FC = () => {
  return (
    <TunnelChatUserProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TunnelChatUserProvider>
  );
};

export default App;
