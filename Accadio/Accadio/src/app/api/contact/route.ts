import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendInquiryEmails } from "@/lib/email";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const contactInfo = await prisma.contactInfo.findFirst();

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

    const noCacheHeaders = {
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      Pragma: "no-cache",
    };

    if (!contactInfo) {
      return NextResponse.json(
        {
          phone: "+44 20 7946 0192",
          email: "connect@meruglobal.org",
          address: "120 St James's Square, London, SW1Y 4JH",
          socialLinks: {},
          googleMapsEmbed: "",
          offices: fallbackOffices,
        },
        { headers: noCacheHeaders }
      );
    }

    return NextResponse.json(
      {
        phone: contactInfo.phone,
        email: contactInfo.email,
        address: contactInfo.address,
        socialLinks: contactInfo.socialLinks ? JSON.parse(contactInfo.socialLinks) : {},
        googleMapsEmbed: contactInfo.googleMapsEmbed || "",
        offices: contactInfo.offices ? JSON.parse(contactInfo.offices) : fallbackOffices,
      },
      { headers: noCacheHeaders }
    );
  } catch (error) {
    console.error("Public contact GET error:", error);
    return NextResponse.json(
      { error: "Failed to load contact information" },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          Pragma: "no-cache",
        },
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, department, message } = body;

    // Validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Full Name is required." }, { status: 400 });
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Message content is required." }, { status: 400 });
    }

    // 1. Save to Database
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

    // 2. Dispatch Email Notification (with safe console fallback)
    await sendInquiryEmails({
      name: newInquiry.name,
      email: newInquiry.email,
      phone: newInquiry.phone || undefined,
      department: newInquiry.department,
      message: newInquiry.message,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Your message has been sent successfully. Our team will review and follow up shortly.",
        inquiryId: newInquiry.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Public contact POST inquiry error:", error);
    return NextResponse.json({ error: "Internal server error. Please try again later." }, { status: 500 });
  }
}
