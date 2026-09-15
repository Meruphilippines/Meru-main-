export interface SendInquiryNotificationOptions {
  name: string;
  email: string;
  phone?: string;
  department: string;
  message: string;
}

export async function sendInquiryEmails(inquiry: SendInquiryNotificationOptions): Promise<{ success: boolean; simulated?: boolean; error?: string }> {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "admin@meruglobal.org";
  const fromEmail = process.env.SMTP_FROM || "Accadio <noreply@meruglobal.org>";

  const subject = `[New Inquiry] ${inquiry.department.toUpperCase()} - ${inquiry.name}`;
  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #2563eb; margin-top: 0;">New Website Inquiry Received</h2>
      <p style="color: #64748b; font-size: 14px;">A new inquiry has been submitted through the Accadio web portal.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 8px; font-weight: bold; color: #334155; width: 120px; border-bottom: 1px solid #f1f5f9;">Name:</td>
          <td style="padding: 8px; color: #0f172a; border-bottom: 1px solid #f1f5f9;">${escapeHtml(inquiry.name)}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; color: #334155; border-bottom: 1px solid #f1f5f9;">Email:</td>
          <td style="padding: 8px; color: #0f172a; border-bottom: 1px solid #f1f5f9;"><a href="mailto:${escapeHtml(inquiry.email)}">${escapeHtml(inquiry.email)}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; color: #334155; border-bottom: 1px solid #f1f5f9;">Phone:</td>
          <td style="padding: 8px; color: #0f172a; border-bottom: 1px solid #f1f5f9;">${escapeHtml(inquiry.phone || "Not provided")}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold; color: #334155; border-bottom: 1px solid #f1f5f9;">Department:</td>
          <td style="padding: 8px; color: #0f172a; border-bottom: 1px solid #f1f5f9;"><strong>${escapeHtml(inquiry.department)}</strong></td>
        </tr>
      </table>

      <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 12px 16px; margin: 20px 0;">
        <h4 style="margin: 0 0 8px 0; color: #334155;">Message Content:</h4>
        <p style="margin: 0; color: #1e293b; white-space: pre-wrap;">${escapeHtml(inquiry.message)}</p>
      </div>

      <p style="color: #94a3b8; font-size: 12px; margin-top: 30px; border-top: 1px solid #f1f5f9; padding-top: 12px;">
        You can review and manage this inquiry in the Accadio Admin Portal under Inquiries.
      </p>
    </div>
  `;

  // 1. Check if Resend API Key is available
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: adminEmail,
          subject,
          html: htmlContent,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error("Resend API error:", err);
        return { success: false, error: err };
      }
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Resend email dispatch error:", message);
      return { success: false, error: message };
    }
  }

  // 2. Check if SMTP configuration is available
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    try {
      // @ts-ignore
      const nodemailer = await import("nodemailer").catch(() => null);
      if (nodemailer) {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || "587", 10),
          secure: process.env.SMTP_PORT === "465",
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        await transporter.sendMail({
          from: fromEmail,
          to: adminEmail,
          subject,
          html: htmlContent,
        });

        return { success: true };
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("SMTP email dispatch error:", message);
      return { success: false, error: message };
    }
  }

  // 3. Fallback: Local simulation mode (no API keys configured)
  console.log("------------------------------------------------------------");
  console.log("📨 [SIMULATED EMAIL NOTIFICATION] (No SMTP/Resend keys set)");
  console.log(`To: ${adminEmail}`);
  console.log(`From: ${inquiry.name} <${inquiry.email}> [${inquiry.department}]`);
  console.log(`Subject: ${subject}`);
  console.log(`Message:\n${inquiry.message}`);
  console.log("------------------------------------------------------------");

  return { success: true, simulated: true };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
