import { Router, Response } from "express";
import prisma from "../lib/prisma";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

const defaultContact = {
  phone: "+44 20 7946 0192",
  email: "connect@meruglobal.org",
  address: "120 St James's Square, London, SW1Y 4JH",
  socialLinks: { facebook: "", twitter: "", instagram: "", linkedin: "", youtube: "" },
  googleMapsEmbed: "",
  lastUpdated: new Date().toISOString(),
};

// GET /api/admin/contact
router.get("/", requireAuth, async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const contact = await prisma.contactInfo.findFirst();

    if (!contact) {
      res.json(defaultContact);
      return;
    }

    res.json({
      id: contact.id,
      phone: contact.phone,
      email: contact.email,
      address: contact.address,
      socialLinks: contact.socialLinks ? JSON.parse(contact.socialLinks) : defaultContact.socialLinks,
      googleMapsEmbed: contact.googleMapsEmbed || "",
      lastUpdated: contact.lastUpdated.toISOString(),
    });
  } catch (error) {
    console.error("Contact GET error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/admin/contact
router.put("/", requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const body = req.body;
    const existing = await prisma.contactInfo.findFirst();

    const existingSocial = existing?.socialLinks ? JSON.parse(existing.socialLinks) : defaultContact.socialLinks;
    const mergedSocial = { ...existingSocial, ...(body.socialLinks || {}) };

    let updated;
    if (existing) {
      updated = await prisma.contactInfo.update({
        where: { id: existing.id },
        data: {
          phone: body.phone !== undefined ? body.phone : existing.phone,
          email: body.email !== undefined ? body.email : existing.email,
          address: body.address !== undefined ? body.address : existing.address,
          socialLinks: JSON.stringify(mergedSocial),
          googleMapsEmbed: body.googleMapsEmbed !== undefined ? body.googleMapsEmbed : existing.googleMapsEmbed,
          lastUpdated: new Date(),
        },
      });
    } else {
      updated = await prisma.contactInfo.create({
        data: {
          phone: body.phone || defaultContact.phone,
          email: body.email || defaultContact.email,
          address: body.address || defaultContact.address,
          socialLinks: JSON.stringify(mergedSocial),
          googleMapsEmbed: body.googleMapsEmbed || "",
          lastUpdated: new Date(),
        },
      });
    }

    res.json({
      id: updated.id,
      phone: updated.phone,
      email: updated.email,
      address: updated.address,
      socialLinks: mergedSocial,
      googleMapsEmbed: updated.googleMapsEmbed || "",
      lastUpdated: updated.lastUpdated.toISOString(),
    });
  } catch (error) {
    console.error("Contact PUT error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
