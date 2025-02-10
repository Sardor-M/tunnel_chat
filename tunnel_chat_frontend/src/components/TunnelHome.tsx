import { useRef, useState, useEffect } from "react";
import { animate } from "motion";
import styled from "styled-components";
import Button from "./atoms/Button/Button";

const UserIcon = styled.div<{ x: number; y: number }>`
  position: absolute;
  top: ${(props) => props.y}px;
  left: ${(props) => props.x}px;
  width: 20px;
  height: 20px;
  background: #0ff;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
`;

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background-color: black;
  overflow: hidden;
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

// const SearchButton = styled.button`
//   position: absolute;
//   bottom: 40px;
//   right: 40px;
//   padding: 10px 20px;
//   background: #2563eb;
//   color: #fff;
//   border: none;
//   border-radius: 6px;
//   cursor: pointer;
//   font-size: 1rem;
//   &:hover {
//     background: #1d4ed8;
//   }
// `;

const SearchCircle = styled.div<{ size: number; opacity: number }>`
  position: absolute;
  top: 50%;
  left: 50%;
  width: ${(p) => p.size}px;
  height: ${(p) => p.size}px;
  border: 2px solid #0ff;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  opacity: ${(p) => p.opacity};
  pointer-events: none;
`;

interface OnlineUser {
  username: string;
  lastActive: number;
}

const TunnelHome = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textRef = useRef<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const [isAnimating, setIsAnimating] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);

  const animationStartTimeRef = useRef<number | null>(null);

  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [showSearchWave, setShowSearchWave] = useState(false);
  const [searchCircles, setSearchCircles] = useState<
    { id: number; size: number; opacity: number }[]
  >([]);
  const [userPositions, setUserPositions] = useState<
    { username: string; x: number; y: number }[]
  >([]);

  // tunnel animarionni yaratamiz
  const startAnimation = () => {
    if (!isAnimating && !animationComplete) {
      setIsAnimating(true);
      animationStartTimeRef.current = Date.now();
    }
  };

  useEffect(() => {
    startAnimation();
  }, []);

  // tunnel animatsiyasi
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // canvas ni hajmi
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
      const animationDuration = 1800; // taminan 1.8 sekund
      const animationProgress = Math.min(elapsedTime / animationDuration, 1);

      // animatsiyani ochiramiz
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.translate(width / 2, height / 2);

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

          // sekin ease-out
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

      const centerGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 10);
      centerGrad.addColorStop(0, "rgba(0, 149, 255, 0.8)");
      centerGrad.addColorStop(1, "rgba(0, 149, 255, 0)");
      ctx.fillStyle = centerGrad;
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
        // fade in the text
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
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [isAnimating]);

  const handleSearch = async () => {
    try {
      // wave animatsiyasi
      setShowSearchWave(true);
      startSearchCircles();

      // serverdan fetch qilamiz
      const res = await fetch("http://localhost:8080/onlineUsers");
      const data = await res.json();
      // data.users => array of { username, lastActive }
      setOnlineUsers(data.users || []);

      // data kirib kelgandan iconlar ko'rsatamiz
      placeUserIcons(data.users);
    } catch (err) {
      console.error("Failed to fetch online users", err);
    }
  };

  // we animate 3 circles expanding from center
  const startSearchCircles = () => {
    // statega aylana qo'shamiz va ularning olchami asta kattalashib boradi
    // keyin esa ularni requestAnimationFrame yoki qisqa setInterval orqali animatsiya qilamiz
    const circleConfigs = [0, 1, 2].map((_, i) => ({
      id: i,
      size: 0,
      opacity: 1,
    }));
    setSearchCircles(circleConfigs);

    // taxminan 1.5 animatsiya qilamiz
    let startTime = Date.now();
    let animationId: number;

    const animateCircles = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const duration = 1500;
      const t = Math.min(elapsed / duration, 1);

      setSearchCircles((oldCircles) =>
        oldCircles.map((c, index) => {
          // each circle is offset in time
          //  yani: 0, 200ms, 400ms
          const delay = index * 200;
          const localT = Math.min(Math.max(0, elapsed - delay) / 1000, 1);
          const progress = localT;
          // it expands up to radius 400 (importtant)
          const size = progress * 400;
          const opacity = 1 - progress;

          return {
            ...c,
            size,
            opacity: opacity < 0 ? 0 : opacity,
          };
        })
      );

      if (t < 1 + 0.5) {
        animationId = requestAnimationFrame(animateCircles);
      } else {
        // keyin esa ularni yashiramiz
        setShowSearchWave(false);
      }
    };

    animateCircles();

    // cleanup qilamiz
    return () => cancelAnimationFrame(animationId);
  };

  // randomly user icon joylaymiz
  const placeUserIcons = (users: OnlineUser[]) => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const centerX = w / 2;
    const centerY = h / 2;

    const newPositions = users.map((u) => {
      const angle = Math.random() * 2 * Math.PI;
      // up to 150 px from center
      const radius = Math.random() * 150;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      return { username: u.username, x, y };
    });
    setUserPositions(newPositions);
    console.log("User positions:", userPositions);
  };

  return (
    <Container>
      <CanvasWrapper ref={wrapperRef}>
        <StyledCanvas ref={canvasRef} />
        {animationComplete && (
          <TextWrapper ref={textRef} $show={animationComplete}>
            <GradientText>:tunnel_chat</GradientText>
          </TextWrapper>
        )}

        {/* // search wave animatsiyasi */}
        {showSearchWave &&
          searchCircles.map((c) => (
            <SearchCircle key={c.id} size={c.size} opacity={c.opacity} />
          ))}
        {userPositions.map((pos) => (
          <UserIcon key={pos.username} x={pos.x} y={pos.y} />
        ))}
      </CanvasWrapper>
      <Button variant="add" onClick={handleSearch} position="center">
        {" "}
        Search Friends
      </Button>
      {/* <SearchButton onClick={handleSearch}>Search Online Users</SearchButton> */}
    </Container>
  );
};

export default TunnelHome;
