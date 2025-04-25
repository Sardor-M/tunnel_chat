import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { IoIosArrowBack } from 'react-icons/io';
import { Squash as Hamburger } from 'hamburger-react';
import { useLogout } from '@/utils/useLogout';
import authService from '@/services/authService';
import Button from '@/components/Atoms/Button/Button';
import { IoLogOutOutline } from 'react-icons/io5';

const Container = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    max-width: none;
    border-bottom: none;
    width: 100%;
    height: 70px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 1000;
    background: #1c77c3;
    backdrop-filter: blur(5px);

    -webkit-backdrop-filter: blur(5px);
`;

const LogoutButtonContainer = styled.div`
    width: 100%;
    display: flex;
    justify-content: center;
`;

const BackButton = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 46px;
    height: 30px;
    margin-left: 25px;
    border-radius: 5px;
    font-size: 20px;
    cursor: pointer;
    background-color: transparent;
    color: #ffffff;
    transition:
        background-color 0.3s ease,
        transform 0.3s ease;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);

    &:hover {
        background-color: rgba(255, 255, 255, 0.15);
        transform: translateY(-2px);
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    }

    @media (max-width: 768px) {
        margin-left: 14px;
    }
`;

const HamburgerMenu = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    justify-items: center;
    width: 46px;
    height: 30px;
    margin-right: 25px;
    border-radius: 5px;
    font-size: 20px;
    cursor: pointer;
    background-color: transparent;
    color: #ffffff;
    transition:
        background-color 0.3s ease,
        transform 0.3s ease;

    &:hover {
        background-color: rgba(255, 255, 255, 0.15);
        transform: translateY(-2px);
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    }

    @media (max-width: 768px) {
        margin-right: 18px;
    }
`;

const Menu = styled.div<{ isOpen: boolean }>`
    position: absolute;
    padding-top: 70px;
    top: ${({ isOpen }) => (isOpen ? '0' : '-100%')};
    left: 0;
    width: 100%;
    background-color: #1c77c3;
    color: white;
    transition: top 0.3s ease-in-out;
    padding-bottom: 20px;
    z-index: 999;
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
`;

const DimOverlay = styled.div<{ isOpen: boolean }>`
    display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 998;
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
        color: rgb(255, 255, 255);
        font-weight: 700;
        transition: top 0.3s ease;
    }

    a:hover::after {
        top: 0;
    }
`;

export default function Header() {
    const [isOpen, setOpen] = useState<boolean>(false);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    const logout = useLogout();

    useEffect(() => {
        setIsLoggedIn(authService.isLoggedIn());

        const checkLoginStatus = () => {
            setIsLoggedIn(authService.isLoggedIn());
        };

        // simple way to update the header when localStorage changes
        window.addEventListener('storage', checkLoginStatus);

        return () => {
            window.removeEventListener('storage', checkLoginStatus);
        };
    }, []);

    const handleBack = () => {
        window.location.href = '/';
    };

    return (
        <div>
            <Container>
                <BackButton onClick={handleBack}>
                    <IoIosArrowBack />
                </BackButton>
                <HamburgerMenu>
                    <Hamburger toggled={isOpen} size={20} toggle={setOpen} direction="right" />
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

                    {isLoggedIn ? (
                        <MenuItem>
                            <a href="/myPage" data-hover={'My Page'}>
                                My Page
                            </a>
                        </MenuItem>
                    ) : (
                        <MenuItem>
                            <a href="/login" data-hover="Login!">
                                Login
                            </a>
                        </MenuItem>
                    )}
                    <MenuItem>
                        <a href="/rooms" data-hover="Rooms!">
                            Rooms
                        </a>
                    </MenuItem>
                    <MenuItem>
                        <a href="/chat" data-hover="Chat!">
                            Chat
                        </a>
                    </MenuItem>
                </MenuList>
                <LogoutButtonContainer>
                    <Button
                        icon={<IoLogOutOutline />}
                        rounded={true}
                        type="button"
                        onClick={() => {
                            logout();
                            setIsLoggedIn(false);
                        }}
                        position="center"
                        variant="cancel"
                    >
                        Logout
                    </Button>
                </LogoutButtonContainer>
            </Menu>
        </div>
    );
}
