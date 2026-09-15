import { readData } from "@/lib/db";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface TickerItem {
  id: string;
  label: string;
  date: string;
  text: string;
  color: string;
}

interface HomepageData {
  heroTitle: string;
  heroSubtitle: string;
  heroImagePath: string;
  heroVideoUrl: string;
  logoRotation: boolean;
  tickerItems: TickerItem[];
  lastUpdated: string;
}

const defaultTickerItems: TickerItem[] = [
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

const defaultHomepage: HomepageData = {
  heroTitle: "Reaching the Unreached",
  heroSubtitle: "Connecting generations to the Great Commission",
  heroImagePath: "",
  heroVideoUrl: "",
  logoRotation: true,
  tickerItems: defaultTickerItems,
  lastUpdated: new Date().toISOString(),
};

export async function GET() {
  try {
    // 1. Try reading from Prisma HomepageSetting table first
    const dbSetting = await prisma.homepageSetting.findFirst();
    const fileData = readData<HomepageData>("homepage.json", defaultHomepage);
    const noCacheHeaders = {
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      Pragma: "no-cache",
    };

    if (dbSetting) {
      let parsedTickers: any[] = [];
      try {
        parsedTickers = dbSetting.tickerItems ? JSON.parse(dbSetting.tickerItems) : [];
      } catch {
        parsedTickers = [];
      }

      const tickerItems = (parsedTickers.length > 0 ? parsedTickers : (fileData.tickerItems?.length ? fileData.tickerItems : defaultTickerItems)).map(
        (t: any, idx: number) => ({
          id: t.id || `ticker-${idx + 1}`,
          label: t.label || "NEWS",
          date: t.date || "",
          text: t.text || "",
          color: t.color || "blue",
        })
      );

      return Response.json(
        {
          heroTitle: dbSetting.heroTitle || fileData.heroTitle || defaultHomepage.heroTitle,
          heroSubtitle: dbSetting.heroSubtitle || fileData.heroSubtitle || defaultHomepage.heroSubtitle,
          heroImagePath: fileData.heroImagePath || "",
          heroVideoUrl: fileData.heroVideoUrl || "",
          logoRotation: fileData.logoRotation !== undefined ? fileData.logoRotation : true,
          tickerItems,
          lastUpdated: dbSetting.lastUpdated.toISOString(),
        },
        {
          headers: noCacheHeaders,
        }
      );
    }

    // 2. Fallback to homepage.json file store
    const rawItems = fileData.tickerItems && fileData.tickerItems.length > 0 ? fileData.tickerItems : defaultTickerItems;
    const tickerItems = rawItems.map((t: any, idx: number) => ({
      id: t.id || `ticker-${idx + 1}`,
      label: t.label || "NEWS",
      date: t.date || "",
      text: t.text || "",
      color: t.color || "blue",
    }));

    const result = {
      ...defaultHomepage,
      ...fileData,
      tickerItems,
    };

    return Response.json(result, {
      headers: noCacheHeaders,
    });
  } catch (error) {
    console.error("Public Homepage GET error:", error);
    return Response.json(defaultHomepage, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        Pragma: "no-cache",
      },
    });
  }
}
