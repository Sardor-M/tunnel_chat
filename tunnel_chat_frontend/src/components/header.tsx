import { useState } from "react";
import styled from "styled-components";
import { IoIosArrowBack } from "react-icons/io";
import { IoLogOutOutline } from "react-icons/io5";
import { Button, Modal } from "antd";
import { Slant as Hamburger } from "hamburger-react";

const Container = styled.div`
  position: absolute;
  top: 0;
  max-width: none;
  border-bottom: none;
  width: 100%;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 100;
  background: #1c77c3;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
`;

// const Logo = styled.img`
//   position: absolute;
//   top: 10px;
//   left: 10px;
//   height: 40px;
//   transition: all 0.2s ease-in-out;

//   &:hover {
//     filter: contrast(0%) brightness(0%);
//   }
// `;

const BackButton = styled.div`
  width: 40px;
  height: 30px;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 28px;
  border: 1.5px solid black;
  border-radius: 5px;
  padding-top: 4px;
`;

const Title = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 18px;
`;

const HamburgerMenu = styled.div`
  position: absolute;
  right: 6px;
  display: flex;
  align-items: center;
  z-index: 2;
  padding: 0 22px;
  margin: 0;
`;

const Menu = styled.div<{ isOpen: boolean }>`
  position: absolute;
  padding-top: 20px;
  top: ${({ isOpen }) => (isOpen ? "0" : "-250px")};
  left: 0;
  width: 100%;
  background-color: #1c77c3;
  color: white;
  transition: top 0.3s ease-in-out;
  padding-bottom: 20px;
  z-index: 1;
`;

const MenuList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
  text-align: center;
`;

const MenuItem = styled.li`
  margin-bottom: 30px;
  font-size: 20px;
  font-weight: 700;

  a {
    position: relative;
    text-decoration: none;
    color: #000000;
    font-weight: 700;
    overflow: hidden;
    display: inline-block;
    transition: color 0.3s ease;
  }

  a:hover {
    color: transparent;
  }

  a::after {
    content: attr(data-hover);
    position: absolute;
    left: 0;
    top: -100%;
    width: 100%;
    text-align: center;
    color: #f39237;
    font-weight: 700;
    transition: top 0.3s ease;
  }

  a:hover::after {
    top: 0;
  }
`;

const LogoutButtonContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const DimOverlay = styled.div<{ isOpen: boolean }>`
  display: ${({ isOpen }) => (isOpen ? "block" : "none")};
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1;
`;

export default function Header() {
  const [isOpen, setOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  //   const [title, setTitle] = useState<string>("Home");

  const handleBack = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleConfirmBack = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Container>
        <BackButton onClick={handleBack}>
          <IoIosArrowBack />
        </BackButton>
        {/* <Title>{title}</Title> */}
        <HamburgerMenu>
          <Hamburger toggled={isOpen} size={20} toggle={setOpen} />
        </HamburgerMenu>
      </Container>
      <DimOverlay isOpen={isOpen} onClick={() => setOpen(false)} />
      <Menu isOpen={isOpen}>
        <MenuList>
          <MenuItem>
            <a href="/" data-hover="Home!">
              Home
            </a>
          </MenuItem>
          <MenuItem>
            <a href="/login" data-hover="Login!">
              Login
            </a>
          </MenuItem>
          <MenuItem>
            <a href="/chat" data-hover="Chat!">
              Chat
            </a>
          </MenuItem>
          <MenuItem>
            <a href="/myPage" data-hover={`My Page!`}>
              My Page
            </a>
          </MenuItem>
        </MenuList>
        <LogoutButtonContainer>
          <Button
            type="primary"
            shape="default"
            icon={<IoLogOutOutline />}
            style={{ backgroundColor: "#D4D4D4", color: "#000" }}
          >
            Logout
          </Button>
        </LogoutButtonContainer>
      </Menu>
      <Modal
        title="Go Back"
        open={isModalOpen}
        onCancel={handleCancel}
        width={450}
        centered
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Stay
          </Button>,
          <Button key="back" type="primary" onClick={handleConfirmBack}>
            Go Back
          </Button>,
        ]}
      >
        Are you sure you want to go back?
      </Modal>
    </>
  );
}
