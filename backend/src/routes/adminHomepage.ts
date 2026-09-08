import { Router, Response } from "express";
import { readData, writeData } from "../lib/db";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

interface HomepageData {
  heroTitle: string;
  heroSubtitle: string;
  heroImagePath: string;
  heroVideoUrl: string;
  logoRotation: boolean;
  tickerItems: Array<{
    id: string;
    label: string;
    date: string;
    text: string;
    color: string;
  }>;
  lastUpdated: string;
}

const defaultHomepage: HomepageData = {
  heroTitle: "Reaching the Unreached",
  heroSubtitle: "Connecting generations to the Great Commission",
  heroImagePath: "",
  heroVideoUrl: "",
  logoRotation: true,
  tickerItems: [],
  lastUpdated: new Date().toISOString(),
};

// GET /api/admin/homepage
router.get("/", requireAuth, async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const homepage = readData<HomepageData>("homepage.json", defaultHomepage);
    res.json(homepage);
  } catch (error) {
    console.error("Homepage GET error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/admin/homepage
router.put("/", requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const body = req.body;
    const current = readData<HomepageData>("homepage.json", defaultHomepage);

    const updated: HomepageData = {
      ...current,
      ...body,
      lastUpdated: new Date().toISOString(),
    };

    writeData("homepage.json", updated);
    res.json(updated);
  } catch (error) {
    console.error("Homepage PUT error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
