import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

declare global {
  namespace Express {
    interface Request {
      user?: {
        username: string;
      };
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      res.status(401).json({ message: "Authorization header missing" });
      return;
    }
    
    if (!authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Invalid authorization format" });
      return;
    }
    
    const token = authHeader.split(" ")[1];
    
    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
      if (err) {
        res.status(401).json({ message: "Invalid or expired token" });
        return;
      }
      
      req.user = {
        username: decoded.username,
      };
      
      next();
    });
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export function validateParam(paramName: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.params[paramName]) {
      res.status(400).json({ message: `${paramName} parameter is required` });
      return;
    }
    
    next();
  };
}