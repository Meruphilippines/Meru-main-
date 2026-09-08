import { getSessionFromCookie } from "@/lib/auth";
import { readData, writeData } from "@/lib/db";
import { headers } from "next/headers";

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
    const session = getSessionFromCookie(cookieHeader);

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const homepage = readData<HomepageData>("homepage.json", defaultHomepage);
    return Response.json(homepage);
  } catch (error) {
    console.error("Homepage GET error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const headersList = await headers();
    const cookieHeader = headersList.get("cookie");
    const session = getSessionFromCookie(cookieHeader);

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
    return Response.json(updated);
  } catch (error) {
    console.error("Homepage PUT error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
