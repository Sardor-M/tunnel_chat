import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { EditIcon, SendIcon } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { message } from 'antd';
import RoomJoin from '@/components/Notification/RoomJoin';
import WebSocketService from '@/socket/websocket';
import { AuthHandlerData, Message, MessageHandlerData, RoomInfo } from '@/types';

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
    padding-top: 20px;
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
    flex: 1;
    padding: 16px;
    padding-bottom: 8px;
    display: flex;
    flex-direction: column;
    gap: 10px;

    scrollbar-width: thin;
    &::-webkit-scrollbar {
        width: 4px;
    }
    &::-webkit-scrollbar-thumb {
        background-color: rgba(255, 255, 255, 0.2);
        border-radius: 4px;
    }
`;

const MessageBubble = styled.div<{ isMine: boolean }>`
    max-width: 75%;
    padding: 12px 16px;
    border-radius: ${(props) => (props.isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px')};
    background-color: ${(props) => (props.isMine ? '#4F46E5' : '#333333')};
    color: white;
    box-shadow: none;
    //  align-self: ${(props) => (props.isMine ? 'flex-end' : 'flex-start')};
    word-break: break-word;
    position: relative;
    margin-bottom: 2px;
`;

const MessageWrapper = styled.div<{ isMine: boolean }>`
    display: flex;
    flex-direction: column;
    align-items: ${(props) => (props.isMine ? 'flex-end' : 'flex-start')};
    margin-bottom: 10px;
    max-width: 100%;
`;

const TimeStamp = styled.div<{ isMine: boolean }>`
    font-size: 11px;
    color: #999;
    margin-top: 2px;
    text-align: ${(props) => (props.isMine ? 'right' : 'left')};
    padding: 0 4px;
`;

const InputArea = styled.div`
    padding: 8px 14px;
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
    min-width: 48px;
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
        font-size: 1.3rem;
    }
`;

const RoomHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    margin: 0 16px 16px 16px;
    border: 1px solid #333;
`;

const RoomName = styled.h2`
    font-size: 1.2rem;
    margin: 0;
    color: white;
    font-weight: 500;
`;

const RoomStats = styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.85rem;
    color: #aaa;
`;

const UserCount = styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
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

export default function Chat() {
    const { roomId } = useParams();
    const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
    const [notificationVisible, setNotificationVisible] = useState(false);
    const [notificationData, setNotificationData] = useState({
        roomName: '',
        activeUsers: 0,
    });

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [socket, setSocket] = useState<WebSocketService | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const username = localStorage.getItem('username') || 'Anonymous';
    const hasJoinedRef = useRef(false);
    const handlersRef = useRef({
        messages: null as ((data: MessageHandlerData) => void) | null,
        auth: null as ((data: AuthHandlerData) => void) | null,
    });
    const [shownNotifications, setShownNotifications] = useState<Set<string>>(new Set());

    // here we reset the join flag when roomId changes
    useEffect(() => {
        hasJoinedRef.current = false;
    }, [roomId]);

    useEffect(() => {
        const ws = WebSocketService.getInstance();
        setSocket(ws);

        if (!ws.isConnected()) {
            ws.connect()
                .then(() => {
                    console.log('Connected to Websocket server');

                    const token = localStorage.getItem('token');
                    if (token) {
                        ws.send({
                            type: 'AUTH',
                            token,
                        });
                    } else {
                        ws.send({
                            type: 'SET_USERNAME',
                            username,
                        });
                    }
                })
                .catch((error) => {
                    console.log('Failed to connect to WebSocket server: ', error);
                });
        } else if (roomId) {
            // if already connected, just join to the room
            if (!hasJoinedRef.current) {
                // added this in order to mark as joined
                hasJoinedRef.current = true;
                ws.send({
                    type: 'JOIN_ROOM',
                    roomId,
                    username,
                });
            }
        }

        const handleMessages = (data: any) => {
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

                    displayNotification(
                        data.room?.name || data.roomName || 'Unknown Room',
                        data.activeUsers || data.room?.members?.length || 1,
                    );

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

                        const isJoinOrLeaveMessage =
                            messageText.includes('joined the room') || messageText.includes('left the room');
                        if (isJoinOrLeaveMessage) {
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
                            } else {
                                console.log('Skipping duplicate system message:', messageText);
                            }
                        } else {
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
                        const isMine = data.sender === username;
                        const text = isMine ? data.message : `${data.sender}: ${data.message}`;

                        const isDuplicate = messages.some(
                            (msg) => !msg.isSystem && msg.text === text && msg.isMine === isMine,
                        );
                        if (!isDuplicate) {
                            setMessages((prev) => [
                                ...prev,
                                {
                                    text,
                                    isMine,
                                    timestamp: new Date(data.timestamp || Date.now()),
                                },
                            ]);
                        } else {
                            console.log('Skipping duplicate chat message:', text);
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
                } else if (data.type === 'USERNAME_SET' && data.success) {
                    setIsAuthenticated(true);
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
            //  we clean up the listeners safely
            if (handlersRef.current.auth) {
                setupWebSocketEventListener(ws, EVENT_HANDLERS.AUTH, handlersRef.current.auth, 'remove');
            }
            if (handlersRef.current.messages) {
                setupWebSocketEventListener(ws, EVENT_HANDLERS.MESSAGES, handlersRef.current.messages, 'remove');
            }
        };
    }, [roomId, username]);

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
                username,
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
    }, [isAuthenticated, socket, roomId, username]);

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

    const displayNotification = (roomName: string, activeUsers: number) => {
        // we check if we have shown a notification for this room
        if (shownNotifications.has(roomName)) {
            console.log(`Already showed notification for ${roomName}, skipping`);
            return;
        }

        message.success({
            content: `You joined ${roomName}`,
            duration: 3,
        });

        setNotificationData({
            roomName,
            activeUsers,
        });

        setNotificationVisible(true);

        // track the shown notifications
        setShownNotifications((prev) => new Set([...prev, roomName]));

        // then clear after timeout
        setTimeout(() => {
            setShownNotifications((prev) => {
                const newSet = new Set([...prev]);
                newSet.delete(roomName);
                return newSet;
            });
        }, 3000);
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

    const messageVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.3 },
        },
    };

    const formatMessageTime = (date?: Date) => {
        if (!date) return '';
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <>
            {roomInfo && (
                <RoomHeader>
                    <RoomName>
                        {roomInfo.name}
                        {roomInfo.isPrivate && <span style={{ color: '#f5222d', marginLeft: '8px' }}>(Private)</span>}
                        {roomInfo.isEncrypted && (
                            <span style={{ color: '#52c41a', marginLeft: '8px' }}>(🔒 Encrypted)</span>
                        )}
                    </RoomName>
                    <RoomStats>
                        <UserCount>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                            {roomInfo.activeUsers} active
                        </UserCount>
                    </RoomStats>
                </RoomHeader>
            )}
            <ChatContainer>
                <RoomJoin
                    show={notificationVisible}
                    roomName={notificationData.roomName}
                    activeUsers={notificationData.activeUsers}
                    onAnimationComplete={() => setNotificationVisible(false)}
                />

                <MessagesWrapper>
                    <MessagesContainer>
                        {/* {messages.map((msg, index) =>
                            msg.isSystem ? (
                                <SystemMessage key={index}>{msg.text}</SystemMessage>
                            ) : (
                                <motion.div key={index} initial="hidden" animate="visible" variants={messageVariants}>
                                    <MessageBubble isMine={msg.isMine}>{msg.text}</MessageBubble>
                                </motion.div>
                            ),
                        )} */}
                        {messages.map((msg, index) =>
                            msg.isSystem ? (
                                <SystemMessage key={index}>{msg.text}</SystemMessage>
                            ) : (
                                <motion.div
                                    key={index}
                                    initial="hidden"
                                    animate="visible"
                                    variants={messageVariants}
                                    style={{ alignSelf: msg.isMine ? 'flex-end' : 'flex-start', maxWidth: '80%' }}
                                >
                                    <MessageWrapper isMine={msg.isMine}>
                                        <MessageBubble isMine={msg.isMine}>{msg.text}</MessageBubble>
                                        <TimeStamp isMine={msg.isMine}>{formatMessageTime(msg.timestamp)}</TimeStamp>
                                    </MessageWrapper>
                                </motion.div>
                            ),
                        )}
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
            </ChatContainer>
        </>
    );
}
