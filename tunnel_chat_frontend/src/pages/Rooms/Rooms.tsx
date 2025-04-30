import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Input from '@/components/Atoms/Input/Input';
import { MdSearch } from 'react-icons/md';
import Button from '@/components/Atoms/Button/Button';
import { authService } from '@/services/authService';
import WebSocketService from '@/socket/websocket';

type Room = {
    id: string;
    name: string;
    isPrivate: boolean;
    isEncrypted?: boolean;
    memberCount: number;
    createdBy?: string;
    encryptionKey?: string;
};

const Container = styled.div`
    position: relative;
    height: 100%;
    background-color: black;
    min-height: 70vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    margin: 0;
`;

const Title = styled.h1`
    color: #0077c2;
    font-family: monospace;
    font-size: 1.8rem;
    margin-bottom: 30px;
    text-align: center;
`;

const RoomsGrid = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 450px;
    gap: 10px;
    margin-bottom: 20px;
    max-height: 400px;
    overflow-y: auto;
    padding-right: 5px;

    &::-webkit-scrollbar {
        width: 2px;
    }

    &::-webkit-scrollbar-thumb {
        background: #0077c2;
        border-radius: 20px;
    }
`;

const RoomCard = styled.div<{ $isPrivate: boolean }>`
    background: black;
    border: 1px solid ${(props) => (props.$isPrivate ? '#ed3b3b' : '#0077c2')};
    border-radius: 8px;
    padding: 15px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: rgba(0, 119, 194, 0.1);
    }
`;

const RoomTitle = styled.h3`
    color: white;
    font-family: monospace;
    margin-bottom: 10px;
    font-size: 1.1rem;
`;

const RoomInfo = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const RoomUsers = styled.span`
    color: #0077c2;
    font-family: monospace;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
`;

const RoomType = styled.span<{ $isPrivate: boolean }>`
    color: ${(props) => (props.$isPrivate ? '#ed3b3b' : '#0077c2')};
    font-family: monospace;
    font-size: 0.8rem;
`;

const SearchWrapper = styled.div`
    position: relative;
    width: 100%;
    max-width: 450px;
    margin-bottom: 20px;

    .search-input {
        width: 100%;
        background: black;
        border: 1px solid #0077c2;
        border-radius: 25px;
        padding: 12px 15px;
        color: white;
        font-family: monospace;
    }

    svg {
        position: absolute;
        right: 15px;
        top: 50%;
        transform: translateY(-50%);
        color: #0077c2;
        font-size: 1.2rem;
    }
`;

const ButtonWrapper = styled.div`
    width: 100%;
    max-width: 450px;
    margin-top: 14px;
`;

const CreateRoomModal = styled.div<{ $show: boolean }>`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: ${(props) => (props.$show ? 'flex' : 'none')};
    justify-content: center;
    align-items: center;
    z-index: 10;
`;

const ModalContent = styled.div`
    background: black;
    border: 1px solid #0077c2;
    border-radius: 8px;
    padding: 40px;
    width: 90%;
    max-width: 450px;
`;

const ModalTitle = styled.h2`
    color: #0077c2;
    font-family: monospace;
    margin-bottom: 20px;
    text-align: center;
`;

const CheckboxContainer = styled.div`
    display: flex;
    align-items: center;
    margin: 15px 0 15px 0;
    color: white;
    font-family: monospace;
`;

const Checkbox = styled.input`
    margin-right: 10px;
`;

const EmptyState = styled.div`
    text-align: center;
    color: #0077c2;
    font-family: monospace;
    margin: 40px 0;
`;

const StatusDot = styled.span`
    display: inline-block;
    width: 8px;
    height: 8px;
    background: #0077c2;
    border-radius: 50%;
    margin-right: 8px;
`;

const SegmentControl = styled.div`
    display: flex;
    width: 100%;
    max-width: 450px;
    margin-bottom: 20px;
    border: 1px solid #0077c2;
    border-radius: 4px;
    overflow: hidden;
`;

const SegmentButton = styled.button<{ $active?: boolean }>`
    flex: 1;
    background: ${(props) => (props.$active ? '#0077c2' : 'black')};
    color: ${(props) => (props.$active ? 'white' : '#0077c2')};
    border: none;
    padding: 10px;
    font-family: monospace;
    cursor: pointer;
    transition: all 0.2s;
`;

export default function TunnelRooms() {
    const navigate = useNavigate();
    const [showCreateModal, setShowCreateModal] = useState(false);
    // const [isEncrypted, setIsEncrypted] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('Connecting...');
    const [rooms, setRooms] = useState<Room[]>([]);
    const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [username, setUsername] = useState('');

    const [newRoom, setNewRoom] = useState({
        name: '',
        isPrivate: false,
        isEncrypted: false,
    });

    const webSocketService = WebSocketService.getInstance();

    // check auth and establish socket connection
    useEffect(() => {
        if (!authService.isLoggedIn()) {
            navigate('/login');
            return;
        }

        setUsername(authService.getUsername() || 'Anonymous');

        const connectWebSocket = async () => {
            try {
                setConnectionStatus('Connecting to server...');
                const connected = await webSocketService.connect();

                if (connected) {
                    setConnectionStatus('Connected to tunnel network');
                    fetchRooms();
                } else {
                    setConnectionStatus('Connection failed');
                }
            } catch (error) {
                console.error('WebSocket connection error:', error);
                setConnectionStatus('Connection error');
            }
        };

        connectWebSocket();

        webSocketService.addListener('CONNECTION_SUCCESS', () => {
            setConnectionStatus('Connected to tunnel network');
            fetchRooms();
        });

        webSocketService.addListener('CONNECTION_CLOSED', () => {
            setConnectionStatus('Disconnected from tunnel network');
        });

        webSocketService.addListener('ERROR', () => {
            setConnectionStatus('Connection error');
        });

        return () => {
            webSocketService.removeListener('CONNECTION_SUCCESS', () => {});
            webSocketService.removeListener('CONNECTION_CLOSED', () => {});
            webSocketService.removeListener('ERROR', () => {});
        };
    }, [navigate]);

    const fetchRooms = async () => {
        try {
            const token = await authService.ensureValidToken();
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/rooms`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch rooms');
            }

            const data = await response.json();
            setRooms(data.rooms || []);
            setFilteredRooms(data.rooms || []);
        } catch (error) {
            console.error('Error fetching rooms:', error);
        }
    };

    // we filter rooms based on search term and active tab
    useEffect(() => {
        let result = rooms;

        if (searchTerm) {
            result = result.filter((room) => room.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        if (activeTab === 'public') {
            result = result.filter((room) => !room.isPrivate);
        } else if (activeTab === 'private') {
            result = result.filter((room) => room.isPrivate);
        }

        setFilteredRooms(result);
    }, [searchTerm, activeTab, rooms]);

    const handleCreateRoom = async () => {
        if (!newRoom.name.trim()) {
            alert('Please enter a room name');
            return;
        }

        try {
            const token = await authService.ensureValidToken();
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/rooms`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    roomName: newRoom.name,
                    isPrivate: newRoom.isPrivate,
                    isEncrypted: newRoom.isEncrypted,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create room');
            }

            const roomData = await response.json();

            fetchRooms();

            setShowCreateModal(false);

            setNewRoom({
                name: '',
                isPrivate: false,
                isEncrypted: false,
            });

            navigate(`/chat/${roomData.roomId}`);
        } catch (error) {
            console.error('Error creating room:', error);
            alert(error instanceof Error ? error.message : 'Failed to create room');
        }
    };

    const joinRoom = async (room: Room) => {
        try {
            const token = await authService.ensureValidToken();
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/rooms/join`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    roomId: room.id,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to join room');
            }

            if (!webSocketService.isConnected()) {
                await webSocketService.connect();
            }

            localStorage.setItem(
                'currentRoom',
                JSON.stringify({
                    id: room.id,
                    name: room.name,
                    isPrivate: room.isPrivate,
                    isEncrypted: room.isEncrypted,
                    memberCount: room.memberCount,
                }),
            );

            webSocketService.send({
                type: 'JOIN_ROOM',
                roomId: room.id,
                username: username,
            });

            navigate(`/chat/${room.id}`);
        } catch (error) {
            console.error('Error joining room:', error);
            alert(error instanceof Error ? error.message : 'Failed to join room');
        }
    };

    return (
        <Container>
            <Title>tunnel_rooms</Title>
            <SearchWrapper>
                <Input
                    id="room"
                    type="room"
                    name="room"
                    placeholder="Search rooms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    icon={<MdSearch />}
                />
            </SearchWrapper>

            <SegmentControl>
                <SegmentButton $active={activeTab === 'all'} onClick={() => setActiveTab('all')}>
                    All
                </SegmentButton>
                <SegmentButton $active={activeTab === 'public'} onClick={() => setActiveTab('public')}>
                    Public
                </SegmentButton>
                <SegmentButton $active={activeTab === 'private'} onClick={() => setActiveTab('private')}>
                    Private
                </SegmentButton>
            </SegmentControl>

            {filteredRooms.length > 0 ? (
                <RoomsGrid>
                    {filteredRooms.map((room) => (
                        <RoomCard key={room.id} $isPrivate={room.isPrivate} onClick={() => joinRoom(room)}>
                            <RoomTitle>{room.name}</RoomTitle>
                            <RoomInfo>
                                <RoomUsers>
                                    <StatusDot /> {room.memberCount} online
                                </RoomUsers>
                                <RoomType $isPrivate={room.isPrivate}>
                                    {room.isPrivate ? (room.isEncrypted ? 'ENCRYPTED' : 'PRIVATE') : 'PUBLIC'}
                                </RoomType>
                            </RoomInfo>
                        </RoomCard>
                    ))}
                </RoomsGrid>
            ) : (
                <EmptyState>
                    <p>No rooms found</p>
                    <p>Try a different search term or create your own room</p>
                </EmptyState>
            )}
            <ButtonWrapper>
                <Button variant="submit" position="full" onClick={() => setShowCreateModal(true)}>
                    Create Room
                </Button>
            </ButtonWrapper>

            {/* room creating modal */}
            <CreateRoomModal $show={showCreateModal}>
                <ModalContent>
                    <ModalTitle>Create New Room</ModalTitle>

                    <Input
                        id="newRoom"
                        name="newRoom"
                        type="newRoom"
                        value={newRoom.name}
                        onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                        placeholder="Enter room name"
                    />

                    <CheckboxContainer>
                        <Checkbox
                            type="checkbox"
                            checked={newRoom.isPrivate}
                            onChange={(e) => {
                                setNewRoom({
                                    ...newRoom,
                                    isPrivate: e.target.checked,
                                    // reset the encryption when toggling privacy
                                    isEncrypted: e.target.checked ? newRoom.isEncrypted : false,
                                });
                            }}
                        />
                        Private Room
                    </CheckboxContainer>

                    {newRoom.isPrivate && (
                        <CheckboxContainer>
                            <Checkbox
                                type="checkbox"
                                checked={newRoom.isEncrypted}
                                onChange={(e) => setNewRoom({ ...newRoom, isEncrypted: e.target.checked })}
                            />
                            End-to-End Encryption
                        </CheckboxContainer>
                    )}

                    <Button
                        variant="submit"
                        position="full"
                        onClick={handleCreateRoom}
                        style={{
                            marginBottom: '15px',
                        }}
                    >
                        Create Room
                    </Button>
                    <Button
                        variant="danger"
                        position="full"
                        onClick={() => setShowCreateModal(false)}
                        style={{
                            marginBottom: '25px',
                        }}
                    >
                        Cancel
                    </Button>
                </ModalContent>
            </CreateRoomModal>
        </Container>
    );
}
