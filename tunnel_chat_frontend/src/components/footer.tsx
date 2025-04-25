import { Button } from 'antd';
import styled from 'styled-components';

const FooterContainer = styled.div`
    background-color: #000;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 10px;
    justify-content: center;
    width: 100%;
    margin-top: auto;
    border-top: 1px solid #333;
`;

const InfoContainer = styled.div`
    font-size: 14px;
    color: #CCCCC;
    margin: 5px;
`;

const Text = styled.p`
    margin: 0;
    font-size: 14px;
    color: #cccccc;
`;

const StyledImg = styled.img`
    with: 40px;
    filter: grayscale(100%) opacity(0.8);
    margin: 15px;
    alt: 'footer logo';
`;

const LinkBtnContainer = styled.div`
    display: flex;
    gap: 10px;
`;

export default function Footer() {
    return (
        <FooterContainer>
            <InfoContainer>
                <span> Seoul, South Korea 2024 | sardor-m </span>
            </InfoContainer>
            <Text>Copyright &#9426; tunnel_chat</Text>
            <StyledImg />
            <LinkBtnContainer>
                <Button
                    type="link"
                    href={'https://www.google.com'}
                    target="_blank"
                    style={{
                        color: '#CCCCCC',
                        marginLeft: '10px',
                        padding: 0,
                        fontSize: '12px',
                        textDecoration: 'underline',
                    }}
                >
                    Privacy & Data
                </Button>
                <Button
                    type="link"
                    href={'https://www.google.com'}
                    target="_blank"
                    style={{
                        color: '#CCCCCC',
                        fontSize: '12px',
                        textDecoration: 'underline',
                    }}
                >
                    Terms and Conditions
                </Button>
            </LinkBtnContainer>
        </FooterContainer>
    );
}
