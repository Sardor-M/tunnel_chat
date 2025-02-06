import React from "react";
import styled from "styled-components";
import Footer from "../components/footer";
import Header from "../components/header";

const Container = styled.div`
  justify-content: flex-start;
  align-items: center;
  border-left: 1px solid #f2f2f2;
  border-right: 1px solid #f2f2f2;
  z-index: 1;
  position: relative;
  font-style: normal;
  max-width: 600px;
  height: 100vh;
  margin: 0 auto;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

// const Header = styled.header`
//   margin-top: 40px;          /* 40px down from top */
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   background: transparent;   /* transparent header */
// `;

const NavButton = styled.button`
  margin: 0 10px;
  border: 2px solid #808080;
  color: #fff;
  padding: 8px 16px;
  cursor: pointer;
  border-radius: 10px;
  background: transparent;

  &:hover {
    background: #555;
  }
`;

const BodyContainer = styled.div`
  margin-top: 55px;
  overflow-y: auto;
  height: calc(100vh - 60px);
  height: calc(-webkit-fill-available - 60px);
  width: 100%;

  // we hide the scrollbar
  &::-webkit-scrollbar {
    display: none;
  }

  // we make the it non-scrabble in other browsers
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <html>
      <body>
        <Container>
          <Header />
          {/* <Header>
            <NavButton onClick={() => (window.location.href = "/login")}>Home</NavButton>
            <NavButton>MyPage</NavButton>
            <NavButton>Chat</NavButton>
          </Header> */}
          <BodyContainer>{children}</BodyContainer>
          <Footer />
        </Container>
      </body>
    </html>
  );
}
