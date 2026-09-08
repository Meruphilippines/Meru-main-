import { destroySession } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;

    if (token) {
      await destroySession(token);
    }

    cookieStore.delete("admin_session");

    return Response.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
