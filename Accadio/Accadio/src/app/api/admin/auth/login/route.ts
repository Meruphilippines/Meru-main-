import { getAdmin, verifyPassword, createSession } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return Response.json({ error: "Username and password are required" }, { status: 400 });
    }

    const cleanUsername = String(username).trim();
    const cleanPassword = String(password).trim();

    // 1. Fetch admin user from database (or JSON fallback)
    const admin = await getAdmin();

    // 2. Validate Username (case-insensitive)
    if (admin.username.toLowerCase() !== cleanUsername.toLowerCase()) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // 3. Verify Password using bcrypt
    const isPasswordValid = await verifyPassword(cleanPassword, admin.passwordHash);

    if (!isPasswordValid) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // 4. Create Session in Database
    const session = await createSession(admin.id);

    // 5. Set Cookie in Browser Response
    const cookieStore = await cookies();
    cookieStore.set("admin_session", session.token, {
      httpOnly: true,
      secure: false, // Compatible with both HTTP and HTTPS proxies/custom domains
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 60, // 30 minutes
    });

    return Response.json({
      success: true,
      username: admin.username,
      mustChangePassword: admin.mustChangePassword ?? false,
    });
  } catch (error) {
    console.error("Login error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
