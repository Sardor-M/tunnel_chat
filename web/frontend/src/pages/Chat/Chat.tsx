import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { EditIcon, SendIcon } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { message } from 'antd';
import WebSocketService from '@/socket/websocket';
import { AuthHandlerData, Message, MessageHandlerData, RoomInfo } from '@/types';
import RoomInfoDropdown from './RoomDropdown';
import Button from '@/components/Atoms/Button/Button';

const EVENT_HANDLERS = {
    AUTH: ['AUTH_RESPONSE', 'USERNAME_SET'],
    MESSAGES: ['MESSAGE', 'ROOM_JOINED', 'USER_JOINED', 'USER_LEFT', 'CHAT'],
};

const ChatContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    background: linear-gradient(to bottom, #1c1c1c, #111);
    padding-top: 8px;
    color: white;
    position: relative;
    overflow: hidden;
    flex: 1;
`;

const MessagesWrapper = styled.div`
    flex: 1;
    overflow: hidden;
    position: relative;
    display: flex;
    flex-direction: column;
`;

const MessagesContainer = styled.div`
    flex: 2;
    padding: 25px;
    padding-bottom: 5px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    overflow-y: auto;

    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
        display: none;
        width: 0;
        height: 0;
    }
`;

const InputArea = styled.div`
    padding: 25px;
    background-color: #111;
    border-top: 1px solid #222;
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    height: 60px;
    flex-shrink: 0;
`;

const StyledTextField = styled.div`
    flex: 1;
    position: relative;
`;

const TextInput = styled.input`
    width: 100%;
    background-color: #3339;
    color: white;
    border: 1px solid #444;
    border-radius: 12px;
    padding: 10px 12px;
    padding-right: 40px;
    outline: none;

    &:hover {
        border-color: #666;
    }

    &:focus {
        border-color: #4285f4;
    }

    &::placeholder {
        color: #999;
    }
`;

const IconButtonWrapper = styled.button`
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    background: transparent;
    border: none;
    color: #777;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
`;

const SendButton = styled.button`
    min-width: 60px;
    height: 38px;
    border-radius: 15px;
    background-color: #4285f4;
    color: white;
    border: none;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        background-color: #3c78d8;
    }

    svg {
        font-size: 1.5rem;
    }
`;

const SystemMessage = styled.div`
    align-self: center;
    background-color: rgba(255, 255, 255, 0.1);
    color: #aaa;
    font-size: 0.9rem;
    padding: 8px 16px;
    border-radius: 16px;
    margin: 4px 0;
    max-width: 80%;
`;

const MessageRow = styled.div<{ isMine: boolean }>`
    display: flex;
    width: 100%;
    justify-content: ${(props) => (props.isMine ? 'flex-end' : 'flex-start')};
    margin-bottom: 16px;
`;

const MessageContentContainer = styled.div<{ isMine: boolean }>`
    display: flex;
    flex-direction: column;
    max-width: 75%;
    align-items: ${(props) => (props.isMine ? 'flex-end' : 'flex-start')};
`;

const SenderName = styled.div`
    font-size: 12px;
    color: #aaa;
    margin-bottom: 2px;
    padding-left: 4px;
`;

const MessageBubble = styled.div<{ isMine: boolean }>`
    padding: 12px 16px;
    border-radius: ${(props) => (props.isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px')};
    background-color: ${(props) => (props.isMine ? '#4F46E5' : '#333333')};
    color: white;
    word-break: break-word;
    margin-bottom: 2px;
`;

const TimeStamp = styled.div<{ isMine: boolean }>`
    font-size: 11px;
    color: #999;
    margin-top: 2px;
    text-align: ${(props) => (props.isMine ? 'right' : 'left')};
    padding: 0 4px;
`;

const EmptyChatContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    color: #aaa;
    text-align: center;
    padding: 2rem;
`;

const EmptyChatTitle = styled.h2`
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: #fff;
    font-weight: 500;
`;

const EmptyChatDescription = styled.p`
    font-size: 1rem;
    max-width: 500px;
    line-height: 1.5;
    margin-bottom: 2rem;
`;

export default function Chat() {
    const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [currentUsername, setCurrentUsername] = useState(localStorage.getItem('username') || 'Anonymous');
    const [socket, setSocket] = useState<WebSocketService | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const hasJoinedRef = useRef(false);
    const handlersRef = useRef({
        messages: null as ((data: MessageHandlerData) => void) | null,
        auth: null as ((data: AuthHandlerData) => void) | null,
    });

    const { roomId } = useParams();
    const navigate = useNavigate();

    // here we reset the join flag when roomId changes
    useEffect(() => {
        hasJoinedRef.current = false;
    }, [roomId]);

    useEffect(() => {
        const ws = WebSocketService.getInstance();
        setSocket(ws);

        const setupConnection = async () => {
            try {
                if (!ws.isConnected()) {
                    await ws.connect();
                    console.log('Connected to WebSocket server');

                    const token = localStorage.getItem('token');

                    if (token) {
                        ws.send({
                            type: 'AUTH',
                            token,
                        });
                    } else {
                        ws.send({
                            type: 'SET_USERNAME',
                            username: currentUsername,
                        });
                    }

                    if (roomId && !hasJoinedRef.current) {
                        hasJoinedRef.current = true;
                        setTimeout(() => {
                            console.log('Joining room after auth delay:', roomId);
                            hasJoinedRef.current = true;
                            ws.send({
                                type: 'JOIN_ROOM',
                                roomId,
                                username: currentUsername,
                            });
                        }, 300);
                    }
                }
            } catch (error) {
                console.error('Failed to connect to WebSocket server:', error);
                hasJoinedRef.current = false;
                // we try to reconnect after 3 seconds
                setTimeout(setupConnection, 3000);
            }
        };

        const pingInterval = setInterval(() => {
            if (ws.isConnected()) {
                ws.send({ type: 'PING' });
            } else {
                console.log('Connection lost. Reconnecting...');
                hasJoinedRef.current = false; // Reset flag
                setupConnection();
            }
        }, 1500);

        setupConnection();

        if (roomId) {
            // if already connected, just join to the room
            if (!hasJoinedRef.current) {
                // added this in order to mark as joined
                hasJoinedRef.current = true;
                ws.send({
                    type: 'JOIN_ROOM',
                    roomId,
                    username: currentUsername,
                });
            }
        }

        const handleMessages = (data: any) => {
            if (data.type === 'CHAT') {
                console.log('Received chat message:', {
                    sender: data.sender,
                    username: currentUsername,
                    isMine: data.sender === currentUsername,
                    message: data.message,
                });
            }

            try {
                if (data.type === 'ROOM_JOINED') {
                    setRoomInfo({
                        id: data.roomId,
                        name: data.room?.name || data.roomName || 'Unknown Room',
                        activeUsers: data.activeUsers || data.room?.members?.length || 1,
                        messageCount: data.messageCount || 0,
                        isPrivate: data.room?.isPrivate || data.isPrivate || false,
                        isEncrypted: data.room?.isEncrypted || data.isEncrypted || false,
                    });

                    localStorage.removeItem('currentRoom');
                }

                if (data.type === 'USER_JOINED') {
                    if (roomInfo) {
                        setRoomInfo({
                            ...roomInfo,
                            activeUsers: data.activeUsers || roomInfo.activeUsers + 1,
                        });
                    }

                    message.info({
                        content: `${data.username} joined the room`,
                        duration: 3,
                    });
                }
                if (data.type === 'USER_LEFT') {
                    if (roomInfo) {
                        setRoomInfo({
                            ...roomInfo,
                            activeUsers: Math.max(1, data.activeUsers || roomInfo.activeUsers - 1),
                        });
                    }

                    message.info({
                        content: `${data.username} left the room`,
                        duration: 3,
                    });
                }
                if (data.type === 'CHAT') {
                    if (data.sender === 'system' || data.message.startsWith('system :')) {
                        const messageText = data.message.startsWith('system :')
                            ? data.message.substring(8).trim()
                            : data.message;
                        const isJoinMessage = messageText.includes('joined') && messageText.includes('room');

                        if (isJoinMessage) {
                            // Only display a notification for join messages
                            if (data.username !== username) {
                                // Only notify for OTHER users joining
                                message.info({
                                    content: messageText,
                                    duration: 3,
                                });
                            }
                            return;
                        }

                        const isDuplicate = messages.some((msg) => msg.isSystem && msg.text === messageText);

                        if (!isDuplicate) {
                            // we add the message
                            setMessages((prev) => [
                                ...prev,
                                {
                                    text: messageText,
                                    isMine: false,
                                    isSystem: true,
                                    timestamp: new Date(data.timestamp || Date.now()),
                                },
                            ]);
                        }
                    } else {
                        const isMine = data.sender === currentUsername;
                        // const text = isMine ? data.message : `${data.sender}: ${data.message}`;
                        const isDuplicate = messages.some(
                            (msg) =>
                                !msg.isSystem &&
                                msg.rawMessage === data.message &&
                                msg.isMine === isMine &&
                                msg.timestamp &&
                                Math.abs(msg.timestamp.getTime() - (data.timestamp || Date.now())) < 100,
                        );

                        if (!isDuplicate) {
                            setMessages((prev) => [
                                ...prev,
                                {
                                    text: data.message,
                                    isMine: isMine,
                                    sender: data.sender,
                                    rawMessage: data.message,
                                    timestamp: new Date(data.timestamp || Date.now()),
                                    // messageId,
                                },
                            ]);
                        }
                    }
                }
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        const handleAuth = (data: any) => {
            try {
                if (data.type === 'AUTH_RESPONSE' && data.success) {
                    setIsAuthenticated(true);
                    if (data.username) {
                        localStorage.setItem('username', data.username);
                        setCurrentUsername(data.username);
                    }
                } else if (data.type === 'USERNAME_SET' && data.success) {
                    setIsAuthenticated(true);
                    if (data.username) {
                        localStorage.setItem('username', data.username);
                        setCurrentUsername(data.username);
                    }
                }
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        // we store the handlers in refs for cleanup
        handlersRef.current.messages = handleMessages;
        handlersRef.current.auth = handleAuth;

        setupWebSocketEventListener(ws, EVENT_HANDLERS.AUTH, handleAuth, 'add');
        setupWebSocketEventListener(ws, EVENT_HANDLERS.MESSAGES, handleMessages, 'add');

        return () => {
            clearInterval(pingInterval);
            //  we clean up the listeners safely
            if (handlersRef.current.auth) {
                setupWebSocketEventListener(ws, EVENT_HANDLERS.AUTH, handlersRef.current.auth, 'remove');
            }
            if (handlersRef.current.messages) {
                setupWebSocketEventListener(ws, EVENT_HANDLERS.MESSAGES, handlersRef.current.messages, 'remove');
            }
        };
    }, [roomId, currentUsername]);

    useEffect(() => {
        if (!isAuthenticated || !socket || hasJoinedRef.current) return;

        const storedRoom = localStorage.getItem('currentRoom');
        const roomData = storedRoom ? JSON.parse(storedRoom) : null;
        const currentRoomId = roomId || (roomData ? roomData.id : null);

        if (currentRoomId) {
            console.log('Joining room:', currentRoomId);
            hasJoinedRef.current = true;

            socket.send({
                type: 'JOIN_ROOM',
                roomId: currentRoomId,
                username: currentUsername,
            });

            // we pre-populate room info if available
            if (roomData && !roomInfo) {
                setRoomInfo({
                    id: roomData.id,
                    name: roomData.name,
                    activeUsers: roomData.memberCount || 1,
                    messageCount: 0,
                    isPrivate: roomData.isPrivate || false,
                    isEncrypted: roomData.isEncrypted || false,
                });
            }
        }
    }, [isAuthenticated, socket, roomId, currentUsername]);

    const setupWebSocketEventListener = (
        ws: WebSocketService,
        events: string[],
        handler: (data: any) => void,
        action: 'add' | 'remove',
    ) => {
        events.forEach((event) => {
            action === 'add' ? ws.addListener(event, handler) : ws.removeListener(event, handler);
        });
    };

    // scroll to bottom when messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }, [messages]);

    // scroll to bottom on initial load
    useEffect(() => {
        if (messagesEndRef.current && messages.length > 0) {
            messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
        }
    }, []);

    const sendMessage = () => {
        if (!input.trim() || !socket || !roomInfo) return;

        const chatMsg = {
            type: 'CHAT',
            roomId: roomInfo.id,
            message: input,
            isEncrypted: roomInfo.isEncrypted,
        };

        socket.send(chatMsg);
        setInput('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const formatMessageTime = (date?: Date) => {
        if (!date) return '';
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleLeaverRoom = () => {
        if (!socket || !roomInfo) return;

        socket.send({
            type: 'LEAVE_ROOM',
            roomId: roomInfo.id,
            username: currentUsername,
        });
    };

    return (
        <ChatContainer>
            {roomId ? (
                <>
                    <RoomInfoDropdown roomInfo={roomInfo} onLeaveRoom={handleLeaverRoom} />
                    <MessagesWrapper>
                        <MessagesContainer>
                            {messages.map((msg, index) => {
                                if (msg.isSystem) {
                                    return <SystemMessage key={index}>{msg.text}</SystemMessage>;
                                }

                                return (
                                    <MessageRow key={index} isMine={msg.isMine}>
                                        <MessageContentContainer isMine={msg.isMine}>
                                            {!msg.isMine && msg.sender && <SenderName>{msg.sender}</SenderName>}

                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <MessageBubble isMine={msg.isMine}>
                                                    {msg.rawMessage || msg.text}
                                                </MessageBubble>
                                            </motion.div>

                                            <TimeStamp isMine={msg.isMine}>
                                                {formatMessageTime(msg.timestamp)}
                                            </TimeStamp>
                                        </MessageContentContainer>
                                    </MessageRow>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </MessagesContainer>
                    </MessagesWrapper>

                    <InputArea>
                        <StyledTextField>
                            <TextInput
                                placeholder="Type a message..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                            />
                            <IconButtonWrapper>
                                <EditIcon size={24} />
                            </IconButtonWrapper>
                        </StyledTextField>
                        <SendButton onClick={sendMessage}>
                            <SendIcon size={20} />
                        </SendButton>
                    </InputArea>
                </>
            ) : (
                <EmptyChatContainer>
                    <EmptyChatTitle>Hey, welcome back !</EmptyChatTitle>
                    <EmptyChatDescription>
                        Please go to rooms and select the room you would like to join and chat with people.
                    </EmptyChatDescription>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Button
                            onClick={() => navigate('/rooms')}
                            variant="outline"
                            fullWidth={true}
                            rounded={true}
                            size="medium"
                        >
                            {' '}
                            🚀 Join the Rooms
                        </Button>
                    </div>
                </EmptyChatContainer>
            )}
        </ChatContainer>
    );
}
