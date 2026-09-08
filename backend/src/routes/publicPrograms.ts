import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { sendInquiryEmails } from "../lib/email";

const router = Router();

// GET /api/programs
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const cat = req.query.cat as string | undefined;
    const q = req.query.q as string | undefined;

    const where: any = {
      isPublished: true,
    };

    if (cat && cat !== "all") {
      where.category = cat;
    }

    if (q) {
      where.OR = [
        { title: { contains: q } },
        { desc: { contains: q } },
        { tag: { contains: q } },
      ];
    }

    const programs = await prisma.program.findMany({
      where,
      orderBy: { order: "asc" },
    });

    const formatted = programs.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      category: p.category,
      tag: p.tag,
      desc: p.desc,
      eligibility: p.eligibility || "",
      benefits: p.benefits ? JSON.parse(p.benefits) : [],
      gradient: p.gradient,
      iconName: p.iconName,
      date: p.date,
      featuredImagePath: p.featuredImagePath,
      videoUrl: p.videoUrl || "",
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Public programs GET error:", error);
    res.status(500).json({ error: "Failed to load programs" });
  }
});

// POST /api/programs/register
router.post("/register", async (req: Request, res: Response): Promise<void> => {
  try {
    const { programId, programName, name, email, phone, education, statement } = req.body;

    if (!programName || typeof programName !== "string") {
      res.status(400).json({ error: "Program Name is required." });
      return;
    }

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      res.status(400).json({ error: "Applicant Name is required." });
      return;
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      res.status(400).json({ error: "A valid email address is required." });
      return;
    }

    const registration = await prisma.programRegistration.create({
      data: {
        programId: programId || null,
        programName: programName.trim(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? String(phone).trim() : null,
        education: education ? String(education).trim() : null,
        statement: statement ? String(statement).trim() : null,
        status: "pending",
      },
    });

    await sendInquiryEmails({
      name: registration.name,
      email: registration.email,
      phone: registration.phone || undefined,
      department: "Admissions (Program Registration)",
      message: `[NEW REGISTRATION APPLIED]\nProgram: ${registration.programName}\nApplicant: ${registration.name}\nEmail: ${registration.email}\nPhone: ${registration.phone || "Not provided"}\nEducation/Background: ${registration.education || "Not specified"}\nStatement/Motivation:\n${registration.statement || "None"}`,
    });

    res.status(201).json({
      success: true,
      message: `Successfully registered for "${registration.programName}". The admissions board will review your application.`,
      registrationId: registration.id,
    });
  } catch (error) {
    console.error("Program registration error:", error);
    res.status(500).json({ error: "Internal server error. Please try again." });
  }
});

export default router;
