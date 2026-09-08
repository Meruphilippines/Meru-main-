import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendInquiryEmails } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { programId, programName, name, email, phone, education, statement } = body;

    if (!programName || typeof programName !== "string") {
      return NextResponse.json({ error: "Program Name is required." }, { status: 400 });
    }

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Applicant Name is required." }, { status: 400 });
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }

    // 1. Create registration record in database
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

    // 2. Also log an inquiry for cross-notification
    await sendInquiryEmails({
      name: registration.name,
      email: registration.email,
      phone: registration.phone || undefined,
      department: "Admissions (Program Registration)",
      message: `[NEW REGISTRATION APPLIED]\nProgram: ${registration.programName}\nApplicant: ${registration.name}\nEmail: ${registration.email}\nPhone: ${registration.phone || "Not provided"}\nEducation/Background: ${registration.education || "Not specified"}\nStatement/Motivation:\n${registration.statement || "None"}`,
    });

    return NextResponse.json(
      {
        success: true,
        message: `Successfully registered for "${registration.programName}". The admissions board will review your application.`,
        registrationId: registration.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Program registration error:", error);
    return NextResponse.json({ error: "Internal server error. Please try again." }, { status: 500 });
  }
}
