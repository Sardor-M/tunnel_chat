import { useState } from 'react';
import styled from 'styled-components';
import { fadeInUp, floatAnimation, pulseAnimation } from '@/pages/Home/animations/animations';

type ProjectCardProps = {
    position?: 'left' | 'right';
};

const ProjectsContainer = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 40px;
    margin: 0 auto;
    max-width: 1000px;
`;

const ProjectTitle = styled.h3`
    color: #3f87db;
    font-size: 18px;
    margin: 0 0 10px 0;
    font-weight: 500;
    font-family: monospace;
    letter-spacing: 1px;

    @media (max-width: 480px) {
        font-size: 16px;
    }
`;

const ProjectDescription = styled.p`
    color: #aaa;
    font-size: 14px;
    line-height: 1.5;
    margin: 0 0 15px 0;

    @media (max-width: 480px) {
        font-size: 13px;
    }
`;

const ProjectTags = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 15px;
`;

const SectionTitle = styled.h2`
    color: #fff;
    text-align: center;
    margin-bottom: 50px;
    font-size: 32px;
    animation: ${floatAnimation} 3s infinite ease-in-out;
    position: relative;
    font-family: monospace;
    letter-spacing: 2px;
    text-shadow: 0 0 10px rgba(63, 135, 219, 0.4);

    span {
        color: #3f87db;
    }

    &:after {
        content: '';
        position: absolute;
        width: 100px;
        height: 3px;
        background: linear-gradient(90deg, rgba(63, 135, 219, 0), rgba(63, 135, 219, 1), rgba(63, 135, 219, 0));
        bottom: -12px;
        left: 50%;
        transform: translateX(-50%);
    }

    @media (max-width: 768px) {
        font-size: 26px;
    }

    @media (max-width: 480px) {
        font-size: 22px;
    }
`;

const ProjectSection = styled.div<{ show: boolean }>`
    max-height: ${(props) => (props.show ? '2000px' : '0')};
    opacity: ${(props) => (props.show ? '1' : '0')};
    overflow: hidden;
    transition:
        max-height 0.8s cubic-bezier(0.22, 1, 0.36, 1),
        opacity 0.6s ease-in-out;
    width: 100%;
    background: linear-gradient(to bottom, #0a1a36, #030a1c);
    padding: ${(props) => (props.show ? '60px 20px' : '0')};
    box-sizing: border-box;
    position: relative;

    &:before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 100px;
        background: linear-gradient(to bottom, #000, transparent);
        z-index: 1;
    }
`;

const ProjectCard = styled.div<ProjectCardProps>`
    background: rgba(15, 35, 75, 0.5);
    border: 1px solid rgba(63, 135, 219, 0.3);
    border-radius: 12px;
    padding: 20px;
    width: 80%;
    max-width: 600px;
    box-shadow: 0 0 20px rgba(63, 135, 219, 0.15);
    transition:
        transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
        box-shadow 0.4s ease,
        border-color 0.4s ease;
    animation: ${fadeInUp} 0.5s backwards;
    animation-delay: calc(0.15s * var(--index));

    /* More explicit positioning control */
    margin-left: ${(props) => (props.position === 'left' ? '5%' : 'auto')};
    margin-right: ${(props) => (props.position === 'right' ? '5%' : 'auto')};
    align-self: ${(props) =>
        props.position === 'left' ? 'flex-start' : props.position === 'right' ? 'flex-end' : 'center'};

    &:hover {
        transform: translateY(-10px) scale(1.02);
        box-shadow: 0 0 30px rgba(63, 135, 219, 0.3);
        border-color: rgba(63, 135, 219, 0.6);
    }

    @media (max-width: 768px) {
        width: 90%;
        padding: 15px;
        align-self: center;
        margin-left: auto;
        margin-right: auto;
    }

    @media (max-width: 480px) {
        width: 95%;
        max-width: 95%;
    }
`;

const Tag = styled.span`
    background: rgba(63, 135, 219, 0.15);
    color: #3f87db;
    font-size: 12px;
    padding: 4px 8px;
    border-radius: 4px;
    transition: all 0.3s ease;
    animation: ${pulseAnimation} 2s infinite;
    border: 1px solid rgba(63, 135, 219, 0.4);
    font-family: monospace;

    &:hover {
        background: rgba(63, 135, 219, 0.25);
        transform: scale(1.05);
    }

    @media (max-width: 480px) {
        font-size: 11px;
        padding: 3px 6px;
    }
`;

/**
 * FeaturesSection component displays animated feature cards in alternating layout
 * Renders a section showcasing the main features of Tunnel Chat.
 * Features cards are displayed in an alternating left-right pattern with
 * animated tags and hover effects.
 */
export default function FeaturesSection() {
    const [showProjects] = useState(true);

    return (
        <ProjectSection id="project-section" show={showProjects}>
            <SectionTitle>
                Tunnel <span>Chat</span> Features
            </SectionTitle>
            <ProjectsContainer>
                {projectsData.map((project, index) => {
                    const position = index % 2 === 0 ? 'left' : 'right';
                    return (
                        <ProjectCard
                            key={project.id}
                            style={{ '--index': index } as React.CSSProperties}
                            position={position}
                        >
                            <ProjectTitle>{project.title}</ProjectTitle>
                            <ProjectDescription>{project.description}</ProjectDescription>
                            <ProjectTags>
                                {project.tags.map((tag, tagIndex) => (
                                    <Tag
                                        key={tagIndex}
                                        style={
                                            {
                                                animationDelay: `${tagIndex * 0.4}s`,
                                                '--pulse-delay': `${tagIndex * 0.4}s`,
                                            } as React.CSSProperties
                                        }
                                    >
                                        {tag}
                                    </Tag>
                                ))}
                            </ProjectTags>
                        </ProjectCard>
                    );
                })}
            </ProjectsContainer>
        </ProjectSection>
    );
}
const projectsData = [
    {
        id: 1,
        title: 'Real-time Communication',
        description: 'End-to-end encrypted messaging with WebSocket protocol for instant delivery.',
        tags: ['WebSockets', 'Encryption', 'Real-time'],
    },
    {
        id: 2,
        title: 'User Authentication',
        description: 'Secure login and registration system with JWT token-based authentication.',
        tags: ['JWT', 'Security', 'Auth'],
    },
    {
        id: 3,
        title: 'File Sharing',
        description: 'Peer-to-peer encrypted file sharing system for securely transferring documents.',
        tags: ['P2P', 'Encryption', 'Files'],
    },
];
