import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const noCacheHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
};

const defaultArticles = [
  {
    id: "default-1",
    title: "Meru Global Team Establishes Regional Center in Bogota",
    category: "Expansion",
    date: "May 28, 2026",
    desc: "Our South American operations office is now fully staffed and coordinating with municipal education departments to roll out subsidized civic fellowships.",
    gradient: "from-blue-400 to-indigo-500",
    imagePath: "",
  },
  {
    id: "default-2",
    title: "Announcing the 2026 Youth Civic Leadership Fellowship Roster",
    category: "Admissions",
    date: "May 15, 2026",
    desc: "Following a record 4,200 applicants, our advisory board has finalized the 120 delegates who will receive seed grant credentials and 6 months of civic coaching.",
    gradient: "from-purple-400 to-pink-500",
    imagePath: "",
  },
  {
    id: "default-3",
    title: "Meru Partners with 12 New European Academic Councils",
    category: "Partnerships",
    date: "April 10, 2026",
    desc: "The joint agreement facilitates direct credit transfers and curriculum recognition, allowing exchange participants in Germany to earn ECTS credits smoothly.",
    gradient: "from-emerald-400 to-teal-500",
    imagePath: "",
  },
];

export async function GET() {
  try {
    const articles = await prisma.newsArticle.findMany({
      where: { isPublished: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    if (articles.length === 0) {
      return NextResponse.json(defaultArticles, { headers: noCacheHeaders });
    }

    const formatted = articles.map((a) => ({
      id: a.id,
      title: a.title,
      category: a.category,
      date: a.date,
      desc: a.desc,
      content: a.content || "",
      gradient: a.gradient,
      imagePath: a.imagePath || "",
    }));

    return NextResponse.json(formatted, { headers: noCacheHeaders });
  } catch (error) {
    console.error("Public news GET error:", error);
    return NextResponse.json(defaultArticles, { headers: noCacheHeaders });
  }
}
