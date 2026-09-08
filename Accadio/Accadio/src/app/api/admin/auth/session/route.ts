import { getAdmin, getSessionFromCookie } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
  try {
    const headersList = await headers();
    const cookieHeader = headersList.get("cookie");
    const session = await getSessionFromCookie(cookieHeader);

    if (!session) {
      return Response.json({ authenticated: false }, { status: 401 });
    }

    const admin = await getAdmin();

    return Response.json({
      authenticated: true,
      username: admin.username,
      mustChangePassword: admin.mustChangePassword,
    });
  } catch (error) {
    console.error("Session check error:", error);
    return Response.json({ authenticated: false }, { status: 401 });
  }
}
