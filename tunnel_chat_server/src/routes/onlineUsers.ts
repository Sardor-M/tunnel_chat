import { Router, Request, Response } from "express";
import { connectedClients } from "../server";

export const onlineUsersRouter = Router();

onlineUsersRouter.get("/", (req: Request, res: Response): void => {
  // connectedClientsdan online userlarni retrieve qip olamiz
  const onlineUsernames = Object.keys(connectedClients);

  // keyin esa detailed info arrray yaratamiz
  const onlineDetails = onlineUsernames.map((users) => ({
    username: users,
    lastActive: connectedClients[users].lastActive,
  }));

  res.json({ users: onlineDetails });
});
