import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";

const router = Router();

// GET /api/history
router.get("/", async (_req: Request, res: Response): Promise<void> => {
  try {
    const slots = await prisma.historySlot.findMany({
      orderBy: [{ order: "asc" }, { year: "desc" }],
    });
    res.json(slots);
  } catch (error) {
    console.error("Public History GET error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
