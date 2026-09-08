import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { sendInquiryEmails } from "../lib/email";

const router = Router();

const fallbackOffices = [
  {
    city: "London (HQ)",
    address: "120 St James's Square, London, SW1Y 4JH",
    phone: "+44 20 7946 0192",
    email: "london.hq@meruglobal.org",
    hours: "9:00 AM - 5:30 PM GMT",
  },
  {
    city: "Singapore (Asia Hub)",
    address: "10 Anson Rd, International Plaza, Singapore 079903",
    phone: "+65 6789 0122",
    email: "singapore.ops@meruglobal.org",
    hours: "9:00 AM - 6:00 PM SGT",
  },
  {
    city: "Bogota (LATAM Hub)",
    address: "Cra. 11 #78-22, Bogota, Colombia",
    phone: "+57 601 456 7890",
    email: "bogota.ops@meruglobal.org",
    hours: "8:00 AM - 5:00 PM COT",
  },
  {
    city: "Tokyo Office",
    address: "1-chome, Shinjuku, Shinjuku City, Tokyo 160-0022",
    phone: "+81 3 5555 0143",
    email: "tokyo.relations@meruglobal.org",
    hours: "9:00 AM - 6:00 PM JST",
  },
];

// GET /api/contact
router.get("/", async (_req: Request, res: Response): Promise<void> => {
  try {
    const contactInfo = await prisma.contactInfo.findFirst();

    if (!contactInfo) {
      res.json({
        phone: "+44 20 7946 0192",
        email: "connect@meruglobal.org",
        address: "120 St James's Square, London, SW1Y 4JH",
        socialLinks: {},
        googleMapsEmbed: "",
        offices: fallbackOffices,
      });
      return;
    }

    res.json({
      phone: contactInfo.phone,
      email: contactInfo.email,
      address: contactInfo.address,
      socialLinks: contactInfo.socialLinks ? JSON.parse(contactInfo.socialLinks) : {},
      googleMapsEmbed: contactInfo.googleMapsEmbed || "",
      offices: contactInfo.offices ? JSON.parse(contactInfo.offices) : fallbackOffices,
    });
  } catch (error) {
    console.error("Public contact GET error:", error);
    res.status(500).json({ error: "Failed to load contact information" });
  }
});

// POST /api/contact
router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, department, message } = req.body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      res.status(400).json({ error: "Full Name is required." });
      return;
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      res.status(400).json({ error: "A valid email address is required." });
      return;
    }

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      res.status(400).json({ error: "Message content is required." });
      return;
    }

    const newInquiry = await prisma.inquiry.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? String(phone).trim() : null,
        department: department || "general",
        message: message.trim(),
        status: "new",
      },
    });

    await sendInquiryEmails({
      name: newInquiry.name,
      email: newInquiry.email,
      phone: newInquiry.phone || undefined,
      department: newInquiry.department,
      message: newInquiry.message,
    });

    res.status(201).json({
      success: true,
      message: "Your message has been sent successfully. Our team will review and follow up shortly.",
      inquiryId: newInquiry.id,
    });
  } catch (error) {
    console.error("Public contact POST inquiry error:", error);
    res.status(500).json({ error: "Internal server error. Please try again later." });
  }
});

export default router;
