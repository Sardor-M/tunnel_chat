import  { useRef, useState, useEffect } from "react";
import { animate } from "motion";
import styled from "styled-components";

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: black;
`;

const CanvasWrapper = styled.div`
  position: relative;
`;

const StyledCanvas = styled.canvas`
  display: block;
`;

const TextWrapper = styled.div<{ $show: boolean }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  opacity: ${(props) => (props.$show ? 1 : 0)};
  transition: opacity 0.5s ease-out;
`;

const GradientText = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  font-family: monospace;
  letter-spacing: 0.1em;
  white-space: nowrap;
  background: linear-gradient(to right, #60a5fa, #2563eb);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
`;

const TunnelHome = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textRef = useRef<HTMLDivElement | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);

  // const [mouseX, setMouseX] = useState(0);

  const animationStartTimeRef = useRef<number | null>(null);

  const startAnimation = () => {
    if (!isAnimating && !animationComplete) {
      setIsAnimating(true);
      animationStartTimeRef.current = Date.now();
    }
  };

  useEffect(() => {
    startAnimation();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const setCanvasSize = () => {
      const size = Math.min(window.innerWidth * 0.4, 400);
      canvas.width = size;
      canvas.height = size;
    };

    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    let animationFrame: number;

    const drawTunnel = () => {
      if (!isAnimating || !animationStartTimeRef.current) return;

      const width = canvas.width;
      const height = canvas.height;
      const currentTime = Date.now();
      const elapsedTime = currentTime - animationStartTimeRef.current;
      const animationDuration = 1800; // 1.8 seconds
      const animationProgress = Math.min(elapsedTime / animationDuration, 1);

      // re-loading qilganda canvasni o'chiramiz 
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#00000";
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.translate(width / 2, height / 2);

      const rotationFactor = 0;
      ctx.rotate(rotationFactor);

      const linesCount = 48;
      const stepAngle = (2 * Math.PI) / linesCount;
      const radius = width * 0.35;

      for (let i = 0; i < linesCount; i++) {
        const lineProgress = animationProgress * linesCount;
        if (i <= lineProgress) {
          ctx.save();
          ctx.rotate(i * stepAngle);

          const gradient = ctx.createLinearGradient(0, 0, radius, 0);
          gradient.addColorStop(0, "rgba(0, 149, 255, 0.8)");
          gradient.addColorStop(1, "rgba(0, 149, 255, 0.1)");

          ctx.strokeStyle = gradient;
          ctx.lineWidth = 1.5;

          ctx.beginPath();
          ctx.moveTo(0, 0);

          const easeOutCubic = (x: number): number => 1 - Math.pow(1 - x, 3);
          const progressEased = easeOutCubic(
            Math.min(1, Math.max(0, (animationProgress - i / linesCount) * 3))
          );
          const lineLength = radius * progressEased;

          ctx.lineTo(Math.max(0, lineLength), 0);
          ctx.stroke();
          ctx.restore();
        }
      }

      // glowing effektni markazga joylaymiz
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 10);
      gradient.addColorStop(0, "rgba(0, 149, 255, 0.8)");
      gradient.addColorStop(1, "rgba(0, 149, 255, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();

      if (animationProgress > 0.8) {
        const circleOpacity = (animationProgress - 0.8) * 5;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = `rgba(0, 149, 255, ${circleOpacity * 0.5})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      ctx.restore();

      if (animationProgress >= 1) {
        setIsAnimating(false);
        setAnimationComplete(true);
        if (textRef.current) {
          animate(
            textRef.current,
            {
              opacity: [0, 1],
              transform: ["translateY(20px)", "translateY(0px)"],
            },
            {
              duration: 0.8,
              easing: "ease-out",
            }
          );
        }
      } else {
        animationFrame = requestAnimationFrame(drawTunnel);
      }
    };

    if (isAnimating) {
      drawTunnel();
    }

    return () => {
      window.removeEventListener("resize", setCanvasSize);
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isAnimating]);

  // const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
  //   setMouseX(e.clientX);
  //   if (!animationComplete) {
  //     startAnimation();
  //   }
  // };

  return (
    <Container>
      <CanvasWrapper>
        <StyledCanvas ref={canvasRef} />
        {animationComplete && (
          <TextWrapper ref={textRef} $show={animationComplete}>
            <GradientText>:tunnel_chat</GradientText>
          </TextWrapper>
        )}
      </CanvasWrapper>
    </Container>
  );
};

export default TunnelHome;
