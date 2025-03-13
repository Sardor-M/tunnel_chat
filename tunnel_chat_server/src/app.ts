// import express from "express";
// import http from "http";
// import cors from "cors";
// import { Request, Response, NextFunction } from "express";
// import { initializeWebSocketServer } from "./config/websocket";
// import { authRoutes } from "./routes/authRoutes";
// import { chatRoutes } from "./routes/chatRoutes";
// import { roomRoutes } from "./routes/roomRoutes";
// import { fileRoutes } from "./routes/fileRoutes";
// import { logger } from "./utils/logger";

// interface CustomError extends Error {
//   status?: number;
// }

// // type ClientInfo = {
// //   socket: WebSocket;
// //   username: string;
// //   lastActive: number; // qachon kirganligini saqlaymiz
// // };

// const app = express();
// app.use(express.json());
// app.use(
//   cors({
//     origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
//   })
// );

// const httpServer = http.createServer(app);

// initializeWebSocketServer(httpServer);

// // routeslarni register qilamizx
// app.use("/auth", authRoutes);
// app.use("/chat", chatRoutes);
// app.use("/rooms", roomRoutes);
// app.use("/files", fileRoutes);
// // app.use("/onlineUsers", onlineUsersRouter);

// app.use("/uploads", express.static("uploads"));

// app.use((err: CustomError, req: Request, res: Response, next: NextFunction) => {
//   logger.error(`Error: ${err.message}`);
//   res.status(err.status || 500).json({
//     message: err.message || "Internal Server Error",
//   });
// });

// const PORT = process.env.PORT || 8080;
// httpServer.listen(PORT, () => {
//   logger.info(`Tunnel Chat server listening on http://localhost:${PORT}`);
// });

// // here we handle the shutdowns
// process.on("SIGTERM", () => {
//   logger.info("SIGTERM received, shutting down gracefully");
//   httpServer.close(() => {
//     logger.info("HTTP server closed");
//     process.exit(0);
//   });
// });

import express from "express";
import http from "http";
import cors from "cors";
import path from "path";
import { initRouter } from "./router";
import { setupWebSocket } from "./websocket";
import fs from "fs";

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  })
);

const server = http.createServer(app);

setupWebSocket(server);

initRouter(app);

// Serve static files for testing
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`Created uploads directory: ${uploadDir}`);
}

// error handler as of now
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(`Error: ${err.message}`);
    res.status(err.status || 500).json({
      message: err.message || "Internal Server Error",
    });
  }
);

// start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Tunnel Chat server listening on http://localhost:${PORT}`);
});
