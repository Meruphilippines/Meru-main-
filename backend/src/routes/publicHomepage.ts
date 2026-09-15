import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";

const router = Router();

const defaultTickerItems = [
  {
    id: "1",
    label: "EVENT",
    date: "JUNE 2026",
    text: "Tokyo Leadership Seminar Applications Now Open",
    color: "blue",
  },
  {
    id: "2",
    label: "EXPANSION",
    date: "MAY 2026",
    text: "New Regional Hub Operational in Bogota, Colombia",
    color: "emerald",
  },
  {
    id: "3",
    label: "MILESTONE",
    date: "APRIL 2026",
    text: "10,000+ Alumni Milestone Reached Worldwide",
    color: "purple",
  },
  {
    id: "4",
    label: "PARTNERS",
    date: "MARCH 2026",
    text: "12 New European Academic Accreditation Partnerships",
    color: "amber",
  },
];

const defaultHomepage = {
  heroTitle: "Reaching the Unreached",
  heroSubtitle: "Connecting generations to the Great Commission",
  heroImagePath: "",
  heroVideoUrl: "",
  logoRotation: true,
  tickerItems: defaultTickerItems,
  lastUpdated: new Date().toISOString(),
};

// GET /api/homepage
router.get("/", async (_req: Request, res: Response): Promise<void> => {
  try {
    const dbSetting = await prisma.homepageSetting.findFirst();

    res.set({
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      Pragma: "no-cache",
    });

    if (dbSetting) {
      let parsedTickers: any[] = [];
      try {
        parsedTickers = dbSetting.tickerItems ? JSON.parse(dbSetting.tickerItems) : [];
      } catch {
        parsedTickers = [];
      }

      const tickerItems = (parsedTickers.length > 0 ? parsedTickers : defaultTickerItems).map(
        (t: any, idx: number) => ({
          id: t.id || `ticker-${idx + 1}`,
          label: t.label || "NEWS",
          date: t.date || "",
          text: t.text || "",
          color: t.color || "blue",
        })
      );

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
    console.error("Public Homepage GET error:", error);
    res.json(defaultHomepage);
  }
});

export default router;
