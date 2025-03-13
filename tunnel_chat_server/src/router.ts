// router.ts
import { Express, Request, Response } from "express";
import multer from "multer";
import path from "path";
import {
  login,
  register,
  validateToken,
  createRoom,
  getRoomsList,
  joinRoom,
  leaveRoom,
  getRoomMembers,
  getMessageHistory,
  uploadFile,
  downloadFile,
  getFileMetadata,
  deleteFile,
  getOnlineUsers,
} from "./controller";
import { authenticate, validateParam } from "./utils";

// configure the multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 15)}`;
    const ext = path.extname(file.originalname);
    cb(null, `file-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
});

export function initRouter(app: Express) {
  app.post("/auth/login", login);
  app.post("/auth/register", register);
  app.post("/auth/validate", validateToken);

  // room routes
  app.get("/rooms/list", authenticate, getRoomsList);
  app.post("/rooms/create", authenticate, createRoom);
  app.post("/rooms/join", authenticate, joinRoom);
  app.post("/rooms/leave", authenticate, leaveRoom);
  app.get(
    "/rooms/:roomId/members",
    authenticate,
    validateParam("roomId"),
    getRoomMembers
  );

  app.get(
    "/chat/history/:roomId",
    authenticate,
    validateParam("roomId"),
    getMessageHistory
  );

  app.post("/files/upload", authenticate, upload.single("file"), uploadFile);
  app.get(
    "/files/download/:fileId",
    authenticate,
    validateParam("fileId"),
    downloadFile
  );
  app.get(
    "/files/metadata/:fileId",
    authenticate,
    validateParam("fileId"),
    getFileMetadata
  );
  app.delete(
    "/files/:fileId",
    authenticate,
    validateParam("fileId"),
    deleteFile
  );

  app.get("/onlineUsers", authenticate, getOnlineUsers);

  //  health check
  app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({ status: "ok" });
  });
}
