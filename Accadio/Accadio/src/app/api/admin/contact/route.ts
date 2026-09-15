import { getSessionFromCookie } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

const defaultContact = {
  phone: "+44 20 7946 0192",
  email: "connect@meruglobal.org",
  address: "120 St James's Square, London, SW1Y 4JH",
  socialLinks: { facebook: "", twitter: "", instagram: "", linkedin: "", youtube: "" },
  googleMapsEmbed: "",
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

    let contact = await prisma.contactInfo.findFirst();

    if (!contact) {
      // Create a DB record with defaults so admin UI operates against the database
      try {
        contact = await prisma.contactInfo.create({
          data: {
            phone: defaultContact.phone,
            email: defaultContact.email,
            address: defaultContact.address,
            socialLinks: JSON.stringify(defaultContact.socialLinks),
            googleMapsEmbed: defaultContact.googleMapsEmbed || "",
            lastUpdated: new Date(),
          },
        });
      } catch (err) {
        console.error("Prisma contact create error:", err);
        return Response.json(defaultContact);
      }
    }

    return Response.json({
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

    try {
      revalidatePath("/", "layout");
      revalidatePath("/contact");
    } catch (e) {
      // ignore
    }

    return Response.json({
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
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
