import express from "express";
import http from "http";
import cors from "cors";
import { Request, Response, NextFunction } from "express";

// type ClientInfo = {
//   socket: WebSocket;
//   username: string;
//   lastActive: number; // qachon kirganligini saqlaymiz
// };

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  })
);

const httpServer = http.createServer(app);

initializeWebSocketServer(httpServer);

// routeslarni register qilamizx
app.use("/auth", authRoutes);
app.use("/chat", chatRoutes);
app.use("/rooms", roomRoutes);
app.use("/files", fileRoutes);
app.use("/onlineUsers", onlineUsersRouter);

app.use("/uploads", express.static("uploads"));

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Error: ${err.message}`);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => {
  logger.info(`Tunnel Chat server listening on http://localhost:${PORT}`);
});

// here we handle the shutdowns
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  httpServer.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });
});
