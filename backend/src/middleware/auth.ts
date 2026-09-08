import { Request, Response, NextFunction } from "express";
import { validateSession, Session } from "../lib/auth";

export interface AuthenticatedRequest extends Request {
  sessionUser?: Session;
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  const token = req.cookies?.admin_session;
  if (!token) {
    res.status(401).json({ error: "Unauthorized: Please log in" });
    return;
  }

  const session = await validateSession(token);
  if (!session) {
    res.status(401).json({ error: "Unauthorized: Invalid or expired session" });
    return;
  }

  req.sessionUser = session;
  next();
}
