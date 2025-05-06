import { useRef } from 'react';
import styled from 'styled-components';
import TunnelHome from '@/pages/Home/TunnelHome';
import LandingHome from '@/pages/Home/LandingHome';
import FeaturesSection from '@/pages/Home/FeaturesSection';

const HomeContainer = styled.div`
    width: 100%;
    height: 100%;
    overflow-y: auto;
    scroll-behavior: smooth;
    display: flex;
    flex-direction: column;
    background-color: #000;
`;

const Section = styled.section`
    min-height: 100vh;
    margin-top: 0px;
    width: 100%;
    position: relative;
`;

/**
 * Home component - Main page for Tunnel Chat application
 * This component serves as the container for the main landing page,
 * features section, and the tunnel home section. It handles
 * smooth scrolling between sections.
 */
export default function Home() {
    const tunnelSectionRef = useRef<HTMLDivElement>(null);
    const featuresSectionRef = useRef<HTMLDivElement>(null);

    const scrollToTunnel = () => {
        tunnelSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <HomeContainer>
            <Section>
                <LandingHome onScrollDown={scrollToTunnel} />
            </Section>
            <Section ref={featuresSectionRef}>
                <FeaturesSection />
            </Section>
            <Section ref={tunnelSectionRef}>
                <TunnelHome />
            </Section>
        </HomeContainer>
    );
}
