import { Router, Response } from "express";
import prisma from "../lib/prisma";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

function safeParseArray(val: string | null | undefined): string[] {
  if (!val) return [];
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [String(parsed)];
  } catch {
    return val ? [val] : [];
  }
}

// GET /api/admin/programs
router.get("/", requireAuth, async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const programs = await prisma.program.findMany({
      orderBy: { order: "asc" },
    });

    const formatted = programs.map((p) => ({
      id: p.id,
      name: p.title,
      title: p.title,
      description: p.desc,
      desc: p.desc,
      date: p.date || "",
      featuredImagePath: p.featuredImagePath || "",
      videoUrl: p.videoUrl || "",
      category: p.category,
      tag: p.tag,
      eligibility: p.eligibility || "",
      benefits: safeParseArray(p.benefits),
      gradient: p.gradient || "from-blue-400 to-indigo-500",
      iconName: p.iconName || "Compass",
      createdAt: p.createdAt.toISOString(),
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Programs GET error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/admin/programs
router.post("/", requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const body = req.body;
    const title = body.title || body.name;
    const desc = body.desc || body.description || "";
    const { date, featuredImagePath, videoUrl, category, tag, eligibility, benefits, gradient, iconName } = body;

    if (!title || !String(title).trim()) {
      res.status(400).json({ error: "Program name is required" });
      return;
    }

    const count = await prisma.program.count();

    const newProgram = await prisma.program.create({
      data: {
        title: String(title).trim(),
        desc: String(desc).trim(),
        category: category || "academic",
        tag: tag || "Academic Program",
        date: date || "",
        featuredImagePath: featuredImagePath || "",
        videoUrl: videoUrl || "",
        eligibility: eligibility || null,
        benefits: benefits ? (typeof benefits === "string" ? benefits : JSON.stringify(benefits)) : null,
        gradient: gradient || "from-blue-400 to-indigo-500",
        iconName: iconName || "Compass",
        order: count + 1,
      },
    });

    res.status(201).json({
      id: newProgram.id,
      name: newProgram.title,
      title: newProgram.title,
      description: newProgram.desc,
      desc: newProgram.desc,
      date: newProgram.date,
      featuredImagePath: newProgram.featuredImagePath,
      videoUrl: newProgram.videoUrl,
      category: newProgram.category,
      tag: newProgram.tag,
      eligibility: newProgram.eligibility || "",
      benefits: safeParseArray(newProgram.benefits),
      gradient: newProgram.gradient,
      iconName: newProgram.iconName,
      createdAt: newProgram.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Programs POST error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/admin/programs/:id
router.get("/:id", requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const item = await prisma.program.findUnique({ where: { id } });

    if (!item) {
      res.status(404).json({ error: "Program not found" });
      return;
    }

    res.json({
      id: item.id,
      name: item.title,
      title: item.title,
      description: item.desc,
      desc: item.desc,
      date: item.date || "",
      featuredImagePath: item.featuredImagePath || "",
      videoUrl: item.videoUrl || "",
      category: item.category,
      tag: item.tag,
      eligibility: item.eligibility || "",
      benefits: safeParseArray(item.benefits),
      gradient: item.gradient || "from-blue-400 to-indigo-500",
      iconName: item.iconName || "Compass",
      createdAt: item.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Program GET error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/admin/programs/:id
router.put("/:id", requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const body = req.body;

    const title = body.title !== undefined ? body.title : body.name;
    const desc = body.desc !== undefined ? body.desc : body.description;

    const updateData: any = {};
    if (title !== undefined) updateData.title = String(title).trim();
    if (desc !== undefined) updateData.desc = String(desc).trim();
    if (body.date !== undefined) updateData.date = body.date;
    if (body.featuredImagePath !== undefined) updateData.featuredImagePath = body.featuredImagePath;
    if (body.videoUrl !== undefined) updateData.videoUrl = body.videoUrl;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.tag !== undefined) updateData.tag = body.tag;
    if (body.eligibility !== undefined) updateData.eligibility = body.eligibility;
    if (body.benefits !== undefined) {
      updateData.benefits = typeof body.benefits === "string" ? body.benefits : JSON.stringify(body.benefits);
    }
    if (body.gradient !== undefined) updateData.gradient = body.gradient;
    if (body.iconName !== undefined) updateData.iconName = body.iconName;

    const updated = await prisma.program.update({
      where: { id },
      data: updateData,
    });

    res.json({
      id: updated.id,
      name: updated.title,
      title: updated.title,
      description: updated.desc,
      desc: updated.desc,
      date: updated.date,
      featuredImagePath: updated.featuredImagePath,
      videoUrl: updated.videoUrl,
      category: updated.category,
      tag: updated.tag,
      eligibility: updated.eligibility || "",
      benefits: safeParseArray(updated.benefits),
      gradient: updated.gradient,
      iconName: updated.iconName,
      createdAt: updated.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Program PUT error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/admin/programs/:id
router.delete("/:id", requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.program.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error("Program DELETE error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
