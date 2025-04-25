import Footer from '@/components/Footer';
import Header from '@/components/Header';
import React from 'react';
import styled from 'styled-components';

type LayoutProps = {
    children: React.ReactNode;
};

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

export default function Layout({ children }: LayoutProps) {
    return (
        <html>
            <body>
                <Container>
                    <Header />
                    <BodyContainer>{children}</BodyContainer>
                    <Footer />
                </Container>
            </body>
        </html>
    );
}
