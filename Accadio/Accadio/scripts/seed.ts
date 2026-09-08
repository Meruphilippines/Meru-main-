// Seed script — run with: npx tsx scripts/seed.ts
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function writeJSON(filename: string, data: unknown) {
  fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2), "utf-8");
}

async function seed() {
  ensureDir(DATA_DIR);
  ensureDir(path.join(process.cwd(), "public", "uploads", "images"));
  ensureDir(path.join(process.cwd(), "public", "uploads", "videos"));
  ensureDir(path.join(process.cwd(), "public", "uploads", "testimonials"));
  ensureDir(path.join(process.cwd(), "public", "uploads", "programs"));

  // 1. Admin user
  const passwordHash = await bcrypt.hash("MeruAdmin2026!", 12);
  writeJSON("admin.json", [
    {
      id: uuidv4(),
      username: "admin",
      passwordHash,
      mustChangePassword: true,
      createdAt: new Date().toISOString(),
    },
  ]);
  console.log("✓ admin.json seeded (user: admin / MeruAdmin2026!)");

  // 2. Sessions (empty)
  writeJSON("sessions.json", []);
  console.log("✓ sessions.json seeded");

  // 3. Pages
  writeJSON("pages.json", [
    { id: uuidv4(), slug: "home", title: "Home", content: "", status: "published", lastUpdated: new Date().toISOString() },
    { id: uuidv4(), slug: "about", title: "About Us", content: "", status: "published", lastUpdated: new Date().toISOString() },
    { id: uuidv4(), slug: "history", title: "History", content: "", status: "published", lastUpdated: new Date().toISOString() },
    { id: uuidv4(), slug: "programs", title: "Programs", content: "", status: "published", lastUpdated: new Date().toISOString() },
    { id: uuidv4(), slug: "testimonials", title: "Testimonials", content: "", status: "published", lastUpdated: new Date().toISOString() },
    { id: uuidv4(), slug: "contact", title: "Contact", content: "", status: "published", lastUpdated: new Date().toISOString() },
  ]);
  console.log("✓ pages.json seeded");

  // 4. Homepage controls
  writeJSON("homepage.json", {
    heroTitle: "Reaching the Unreached",
    heroSubtitle: "Connecting generations to the Great Commission",
    heroImagePath: "",
    heroVideoUrl: "",
    logoRotation: true,
    tickerItems: [
      { id: uuidv4(), label: "EVENT", date: "JUNE 2026", text: "Global Youth Leadership Summit 2026 registration is now officially open.", color: "blue" },
      { id: uuidv4(), label: "EXPANSION", date: "MAY 2026", text: "Meru expands footprint to South America with new regional offices in Bogota.", color: "emerald" },
      { id: uuidv4(), label: "MILESTONE", date: "APRIL 2026", text: "Corporate Excellence Program achieves milestone of training 50,000+ professionals.", color: "purple" },
      { id: uuidv4(), label: "PARTNERS", date: "MARCH 2026", text: "Partnered with 12 new European academic organizations for global exchanges.", color: "amber" },
    ],
    lastUpdated: new Date().toISOString(),
  });
  console.log("✓ homepage.json seeded");

  // 5. Testimonials
  writeJSON("testimonials.json", []);
  console.log("✓ testimonials.json seeded");

  // 6. Programs
  writeJSON("programs.json", []);
  console.log("✓ programs.json seeded");

  // 7. Contact info
  writeJSON("contact.json", {
    phone: "+1 (555) 123-4567",
    email: "connect@meruglobal.org",
    address: "MERU Global Team, International Office",
    socialLinks: {
      facebook: "",
      twitter: "",
      instagram: "",
      linkedin: "",
      youtube: "",
    },
    googleMapsEmbed: "",
    lastUpdated: new Date().toISOString(),
  });
  console.log("✓ contact.json seeded");

  // 8. Media index
  writeJSON("media.json", []);
  console.log("✓ media.json seeded");

  console.log("\n🎉 All seed data created successfully!");
}

seed().catch(console.error);
