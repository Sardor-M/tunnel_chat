import { useRef, useState, useEffect } from 'react';
import { animate } from 'motion';
import styled from 'styled-components';
import WebSocketService from '@/socket/websocket';
import Button from '@/components/Atoms/Button/Button';
import { fadeIn, subtleGlow } from '@/pages/Home/animations/animations';

type OnlineUser = {
    username: string;
    lastActive: number;
};

const UserIcon = styled.div<{ x: number; y: number }>`
    position: absolute;
    top: ${(props) => props.y}px;
    left: ${(props) => props.x}px;
    width: 30px;
    height: 30px;
    background: rgba(0, 255, 255, 0.2);
    border: 2px solid #0ff;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.4);
    transition: all 0.3s ease;

    &:hover {
        transform: translate(-50%, -50%) scale(1.1);
        background: rgba(0, 255, 255, 0.3);
        box-shadow: 0 0 20px rgba(0, 255, 255, 0.6);
    }
`;

const Container = styled.div`
    position: relative;
    width: 100%;
    background-color: black;
    overflow: visible;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0;
    justify-content: center;

    @media (max-width: 768px) {
        min-height: 100vh; // Changed to ensure full viewport height
        padding: 100px 20px;
    }
`;

const CanvasWrapper = styled.div`
    position: relative;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const StyledCanvas = styled.canvas`
    display: block;
    margin: 0 auto;
`;

const TextWrapper = styled.div<{ $show: boolean }>`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    opacity: ${(props) => (props.$show ? 1 : 0)};
    transition: opacity 0.5s ease-out;

    @media (max-width: 768px) {
        top: 90%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 1.5rem;
    }
`;

const UserLabel = styled.div`
    position: absolute;
    top: -25px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.7);
    color: #0ff;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
    pointer-events: none;
    z-index: 3;
    border: 1px solid rgba(0, 255, 255, 0.3);
    text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
`;

const GradientText = styled.h1`
    font-size: 2.5rem;
    font-weight: bold;
    font-family: monospace;
    letter-spacing: 0.1em;
    white-space: nowrap;
    background: linear-gradient(to right, #0ff, #2563eb);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    text-shadow: 0 0 10px rgba(0, 255, 255, 0.2);
`;

const SearchCircle = styled.div<{ size: number; opacity: number }>`
    position: absolute;
    top: 50%;
    left: 50%;
    width: ${(p) => p.size}px;
    height: ${(p) => p.size}px;
    border: 2px solid #0ff;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    opacity: ${(p) => p.opacity};
    pointer-events: none;
    box-shadow: 0 0 30px rgba(0, 255, 255, 0.2);
`;

const StatusMessage = styled.div`
    position: absolute;
    bottom: 90px;
    left: 0;
    right: 0;
    text-align: center;
    color: #0ff;
    font-family: monospace;
    text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
    font-size: 14px;
`;

const ButtonContainer = styled.div`
    display: flex;
    justify-content: center;
    width: 100%;
    margin-top: 0;

    @media (max-width: 768px) {
        margin-top: 100px;
    }
`;

const StyledButton = styled(Button)`
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

const ButtonContent = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
`;

const PulsingDot = styled.div`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #0ff;
    animation: pulse 1.5s infinite;

    @keyframes pulse {
        0% {
            transform: scale(0.8);
            opacity: 0.7;
        }
        50% {
            transform: scale(1.2);
            opacity: 1;
        }
        100% {
            transform: scale(0.8);
            opacity: 0.7;
        }
    }
`;

/**
 * TunnelHome - Main component for the tunnel chat
 * This component handles the animation of the tunnel, the connection to the WebSocket server,
 * and the display of online users.
 */
export default function TunnelHome() {
    const [isAnimating, setIsAnimating] = useState(false);
    const [animationComplete, setAnimationComplete] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('Disconnected');

    const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
    const [showSearchWave, setShowSearchWave] = useState(false);
    const [searchCircles, setSearchCircles] = useState<{ id: number; size: number; opacity: number }[]>([]);
    const [userPositions, setUserPositions] = useState<{ username: string; x: number; y: number }[]>([]);
    const [titleShow, setTitleShow] = useState(true);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const textRef = useRef<HTMLDivElement | null>(null);
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const socketRef = useRef<WebSocket | WebSocketService | null>(null);
    const animationStartTimeRef = useRef<number | null>(null);

    useEffect(() => {
        const ws = WebSocketService.getInstance();
        socketRef.current = ws;

        const handleOnlineUsers = (data: { users: OnlineUser[] }) => {
            setOnlineUsers(data.users || []);
            placeRandomUserIcons(data.users || []);
        };

        try {
            const initializeWebSocket = async () => {
                try {
                    await ws.connect();
                    setConnectionStatus('Connected to server');
                    console.log('WebSocket connected');

                    ws.addListener('ONLINE_USERS_UPDATE', handleOnlineUsers);
                } catch (error) {
                    setConnectionStatus('Connection error');
                    console.error('Failed to connect:', error);
                }
            };

            initializeWebSocket();
        } catch (error) {
            setConnectionStatus('Setup error');
            console.error('WebSocket setup error:', error);
        }

        return () => {
            try {
                if (ws) {
                    ws.removeListener('ONLINE_USERS_UPDATE', handleOnlineUsers);
                    ws.disconnect();
                }
            } catch (error) {
                console.error('Cleanup error:', error);
            }
        };
    }, []);

    const startAnimation = () => {
        if (!isAnimating && !animationComplete) {
            setIsAnimating(true);
            animationStartTimeRef.current = Date.now();
        }
    };

    useEffect(() => {
        startAnimation();
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const setCanvasSize = () => {
            const size = Math.min(window.innerWidth * 0.4, 400);
            canvas.width = size;
            canvas.height = size;
        };
        setCanvasSize();
        window.addEventListener('resize', setCanvasSize);

        let animationFrame: number;

        const drawTunnel = () => {
            if (!isAnimating || !animationStartTimeRef.current) return;

            const width = canvas.width;
            const height = canvas.height;
            const currentTime = Date.now();
            const elapsedTime = currentTime - animationStartTimeRef.current;
            const animationDuration = 1800;
            const animationProgress = Math.min(elapsedTime / animationDuration, 1);

            // animatsiyani clear qilamiz
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, width, height);

            ctx.save();
            ctx.translate(width / 2, height / 2);

            const linesCount = 48;
            const stepAngle = (2 * Math.PI) / linesCount;
            const radius = width * 0.35;

            for (let i = 0; i < linesCount; i++) {
                const lineProgress = animationProgress * linesCount;
                if (i <= lineProgress) {
                    ctx.save();
                    ctx.rotate(i * stepAngle);

                    const gradient = ctx.createLinearGradient(0, 0, radius, 0);
                    gradient.addColorStop(0, 'rgba(0, 149, 255, 0.8)');
                    gradient.addColorStop(1, 'rgba(0, 149, 255, 0.1)');

                    ctx.strokeStyle = gradient;
                    ctx.lineWidth = 1.5;

                    ctx.beginPath();
                    ctx.moveTo(0, 0);

                    // smooth ease-out
                    const easeOutCubic = (x: number): number => 1 - Math.pow(1 - x, 3);
                    const progressEased = easeOutCubic(
                        Math.min(1, Math.max(0, (animationProgress - i / linesCount) * 3)),
                    );
                    const lineLength = radius * progressEased;

                    ctx.lineTo(Math.max(0, lineLength), 0);
                    ctx.stroke();
                    ctx.restore();
                }
            }

            const centerGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 10);
            centerGrad.addColorStop(0, 'rgba(0, 149, 255, 0.8)');
            centerGrad.addColorStop(1, 'rgba(0, 149, 255, 0)');
            ctx.fillStyle = centerGrad;
            ctx.beginPath();
            ctx.arc(0, 0, 10, 0, Math.PI * 2);
            ctx.fill();

            if (animationProgress > 0.8) {
                const circleOpacity = (animationProgress - 0.8) * 5;
                ctx.beginPath();
                ctx.arc(0, 0, radius, 0, 2 * Math.PI);
                ctx.strokeStyle = `rgba(0, 149, 255, ${circleOpacity * 0.5})`;
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }

            ctx.restore();

            if (animationProgress >= 1) {
                setIsAnimating(false);
                setAnimationComplete(true);
                if (textRef.current) {
                    animate(
                        textRef.current,
                        {
                            opacity: [0, 1],
                            transform: ['translateY(20px)', 'translateY(0px)'],
                        },
                        {
                            duration: 0.8,
                            easing: 'ease-out',
                        },
                    );
                }
            } else {
                animationFrame = requestAnimationFrame(drawTunnel);
            }
        };

        if (isAnimating) {
            drawTunnel();
        }

        return () => {
            window.removeEventListener('resize', setCanvasSize);
            if (animationFrame) cancelAnimationFrame(animationFrame);
        };
    }, [isAnimating]);

    const handleSearch = async () => {
        try {
            setTitleShow(false);
            setShowSearchWave(true);
            startSearchCircles();

            const ws = socketRef.current as WebSocketService;

            if (ws && ws.isConnected()) {
                console.log('Requesting online users through WebSocketService');
                const success = ws.requestOnlineUsers();

                if (success) {
                    console.log('Successfully sent request for online users');
                    /* listener in the useEffect  will handle the response */
                    return;
                }

                console.warn('WebSocket request failed, falling back to HTTP API');
            }

            const res = await fetch('http://localhost:8080/api/users/online', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!res.ok) {
                throw new Error(`Server responded with status: ${res.status}`);
            }

            const data = await res.json();
            setOnlineUsers(data.users || []);
            placeRandomUserIcons(data.users || []);
            setConnectionStatus(`${data.onlineCount || 0} users online`);
        } catch (err) {
            console.error('Failed to fetch online users', err);
            setOnlineUsers([]);
            setConnectionStatus('Failed to fetch users: ' + (err instanceof Error ? err.message : 'Unknown error'));
        }
    };

    // 3 ta aylana animatsiyasini yaratamiz
    const startSearchCircles = () => {
        const circleConfigs = [0, 1, 2].map((_, i) => ({
            id: i,
            size: 0,
            opacity: 1,
        }));
        setSearchCircles(circleConfigs);

        const startTime = Date.now();
        let animationId: number;

        const animateCircles = () => {
            const now = Date.now();
            const elapsed = now - startTime;
            const duration = 1500;
            const t = Math.min(elapsed / duration, 1);

            setSearchCircles((oldCircles) =>
                oldCircles.map((c, index) => {
                    // har bir aylana vaqt bo'yicha offset
                    // 0, 200ms, 400ms delay
                    const delay = index * 200;
                    const localT = Math.min(Math.max(0, elapsed - delay) / 1000, 1);
                    const progress = localT;
                    // radius 400 ga yetadi
                    const size = progress * 400;
                    const opacity = 1 - progress;

                    return {
                        ...c,
                        size,
                        opacity: opacity < 0 ? 0 : opacity,
                    };
                }),
            );

            if (t < 1 + 0.5) {
                animationId = requestAnimationFrame(animateCircles);
            } else {
                // animatsiya tugallanganda aylanalarni yashirish
                setShowSearchWave(false);

                setTimeout(() => {
                    setTitleShow(true);
                }, 800);
            }
        };

        animateCircles();
        return () => cancelAnimationFrame(animationId);
    };

    const placeRandomUserIcons = (users: OnlineUser[]) => {
        if (!wrapperRef.current) return;
        const rect = wrapperRef.current.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;
        const centerX = w / 2;
        const centerY = h / 2;

        const newPositions = users.map((u) => {
            const angle = Math.random() * 2 * Math.PI;
            // markazdan 150px masofada
            const radius = Math.random() * 150;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            return { username: u.username, x, y };
        });
        setUserPositions(newPositions);
        console.log('User positions:', newPositions);
    };

    const startPrivateChat = (username: string) => {
        if (socketRef.current) {
            setConnectionStatus(`Initiating secure tunnel with ${username}...`);

            socketRef.current.send(
                JSON.stringify({
                    type: 'PRIVATE_CHAT_REQUEST',
                    targetUser: username,
                }),
            );

            setTimeout(() => {
                setConnectionStatus(`Secure tunnel request sent to ${username}`);
            }, 1000);
        }
    };

    return (
        <Container>
            <CanvasWrapper ref={wrapperRef}>
                <StyledCanvas ref={canvasRef} />
                {animationComplete && titleShow && (
                    <TextWrapper ref={textRef} $show={animationComplete}>
                        <GradientText>:tunnel_chat</GradientText>
                    </TextWrapper>
                )}

                {/* to'lqin animatsiyasini yaratamiz */}
                {showSearchWave &&
                    searchCircles.map((c) => <SearchCircle key={c.id} size={c.size} opacity={c.opacity} />)}

                {/* user iconlarni yaratamiz */}
                {userPositions.map((pos) => (
                    <UserIcon
                        key={pos.username}
                        x={pos.x}
                        y={pos.y}
                        onClick={() => startPrivateChat(pos.username)}
                        style={{ cursor: 'pointer' }}
                    >
                        <UserLabel>{pos.username}</UserLabel>
                    </UserIcon>
                ))}
            </CanvasWrapper>
            <ButtonContainer>
                <StyledButton onClick={handleSearch} variant="ghost" rounded={true} position="center">
                    <ButtonContent>
                        <PulsingDot />
                        Find friends
                    </ButtonContent>
                </StyledButton>
            </ButtonContainer>
            <StatusMessage>
                {connectionStatus} • {onlineUsers.length > 0 ? `${onlineUsers.length} users online` : 'No users found'}
            </StatusMessage>
        </Container>
    );
}
