import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { notification, Space, Avatar, Progress, Typography, Badge } from 'antd';
import { RocketOutlined, TeamOutlined, MessageOutlined } from '@ant-design/icons';
import styled from 'styled-components';
const { Text, Title } = Typography;

type JoinRoomProps = {
    show: boolean;
    roomName: string;
    activeUsers: number;
    onAnimationComplete: () => void;
    messageCount?: number;
    isPrivate?: boolean;
    isEncrypted?: boolean;
};

const NotificationContainer = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
`;

const NotificationHeader = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 8px;
`;

const NotificationBody = styled.div`
    margin-bottom: 12px;
`;

const NotificationFooter = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const IconWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #1890ff;
    margin-right: 12px;
`;

/**
 * RoomJoin - A notification component that displays when a user joins a chat room
 * @param {JoinRoomProps} props - Component props
 * @returns {string} A unique notification key
 */
export default function RoomJoin({
    show,
    roomName,
    activeUsers,
    onAnimationComplete,
    messageCount = 0,
    isPrivate = false,
    isEncrypted = false,
}: JoinRoomProps) {
    if (!show) return null;
    const key = `room-join-${Date.now()}`;

    // we define animation variants for elements
    const containerVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.3 },
        },
    };

    const iconVariants = {
        hidden: { scale: 0.5, rotate: -45 },
        visible: {
            scale: 1,
            rotate: 0,
            transition: {
                type: 'spring',
                stiffness: 260,
                damping: 20,
                delay: 0.1,
            },
        },
    };

    const textVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { delay: 0.2, duration: 0.3 },
        },
    };

    // custom notification content
    const NotificationContent = () => {
        const [progress, setProgress] = React.useState(100);

        // auto closes progress timer
        useEffect(() => {
            const timer = setInterval(() => {
                setProgress((prev) => {
                    if (prev <= 0) {
                        clearInterval(timer);
                        return 0;
                    }
                    // decrease by 0.5% every 50ms (5s total)
                    return prev - 0.5;
                });
            }, 25);

            return () => clearInterval(timer);
        }, []);

        // auth closes when progress hits 0
        useEffect(() => {
            if (progress <= 0) {
                notification.destroy(key);
            }
        }, [progress]);

        return (
            <motion.div
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={containerVariants}
                onAnimationComplete={onAnimationComplete}
            >
                <NotificationContainer>
                    <NotificationHeader>
                        <motion.div initial="hidden" animate="visible" variants={iconVariants}>
                            <IconWrapper>
                                <RocketOutlined style={{ color: 'white', fontSize: 20 }} />
                            </IconWrapper>
                        </motion.div>

                        <motion.div initial="hidden" animate="visible" variants={textVariants} style={{ flex: 1 }}>
                            <Title level={4} style={{ margin: 0 }}>
                                Joined Room
                            </Title>
                            <Text type="secondary">You've successfully connected</Text>
                        </motion.div>
                    </NotificationHeader>

                    <NotificationBody>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3, duration: 0.3 }}
                        >
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <Space align="center">
                                    <Avatar
                                        size="small"
                                        style={{ backgroundColor: isPrivate ? '#f56a00' : '#1890ff' }}
                                        icon={<MessageOutlined />}
                                    />
                                    <Text strong>{roomName}</Text>
                                    {isEncrypted && <Badge count="Encrypted" style={{ backgroundColor: '#52c41a' }} />}
                                </Space>

                                <Space size="large">
                                    <Space>
                                        <TeamOutlined />
                                        <Text>
                                            {activeUsers} active {activeUsers === 1 ? 'user' : 'users'}
                                        </Text>
                                    </Space>

                                    <Space>
                                        <MessageOutlined />
                                        <Text>
                                            {messageCount} {messageCount === 1 ? 'message' : 'messages'}
                                        </Text>
                                    </Space>
                                </Space>
                            </Space>
                        </motion.div>
                    </NotificationBody>

                    <NotificationFooter>
                        <Progress
                            percent={progress}
                            showInfo={false}
                            strokeColor="#1890ff"
                            trailColor="#f0f0f0"
                            style={{ width: '100%' }}
                        />
                    </NotificationFooter>
                </NotificationContainer>
            </motion.div>
        );
    };

    notification.open({
        key,
        message: null,
        description: <NotificationContent />,
        placement: 'topRight',
        duration: 0,
        className: 'custom-room-notification',
        style: {
            width: 360,
            padding: 0,
            backgroundColor: '#fff',
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        },
    });
    return key;
}
