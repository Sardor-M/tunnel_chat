import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { authService } from '@/services/authService';
import { MessageSquare, Folder, MapPin } from 'lucide-react';

type ActivityItem = {
    type: string;
    name: string;
    time: string;
    icon: JSX.Element;
};

const PageContainer = styled.div`
    background: black;
    min-height: 100vh;
    color: white;
    padding: 80px 16px 24px 16px;
    display: flex;
    flex-direction: column;
`;

const UserProfileCard = styled.div`
    background: #222;
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
`;

const UserAvatar = styled.div`
    width: 120px;
    height: 120px;
    margin-bottom: 16px;
    background-color: #1c77c3;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    font-size: 3rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const UserName = styled.h4`
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 8px;
    color: white;
`;

const UserEmail = styled.p`
    font-size: 1.1rem;
    color: #aaa;
    margin-bottom: 16px;
`;

const StatsCard = styled.div`
    background-color: #333;
    border-radius: 12px;
    margin-bottom: 16px;
    overflow: visible;
    position: relative;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const StatsIcon = styled.div`
    position: absolute;
    top: -20px;
    left: 20px;
    background-color: #1c77c3;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    color: white;
`;

const StatsTitle = styled.h6`
    margin-top: 12px;
    margin-left: 70px;
    font-size: 1.1rem;
    font-weight: bold;
    color: white;
`;

const CardContent = styled.div`
    padding: 16px;
`;

const StatsNumber = styled.h4`
    color: white;
    text-align: center;
    margin: 16px 0;
    font-size: 2rem;
`;

const RecentActivityList = styled.ul`
    padding: 0;
    background-color: #222;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    list-style: none;
    margin: 0;
`;

const ActivityItem = styled.li`
    border-bottom: 1px solid #333;
    padding: 16px;
    display: flex;
    align-items: center;
    transition: background-color 0.2s;

    &:last-child {
        border-bottom: none;
    }

    &:hover {
        background-color: #333;
    }
`;

const ActivityAvatar = styled.div`
    background-color: #1c77c3;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;
    color: white;
`;

const SectionTitle = styled.h5`
    font-size: 1.5rem;
    font-weight: bold;
    margin: 20px 0 12px 0;
    color: white;
`;

const Chip = styled.span`
    background-color: #1c77c3;
    color: white;
    font-weight: bold;
    padding: 8px 16px;
    border-radius: 16px;
    display: inline-block;
`;

const FlexContainer = styled.div`
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
`;

const FlexItem = styled(motion.div)`
    flex: 1 1 0;
    min-width: 250px;
`;

const LoadingContainer = styled(PageContainer)`
    align-items: center;
    justify-content: center;
`;

const Spinner = styled.div`
    width: 60px;
    height: 60px;
    border: 4px solid rgba(28, 119, 195, 0.2);
    border-top: 4px solid #1c77c3;
    border-radius: 50%;
    animation: spin 1s linear infinite;

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
`;

const ActivityText = styled.div`
    flex: 1;
`;

const ActivityTitle = styled.div`
    color: white;
    font-weight: 500;
`;

const ActivityTime = styled.div`
    color: #aaa;
    font-size: 0.9rem;
`;

export default function MyPage() {
    const [userProfile, setUserProfile] = useState({
        username: '',
        email: '',
        joinedDate: '',
    });
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRooms: 0,
        totalMessages: 0,
        totalFiles: 0,
    });
    const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setIsLoading(true);

                const username = authService.getUsername() || 'User';
                const email = authService.getUserEmail() || 'user@example.com';

                setUserProfile({
                    username,
                    email,
                    joinedDate: new Date().toLocaleDateString(),
                });

                setStats({
                    totalRooms: 5,
                    totalMessages: 128,
                    totalFiles: 12,
                });
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, []);

    if (isLoading) {
        return (
            <LoadingContainer>
                <Spinner />
            </LoadingContainer>
        );
    }

    return (
        <PageContainer>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <UserProfileCard>
                    <UserAvatar>{userProfile.username.charAt(0).toUpperCase()}</UserAvatar>
                    <UserName>{userProfile.username}</UserName>
                    <UserEmail>{userProfile.email}</UserEmail>
                    <Chip>Member since {userProfile.joinedDate}</Chip>
                </UserProfileCard>
            </motion.div>

            <SectionTitle>Your Activity</SectionTitle>

            <FlexContainer>
                <FlexItem
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                >
                    <StatsCard>
                        <StatsIcon>
                            <MapPin size={20} />
                        </StatsIcon>
                        <CardContent>
                            <StatsTitle>Rooms</StatsTitle>
                            <StatsNumber>{stats.totalRooms}</StatsNumber>
                        </CardContent>
                    </StatsCard>
                </FlexItem>

                <FlexItem
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                >
                    <StatsCard>
                        <StatsIcon>
                            <MessageSquare size={20} />
                        </StatsIcon>
                        <CardContent>
                            <StatsTitle>Messages</StatsTitle>
                            <StatsNumber>{stats.totalMessages}</StatsNumber>
                        </CardContent>
                    </StatsCard>
                </FlexItem>

                <FlexItem
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                >
                    <StatsCard>
                        <StatsIcon>
                            <Folder size={20} />
                        </StatsIcon>
                        <CardContent>
                            <StatsTitle>Files</StatsTitle>
                            <StatsNumber>{stats.totalFiles}</StatsNumber>
                        </CardContent>
                    </StatsCard>
                </FlexItem>
            </FlexContainer>

            <SectionTitle>Recent Activity</SectionTitle>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
            >
                <RecentActivityList>
                    {recentActivity.map((activity, index) => (
                        <ActivityItem key={index}>
                            <ActivityAvatar>{activity.icon}</ActivityAvatar>
                            <ActivityText>
                                <ActivityTitle>{activity.name}</ActivityTitle>
                                <ActivityTime>{activity.time}</ActivityTime>
                            </ActivityText>
                        </ActivityItem>
                    ))}
                </RecentActivityList>
            </motion.div>
        </PageContainer>
    );
}
