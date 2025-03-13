import React from "react";
import { TunnelChatUserProvider } from "./context/TunnelChatUserContext";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./layout/Layout";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Login from "./pages/Login";

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
