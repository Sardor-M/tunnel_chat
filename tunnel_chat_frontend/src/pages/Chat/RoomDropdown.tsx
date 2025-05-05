import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Users } from 'lucide-react';
import { RoomInfo as RoomInfoType } from '@/types';
import styled from 'styled-components';

type RoomDropdownProps = {
    roomInfo: RoomInfoType | null;
};

const RoomDropdown = styled.div`
    margin: 0 16px 0 16px;
    position: relative;
`;

const DropdownToggle = styled.button`
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 8px 16px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    border: 1px solid #333;
    color: white;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
        background: rgba(0, 0, 0, 0.3);
    }
`;

const RoomNamePreview = styled.div`
    font-size: 1.2rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
`;

const RoomBadge = styled.span<{ variant: 'private' | 'encrypted' }>`
    font-size: 0.8rem;
    padding: 2px 6px;
    border-radius: 4px;
    background-color: ${(props) => (props.variant === 'private' ? 'rgba(245, 34, 45, 0.2)' : 'rgba(82, 196, 26, 0.2)')};
    color: ${(props) => (props.variant === 'private' ? '#f5222d' : '#52c41a')};
    margin-left: 8px;
`;

const ChevronIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
`;

const DropdownContent = styled(motion.div)`
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 4px;
    background: #222;
    border-radius: 8px;
    border: 1px solid #0077c2;
    overflow: hidden;
    z-index: 10;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
`;

const RoomDetails = styled.div`
    padding: 16px;
`;

const RoomNameFull = styled.h2`
    font-size: 1.2rem;
    margin: 0 0 12px 0;
    color: white;
    font-weight: 500;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
`;

const UserStatsSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const StatsTitle = styled.div`
    font-size: 0.9rem;
    color: #aaa;
    margin-bottom: 4px;
`;

const UserCount = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
    color: #ddd;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
`;

const UserIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    color: #aaa;
`;

const RoomInfo = styled.div`
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #333;
`;

const RoomId = styled.div`
    font-family: monospace;
    font-size: 0.8rem;
    color: #888;
    background: rgba(0, 0, 0, 0.2);
    padding: 4px 8px;
    border-radius: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 8px;
`;

export default function RoomInfoDropdown({ roomInfo }: RoomDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    if (!roomInfo) return null;

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    return (
        <RoomDropdown ref={dropdownRef}>
            <DropdownToggle onClick={toggleDropdown}>
                <RoomNamePreview>
                    {'💬 details'}
                    {roomInfo.isPrivate && <RoomBadge variant="private">Private</RoomBadge>}
                    {roomInfo.isEncrypted && <RoomBadge variant="encrypted">🔒 Encrypted</RoomBadge>}
                </RoomNamePreview>
                <ChevronIcon>{isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</ChevronIcon>
            </DropdownToggle>

            <AnimatePresence>
                {isOpen && (
                    <DropdownContent
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <RoomDetails>
                            <RoomNameFull>
                                {roomInfo.name}
                                {roomInfo.isPrivate && <RoomBadge variant="private">Private</RoomBadge>}
                                {roomInfo.isEncrypted && <RoomBadge variant="encrypted">🔒 Encrypted</RoomBadge>}
                            </RoomNameFull>

                            <UserStatsSection>
                                <StatsTitle>User Information</StatsTitle>
                                <UserCount>
                                    <UserIcon>
                                        <Users size={16} />
                                    </UserIcon>
                                    {roomInfo.activeUsers} active user{roomInfo.activeUsers !== 1 ? 's' : ''}
                                </UserCount>
                            </UserStatsSection>

                            <RoomInfo>
                                <StatsTitle>Room Information</StatsTitle>
                                <RoomId>ID: {roomInfo.id}</RoomId>
                                <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '8px' }}>
                                    {roomInfo.messageCount} messages in this room
                                </div>
                            </RoomInfo>
                        </RoomDetails>
                    </DropdownContent>
                )}
            </AnimatePresence>
        </RoomDropdown>
    );
}
