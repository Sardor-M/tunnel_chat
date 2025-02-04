import { useEffect, useRef } from "react";

export default function TunnelHome() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#006DFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // tunnel logic shuyerda boshlanadi
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 100;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = "black";
      ctx.fill();

      // buyerda loop qilish kerak
      requestAnimationFrame(animate);
    };
    animate();

    // clean qilish uchun qaytariladigan funksiya
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <canvas ref={canvasRef} />
    </div>
  );
}
