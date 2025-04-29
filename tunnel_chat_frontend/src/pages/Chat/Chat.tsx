import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { EditIcon, SendIcon } from 'lucide-react';

const ChatContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    background: linear-gradient(to bottom, #1c1c1c, #111);
    padding: 0px 20px;
    padding-top: 20px;
    color: white;
    position: relative;
    overflow: hidden;
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
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    scrollbar-width: none; /* Firefox */
    &::-webkit-scrollbar {
        display: none; /* Chrome, Safari, Opera */
    }
    /* Ensure content is padded at the bottom to allow room for new messages */
    &:after {
        content: '';
        display: block;
        height: 8px;
    }
`;

const MessageBubble = styled.div<{ isMine: boolean }>`
    max-width: 75%;
    padding: 12px 16px;
    border-radius: ${(props) => (props.isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px')};
    background-color: ${(props) => (props.isMine ? '#4F46E5' : '#333333')};
    color: white;
    box-shadow: none;
    align-self: ${(props) => (props.isMine ? 'flex-end' : 'flex-start')};
    word-break: break-word;
    position: relative;
    margin-bottom: 4px;
`;

const InputArea = styled.div`
    padding: 8px 14px;
    background-color: #111;
    border-top: 1px solid #222;
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
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
    padding-right: 40px; /* Space for the icon button */
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
    height: 48px;
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

type Message = {
    text: string;
    isMine: boolean;
    timestamp?: Date;
};

type ChatProps = {
    className?: string;
};

export default function Chat({ className }: ChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [socket, setSocket] = useState<WebSocket | null>(null);

    const myUsername = localStorage.getItem('username') || 'Anonymous';

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8080');
        ws.onopen = () => {
            console.log('Connected to web socket server. ');
            const setUserMsg = {
                type: 'SET_USERNAME',
                username: myUsername,
            };
            const user = localStorage.getItem('username') || 'Anonymous';
            console.log('Sending SET_USERNAME:', user);
            ws.send(JSON.stringify(setUserMsg));
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data.toString());
            if (data.type === 'CHAT') {
                const text = data.message as string;

                let isMine: boolean = false;
                if (text.startsWith(`${myUsername}:`)) {
                    isMine = true;
                }

                // we add the message to local state
                setMessages((prev) => [...prev, { text, isMine, timestamp: new Date() }]);
            }
        };

        ws.onclose = () => {
            console.log('web socket is closed.');
        };

        setSocket(ws);

        return () => {
            ws.close();
        };
    }, [myUsername]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const sendMessage = () => {
        if (!input.trim()) return;

        const chatMsg = {
            type: 'CHAT',
            message: input,
        };

        socket?.send(JSON.stringify(chatMsg));

        setMessages([...messages, { text: input, isMine: true, timestamp: new Date() }]);
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

    return (
        <ChatContainer className={className}>
            <MessagesWrapper>
                <MessagesContainer>
                    {messages.map((msg, index) => (
                        <motion.div key={index} initial="hidden" animate="visible" variants={messageVariants}>
                            <MessageBubble isMine={msg.isMine}>{msg.text}</MessageBubble>
                        </motion.div>
                    ))}
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
                    <SendIcon size={24} />
                </SendButton>
            </InputArea>
        </ChatContainer>
    );
}
