import styled from 'styled-components';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { bounceAnimation, fadeIn, float, pulse, slideUp, subtleGlow } from '@/pages/Home/animations/animations';

type LandingAnimationProps = {
    onScrollDown?: () => void;
};

type CircleStyledProps = {
    size: number;
    x: string;
    y: string;
    delay: number;
    color: string;
};

const Container = styled.div`
    width: 100%;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: linear-gradient(to bottom, #000000, #0b0b15);
    position: relative;
    overflow: hidden;
    padding: 20px;

    @media (max-width: 768px) {
        padding: 15px 10px;
    }
`;

const ContentWrapper = styled.div`
    max-width: 1200px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 2;
    margin-top: -40px;
    margin-bottom: 80px;
`;

const SubTitle = styled.div`
    font-size: 16px;
    margin-bottom: 5px;
    font-weight: 500;
    animation: ${fadeIn} 1.2s ease-out forwards;
    opacity: 0;
    animation-delay: 0.2s;
    font-family: monospace;
    color: #3f87db;

    @media (max-width: 768px) {
        font-size: 0.8rem;
        margin: 0 0 20px 0;
    }

    @media (max-width: 480px) {
        font-size: 0.7rem;
        margin: 0 0 15px 0;
    }
`;

const MainTitle = styled.h1`
    font-size: 4rem;
    font-weight: 900;
    margin: 0 0 15px 0;
    line-height: 1;
    text-align: center;
    opacity: 0;
    padding: 20px;
    animation: ${fadeIn} 1.2s ease-out forwards;
    animation-delay: 0.4s;

    .tunnel-text {
        color: transparent;
        -webkit-text-stroke: 2px #3f87db;
        text-shadow: 0 0 10px rgba(63, 135, 219, 0.3);
        letter-spacing: 2px;
    }

    .chat-text {
        position: relative;
        color: #000;
        font-family: monospace;
        background-color: #3f87db;
        padding: 0 12px;
        border-radius: 3px;
        margin-left: 5px;
        animation: ${pulse} 4s ease-in-out infinite;
    }

    @media (max-width: 768px) {
        font-size: 2.8rem;
        padding: 10px;

        .tunnel-text {
            -webkit-text-stroke: 1.5px #3f87db;
        }
    }

    @media (max-width: 480px) {
        font-size: 2.2rem;
        padding: 5px;

        .tunnel-text {
            -webkit-text-stroke: 1px #3f87db;
            letter-spacing: 1px;
        }
    }
`;

const Subtitle = styled.div`
    font-size: 0.9rem;
    margin: 0 0 30px 0;
    color: rgba(255, 255, 255, 0.8);
    font-weight: 300;
    text-align: center;
    opacity: 0;
    animation: ${fadeIn} 1.2s ease-out forwards;
    animation-delay: 0.6s;
    font-family: monospace;

    @media (max-width: 768px) {
        font-size: 1.5rem;
    }
`;

const QRCodeCard = styled.div`
    transform: rotate(-3deg);
    transition:
        transform 0.5s ease,
        box-shadow 0.5s ease;
    animation: ${float} 10s ease-in-out infinite;
    animation-delay: 1.5s;
    background: rgba(19, 43, 81, 0.8);
    border-radius: 20px;
    padding: 15px;
    box-shadow: 0 5px 15px rgba(63, 135, 219, 0.3);
    border: 1px solid rgba(63, 135, 219, 0.5);

    &:nth-child(2) {
        transform: rotate(3deg);
        animation-delay: 3s;
    }

    &:hover {
        transform: rotate(0) scale(1.05);
        border-color: rgba(63, 135, 219, 1);
        box-shadow: 0 10px 25px rgba(63, 135, 219, 0.5);
    }

    img {
        width: 150px;
        height: 150px;
        object-fit: cover;
        border-radius: 10px;
        filter: hue-rotate(180deg) brightness(1.2);
        transition: filter 0.3s ease;
    }

    &:hover img {
        filter: hue-rotate(180deg) brightness(1.4);
    }

    @media (max-width: 768px) {
        img {
            width: 150px;
            height: 150px;
        }
    }
    @media (max-width: 768px) {
        padding: 10px;

        img {
            width: 120px;
            height: 120px;
        }
    }

    @media (max-width: 480px) {
        transform: rotate(0deg) !important;
        margin-bottom: 15px;

        img {
            width: 100px;
            height: 100px;
        }

        &:nth-child(2) {
            transform: rotate(0deg) !important;
        }
    }
`;

const Button = styled(Link)`
    color: #3f87db;
    border: 1px solid #3f87db;
    background: transparent;
    padding: 12px 25px;
    border-radius: 30px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    margin-top: 30px;
    transition: all 0.5s ease;
    opacity: 0;
    animation:
        ${fadeIn} 1.2s ease-out forwards,
        ${subtleGlow} 6s ease-in-out infinite;
    animation-delay: 1.5s;
    font-family: monospace;

    &:hover {
        background: rgba(42, 141, 254, 0.1);
        box-shadow: 0 8px 20px rgba(63, 135, 219, 0.3);
        transform: translateY(-3px);
    }
    @media (max-width: 768px) {
        padding: 10px 20px;
        font-size: 14px;
        margin-top: 25px;
    }

    @media (max-width: 480px) {
        width: 80%;
        text-align: center;
    }
`;

const QRCodeContainer = styled.div`
    display: flex;
    justify-content: center;
    gap: 30px;
    margin-top: 25px;
    flex-wrap: wrap;
    opacity: 0;
    animation: ${slideUp} 1.5s ease-out forwards;
    animation-delay: 1s;
`;

const GradientOverlay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at center, transparent 30%, #0b0b15 100%);
    z-index: 1;
`;

const Circle = styled.div<CircleStyledProps>`
    position: absolute;
    width: ${(props) => props.size}px;
    height: ${(props) => props.size}px;
    border-radius: 50%;
    background: ${(props) => props.color};
    top: ${(props) => props.y};
    left: ${(props) => props.x};
    opacity: 0.15;
    filter: blur(${(props) => props.size / 10}px);
    animation: ${float} ${(props) => 20 + props.delay}s ease-in-out infinite;
    animation-delay: ${(props) => props.delay}s;
    z-index: 1;
`;

const ContainerScroll = styled.div`
    position: absolute;
    bottom: 60px;
    left: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    animation: ${fadeIn} 1s ease-in-out;
    z-index: 10;
`;

const ScrollDownText = styled.div`
    color: #3f87db;
    font-family: monospace;
    font-size: 14px;
    margin-bottom: 15px;
    text-transform: uppercase;
    letter-spacing: 2px;
    text-shadow: 0 0 5px rgba(70, 145, 249, 0.5);
`;

const DownArrow = styled.div`
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: ${bounceAnimation} 2s infinite;
    cursor: pointer;
    position: relative;

    &:after {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        background: #3f87db;
        border-radius: 50%;
        filter: blur(15px);
        z-index: -1;
    }

    svg {
        fill: rgba(255, 255, 255, 0.95);
        width: 20px;
        height: 20px;
    }
`;

/**
 * Landing page component for Tunnel Chat
 * This component is a landing page with animated background and feature highlights
 * @param {LandingAnimationProps} props - Component props
 */
export default function LandingHome({ onScrollDown }: LandingAnimationProps) {
    // we store image sources in state to prevent re renders
    const [imageSources] = useState({
        image1: '/src/assets/chat.png',
        image2: '/src/assets/file1.png',
    });

    const handleScrollDown = () => {
        if (onScrollDown) {
            onScrollDown();
        } else {
            window.scrollTo({
                top: window.innerHeight,
                behavior: 'smooth',
            });
        }
    };

    // defining a  circle props outside the render method to prevent recreating on each render
    const circleProps = [
        { size: 200, x: '10%', y: '20%', delay: 0, color: '#3f87db' },
        { size: 150, x: '70%', y: '15%', delay: 5, color: '#3f87db' },
        { size: 300, x: '80%', y: '60%', delay: 10, color: '#3f87db' },
        { size: 180, x: '20%', y: '70%', delay: 15, color: '#3f87db' },
    ];

    return (
        <>
            <Container>
                <GradientOverlay />
                {/* we map over circle props array instead of individual renders */}
                {circleProps.map((props, index) => (
                    <Circle
                        key={`circle-${index}`}
                        size={props.size}
                        x={props.x}
                        y={props.y}
                        delay={props.delay}
                        color={props.color}
                    />
                ))}
                <ContentWrapper>
                    <SubTitle>End-to-End Encrypted Communication</SubTitle>
                    <MainTitle>
                        <span className="tunnel-text">Tunnel</span>
                        <span className="chat-text">Chat</span>
                    </MainTitle>
                    <Subtitle>Secure • Private • Instant</Subtitle>
                    <QRCodeContainer>
                        <QRCodeCard>
                            <img
                                src={imageSources.image1}
                                alt="Encrypted chat example"
                                onError={(e) => {
                                    const target = e.currentTarget;
                                    if (target.src !== '/src/assets/chat.png') {
                                        target.src = '/src/assets/chat.png';
                                    }
                                    target.onerror = null;
                                }}
                            />
                        </QRCodeCard>
                        <QRCodeCard>
                            <img
                                src={imageSources.image2}
                                alt="File exchange example"
                                onError={(e) => {
                                    const target = e.currentTarget;
                                    if (target.src !== '/src/assets/file1.png') {
                                        target.src = '=/src/assets/file1.png';
                                    }
                                    target.onerror = null;
                                }}
                            />
                        </QRCodeCard>
                    </QRCodeContainer>
                    <Button to="/rooms"> 🚀 Start Secure Chat</Button>
                    <ContainerScroll>
                        <ScrollDownText>Discover Features</ScrollDownText>
                        <DownArrow onClick={handleScrollDown}>
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"></path>
                            </svg>
                        </DownArrow>
                    </ContainerScroll>
                </ContentWrapper>
            </Container>
        </>
    );
}
