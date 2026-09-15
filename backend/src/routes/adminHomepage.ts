import { Router, Response } from "express";
import prisma from "../lib/prisma";
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
    const dbSetting = await prisma.homepageSetting.findFirst();

    if (dbSetting) {
      let parsedTickers: any[] = [];
      try {
        parsedTickers = dbSetting.tickerItems ? JSON.parse(dbSetting.tickerItems) : [];
      } catch {
        parsedTickers = [];
      }

      const tickerItems = parsedTickers.map((t: any, idx: number) => ({
        id: t.id || `ticker-${idx + 1}`,
        label: t.label || "NEWS",
        date: t.date || "",
        text: t.text || "",
        color: t.color || "blue",
      }));

      res.json({
        heroTitle: dbSetting.heroTitle || defaultHomepage.heroTitle,
        heroSubtitle: dbSetting.heroSubtitle || defaultHomepage.heroSubtitle,
        heroImagePath: "",
        heroVideoUrl: "",
        logoRotation: true,
        tickerItems,
        lastUpdated: dbSetting.lastUpdated.toISOString(),
      });
      return;
    }

    res.json(defaultHomepage);
  } catch (error) {
    console.error("Admin Homepage GET error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/admin/homepage
router.put("/", requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const body = req.body;
    const heroTitle = body.heroTitle || defaultHomepage.heroTitle;
    const heroSubtitle = body.heroSubtitle || defaultHomepage.heroSubtitle;
    const tickerItems = Array.isArray(body.tickerItems) ? body.tickerItems : [];

    const updated = await prisma.homepageSetting.upsert({
      where: { id: "default" },
      update: {
        heroTitle,
        heroSubtitle,
        tickerItems: JSON.stringify(tickerItems),
        lastUpdated: new Date(),
      },
      create: {
        id: "default",
        heroTitle,
        heroSubtitle,
        tickerItems: JSON.stringify(tickerItems),
        lastUpdated: new Date(),
      },
    });

    res.json({
      heroTitle: updated.heroTitle,
      heroSubtitle: updated.heroSubtitle,
      heroImagePath: body.heroImagePath || "",
      heroVideoUrl: body.heroVideoUrl || "",
      logoRotation: body.logoRotation !== undefined ? body.logoRotation : true,
      tickerItems,
      lastUpdated: updated.lastUpdated.toISOString(),
    });
  } catch (error) {
    console.error("Admin Homepage PUT error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
