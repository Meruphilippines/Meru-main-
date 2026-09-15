import { getSessionFromCookie } from "@/lib/auth";
import { readData, writeData } from "@/lib/db";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

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

export async function GET() {
  try {
    const headersList = await headers();
    const cookieHeader = headersList.get("cookie");
    const session = await getSessionFromCookie(cookieHeader);

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const fileData = readData<HomepageData>("homepage.json", defaultHomepage);

    try {
      const dbSetting = await prisma.homepageSetting.findFirst();
      if (dbSetting) {
        let parsedTickers: any[] = [];
        try {
          parsedTickers = dbSetting.tickerItems ? JSON.parse(dbSetting.tickerItems) : [];
        } catch {
          parsedTickers = [];
        }

        const tickerItems = (parsedTickers.length > 0 ? parsedTickers : (fileData.tickerItems || [])).map(
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
            headers: {
              "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
              Pragma: "no-cache",
            },
          }
        );
      }
    } catch (e) {
      console.error("Prisma homepage GET error:", e);
    }

    return Response.json(fileData, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        Pragma: "no-cache",
      },
    });
  } catch (error) {
    console.error("Homepage GET error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const headersList = await headers();
    const cookieHeader = headersList.get("cookie");
    const session = await getSessionFromCookie(cookieHeader);

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const current = readData<HomepageData>("homepage.json", defaultHomepage);

    const updated: HomepageData = {
      ...current,
      ...body,
      lastUpdated: new Date().toISOString(),
    };

    writeData("homepage.json", updated);

    try {
      await prisma.homepageSetting.upsert({
        where: { id: "default" },
        update: {
          heroTitle: updated.heroTitle,
          heroSubtitle: updated.heroSubtitle,
          tickerItems: JSON.stringify(updated.tickerItems || []),
          lastUpdated: new Date(),
        },
        create: {
          id: "default",
          heroTitle: updated.heroTitle,
          heroSubtitle: updated.heroSubtitle,
          tickerItems: JSON.stringify(updated.tickerItems || []),
          lastUpdated: new Date(),
        },
      });
    } catch (dbErr) {
      console.error("Prisma homepage PUT error:", dbErr);
    }

    try {
      revalidatePath("/", "layout");
    } catch (e) {
      // ignore
    }

    return Response.json(updated);
  } catch (error) {
    console.error("Homepage PUT error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
