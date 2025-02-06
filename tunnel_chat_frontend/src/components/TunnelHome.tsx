import React, { useEffect, useRef, useState } from "react";

export default function TunnelHome() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // initial kanvas sizneni parentga qarab to'g'irlab olish
    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };

    resizeCanvas();

    window.addEventListener("resize", resizeCanvas);

    // animation sikli
    const animate = () => {
      const width = canvas.width;
      const height = canvas.height;

      // har bir renderingda canvasni tozalaymiz
      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, width, height);

      // centerga joylaymiz
      ctx.save();
      ctx.translate(width / 2, height / 2);

      // mouse hoverga qarab rotate qilishni trigger qilamiz
      // in radian, 28.6 degree
      const maxRotation = 0.5;
      const rotationFactor = (mouseX / width - 0.5) * 2 * maxRotation;
      ctx.rotate(rotationFactor);

      // ring yoki halqa shaklida aylanadi
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1;

      const linesCount = 60;
      const stepAngle = (2 * Math.PI) / linesCount;
      const radius = Math.min(width, height) * 0.45;

      for (let i = 0; i < linesCount; i++) {
        ctx.save();
        ctx.rotate(i * stepAngle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(radius, 0);
        ctx.stroke();
        ctx.restore();
      }

      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, 2 * Math.PI);
      ctx.stroke();

      ctx.restore();
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [mouseX, mouseY]);

  // root container ichida mouse hovering eventni kuzatamiz
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setMouseX(e.clientX);
    setMouseY(e.clientY);
  };

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
      }}
      onMouseMove={handleMouseMove}
    />
  );
}
