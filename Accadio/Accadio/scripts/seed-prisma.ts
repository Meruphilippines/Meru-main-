import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function seed() {
  console.log("🌱 Seeding Supabase database via Prisma...");

  // 1. Admin User
  const passwordHash = await bcrypt.hash("MeruAdmin2026!", 12);
  await prisma.adminUser.upsert({
    where: { username: "admin" },
    update: { passwordHash, mustChangePassword: false },
    create: {
      username: "admin",
      passwordHash,
      mustChangePassword: false,
    },
  });
  console.log("✓ AdminUser seeded (user: admin / MeruAdmin2026!)");

  // 2. Homepage Settings
  const defaultTickerItems = JSON.stringify([
    { id: "1", label: "EVENT", date: "JUNE 2026", text: "Global Youth Leadership Summit 2026 registration is now open.", color: "blue" },
    { id: "2", label: "EXPANSION", date: "MAY 2026", text: "Meru expands footprint to South America with new regional offices.", color: "emerald" },
    { id: "3", label: "MILESTONE", date: "APRIL 2026", text: "Corporate Excellence Program achieves milestone of training 50,000+ professionals.", color: "purple" },
    { id: "4", label: "PARTNERS", date: "MARCH 2026", text: "Partnered with 12 new European academic organizations for global exchanges.", color: "amber" },
  ]);

  await prisma.homepageSetting.upsert({
    where: { id: "default" },
    update: {
      heroTitle: "Reaching the Unreached",
      heroSubtitle: "Connecting generations to the Great Commission",
      tickerItems: defaultTickerItems,
    },
    create: {
      id: "default",
      heroTitle: "Reaching the Unreached",
      heroSubtitle: "Connecting generations to the Great Commission",
      tickerItems: defaultTickerItems,
    },
  });
  console.log("✓ HomepageSettings seeded");

  // 3. Contact Info
  const existingContact = await prisma.contactInfo.findFirst();
  if (!existingContact) {
    await prisma.contactInfo.create({
      data: {
        phone: "+1 (555) 123-4567",
        email: "connect@meruglobal.org",
        address: "MERU Global Team, International Office",
        socialLinks: JSON.stringify({
          facebook: "https://facebook.com",
          twitter: "https://twitter.com",
          instagram: "https://instagram.com",
          linkedin: "https://linkedin.com",
          youtube: "https://youtube.com",
        }),
      },
    });
    console.log("✓ ContactInfo seeded");
  }

  // 4. Default Pages
  const pages = [
    { slug: "home", title: "Home", content: "Welcome to Meru Global" },
    { slug: "about", title: "About Us", content: "Connecting Global Opportunities Through Excellence." },
    { slug: "history", title: "History", content: "Our journey and milestones." },
    { slug: "programs", title: "Programs", content: "International youth leadership and corporate capability programs." },
    { slug: "testimonials", title: "Testimonials", content: "Hear from our global alumni and partners." },
    { slug: "contact", title: "Contact", content: "Get in touch with the Meru Global team." },
  ];

  for (const p of pages) {
    await prisma.pageContent.upsert({
      where: { slug: p.slug },
      update: { title: p.title, content: p.content },
      create: { slug: p.slug, title: p.title, content: p.content, status: "published" },
    });
  }
  console.log("✓ Default pages seeded");

  // 5. News Articles
  const defaultArticles = [
    {
      title: "Meru Global Team Establishes Regional Center in Bogota",
      category: "Expansion",
      date: "May 28, 2026",
      desc: "Our South American operations office is now fully staffed and coordinating with municipal education departments to roll out subsidized civic fellowships.",
      content: "Our South American operations office is now fully staffed and coordinating with municipal education departments to roll out subsidized civic fellowships. This milestone allows MERU to directly connect with grassroots communities in Colombia and neighboring regions, extending our reach to unreached areas with educational resources and leadership programs.",
      gradient: "from-blue-400 to-indigo-500",
      imagePath: "",
      isPublished: true,
      order: 1,
    },
    {
      title: "Announcing the 2026 Youth Civic Leadership Fellowship Roster",
      category: "Admissions",
      date: "May 15, 2026",
      desc: "Following a record 4,200 applicants, our advisory board has finalized the 120 delegates who will receive seed grant credentials and 6 months of civic coaching.",
      content: "Following a record 4,200 applicants, our advisory board has finalized the 120 delegates who will receive seed grant credentials and 6 months of civic coaching. Selected delegates represent over 35 countries across Africa, Asia, and the Americas, uniting to pioneer innovative community transformation projects.",
      gradient: "from-purple-400 to-pink-500",
      imagePath: "",
      isPublished: true,
      order: 2,
    },
    {
      title: "Meru Partners with 12 New European Academic Councils",
      category: "Partnerships",
      date: "April 10, 2026",
      desc: "The joint agreement facilitates direct credit transfers and curriculum recognition, allowing exchange participants in Germany to earn ECTS credits smoothly.",
      content: "The joint agreement facilitates direct credit transfers and curriculum recognition, allowing exchange participants in Germany, Austria, and Switzerland to earn ECTS credits smoothly while participating in MERU leadership initiatives worldwide.",
      gradient: "from-emerald-400 to-teal-500",
      imagePath: "",
      isPublished: true,
      order: 3,
    },
  ];

  for (const article of defaultArticles) {
    const existing = await prisma.newsArticle.findFirst({
      where: { title: article.title },
    });
    if (!existing) {
      await prisma.newsArticle.create({ data: article });
    }
  }
  console.log("✓ Default news articles seeded");

  console.log("\n🎉 Database seed completed successfully!");
}

seed()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
