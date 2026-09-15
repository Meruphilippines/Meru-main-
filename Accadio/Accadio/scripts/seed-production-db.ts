import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEFAULT_PAGE_CONTENTS } from "../src/lib/defaultPageContents";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Supabase PostgreSQL Production Database...");

  // 1. Admin User (Meruadmin2026!)
  const passwordHash = "$2b$12$9bbMg0VJxRzTMedLff9SXu57G9W52CqU7UsPh4rULdB1.Bgpk6U3O"; // Meruadmin2026!
  await prisma.adminUser.upsert({
    where: { username: "admin" },
    update: {
      passwordHash,
      mustChangePassword: false,
    },
    create: {
      username: "admin",
      passwordHash,
      mustChangePassword: false,
    },
  });
  console.log("✓ Admin user verified/updated (admin / Meruadmin2026!)");

  // 2. Seed Programs
  const progCount = await prisma.program.count();
  if (progCount === 0) {
    const programsData = [
      {
        title: "Global Exchange Seminar (Tokyo)",
        slug: "global-exchange-seminar-tokyo",
        category: "exchange",
        tag: "Academic Exchange",
        desc: "An intensive 4-week cultural immersion and technical research seminar hosted in collaboration with university partners in Shinjuku, Tokyo.",
        eligibility: "Enrolled university students or recent graduates (within 2 years). Basic English proficiency. Open to all majors.",
        benefits: JSON.stringify([
          "8 ECTS Academic Credits",
          "Tokyo Chamber of Commerce Certificate",
          "Company site tours (SoftBank, Sony)",
          "1-on-1 alumni mentorship",
        ]),
        gradient: "from-blue-400 to-indigo-500",
        iconName: "Compass",
        date: "July 15 - August 12, 2026",
        order: 1,
      },
      {
        title: "Cross-Cultural Communications (Munich)",
        slug: "cross-cultural-communications-munich",
        category: "exchange",
        tag: "Academic Exchange",
        desc: "Explores multinational operations and communication behaviors within European business markets, hosted in Munich, Germany.",
        eligibility: "Undergraduate or graduate students in humanities, communications, business, or international relations.",
        benefits: JSON.stringify([
          "Munich Chamber Credentials",
          "German language primer modules",
          "Networking with EU commercial delegates",
        ]),
        gradient: "from-purple-400 to-pink-500",
        iconName: "BookOpen",
        date: "August 1 - August 25, 2026",
        order: 2,
      },
      {
        title: "Corporate Governance & Ethics Forum (London)",
        slug: "corporate-governance-ethics-london",
        category: "corporate",
        tag: "Corporate Governance",
        desc: "A certification track for compliance officers, legal directors, and mid-tier executives navigating ESG mandates and international regulatory policies.",
        eligibility: "Corporate professionals with minimum 3 years industry experience in management, compliance, or finance.",
        benefits: JSON.stringify([
          "UK CPD Accredited Certificate",
          "Direct access to policy draughtsmen",
          "Case studies in corporate risk mitigations",
        ]),
        gradient: "from-emerald-400 to-teal-500",
        iconName: "Landmark",
        date: "September 5 - September 28, 2026",
        order: 3,
      },
      {
        title: "Resilient Leadership Architecture",
        slug: "resilient-leadership-architecture",
        category: "corporate",
        tag: "Corporate Excellence",
        desc: "Equips teams with strategic risk assessment models, crisis management pathways, and communication protocols during organizational pivots.",
        eligibility: "Project managers, department leads, and senior team members.",
        benefits: JSON.stringify([
          "Crisis Resilience Certification",
          "Risk mapping software subscription",
          "4 live workshops with industry auditors",
          "Peer advisory access",
        ]),
        gradient: "from-violet-400 to-fuchsia-600",
        iconName: "Landmark",
        date: "October 1 - October 15, 2026",
        order: 4,
      },
      {
        title: "Civic Youth Fellowship (Bogota)",
        slug: "civic-youth-fellowship-bogota",
        category: "youth",
        tag: "Youth Leadership",
        desc: "Subsidized 6-month leadership and civic activation cohort empowering young Latin American changemakers to lead municipal community projects.",
        eligibility: "Youth ages 18-29 living in Colombia, Ecuador, or Peru with active grassroots involvement.",
        benefits: JSON.stringify([
          "$2,500 USD seed grant for local initiatives",
          "Monthly coaching from UN field directors",
          "Regional Summit delegate pass",
        ]),
        gradient: "from-amber-400 to-orange-500",
        iconName: "Users",
        date: "October 10 - October 18, 2026",
        order: 5,
      },
      {
        title: "Social Enterprise Accelerator",
        slug: "social-enterprise-accelerator",
        category: "youth",
        tag: "Youth Leadership",
        desc: "Helps early-stage social founders refine business plans, build pitch decks, and raise operational capital.",
        eligibility: "Founders of registered social businesses, B-corps, or non-profits less than 2 years old.",
        benefits: JSON.stringify([
          "Pitch deck feedback from impact VCs",
          "Venture modeling toolkit",
          "Meru Impact Certificate",
          "Alumni registry membership",
        ]),
        gradient: "from-teal-400 to-emerald-600",
        iconName: "Users",
        date: "November 1 - November 20, 2026",
        order: 6,
      },
    ];
    for (const prog of programsData) {
      await prisma.program.create({ data: prog });
    }
    console.log(`✓ ${programsData.length} programs seeded in PostgreSQL`);
  } else {
    console.log(`✓ Database already has ${progCount} programs`);
  }

  // 3. Seed Testimonials
  const testCount = await prisma.testimonial.count();
  if (testCount === 0) {
    const testimonialsData = [
      {
        type: "video",
        title: "My Academic Journey in Tokyo Shinjuku Center",
        speaker: "Sofia Rodriguez",
        details: "Tokyo Exchange Alumni, Class of 2025",
        duration: "3:42",
        gradient: "from-blue-400 to-indigo-500",
        rating: 5,
      },
      {
        type: "video",
        title: "Reshaping our Corporate ESG Policies",
        speaker: "David Vance",
        details: "VP of Talent at Novis Corp",
        duration: "5:15",
        gradient: "from-purple-400 to-pink-500",
        rating: 5,
      },
      {
        type: "written",
        quote: "The Civic Youth Fellowship provided the exact funding metrics and legal support networks I needed to build my nonprofit in Colombia. It changed our trajectory entirely.",
        author: "Mateo Silva",
        role: "Founder, Ecos Col",
        rating: 5,
        programTag: "youth",
        region: "South America",
      },
      {
        type: "written",
        quote: "Instructors in the Munich communications program were top-tier experts. Academic credits transferred to my home college without any administrative friction.",
        author: "Lara Schmidt",
        role: "Student, Munich Exchange Program",
        rating: 4,
        programTag: "exchange",
        region: "Europe",
      },
      {
        type: "written",
        quote: "Corporate governance programs offered by Meru are concise, highly practical, and packed with auditable frameworks. Our compliance scores improved dramatically.",
        author: "Robert Chen",
        role: "Compliance Director, Apex Logix",
        rating: 5,
        programTag: "corporate",
        region: "Asia-Pacific",
      },
      {
        type: "written",
        quote: "The cross-border exposure was unparalleled. I made lifelong contacts with university faculties across 6 countries during my 4-week stay.",
        author: "Amara Okafor",
        role: "Research Fellow",
        rating: 5,
        programTag: "exchange",
        region: "Africa",
      },
      {
        type: "written",
        quote: "Transparent administration, exceptional mentors, and comprehensive coverage of modern civic advocacy. Highly recommended.",
        author: "Elena Rostova",
        role: "Nonprofit Director",
        rating: 5,
        programTag: "youth",
        region: "Europe",
      },
      {
        type: "written",
        quote: "The curriculum for international ethics pushed our team to rethink supplier audits and environmental scorecards completely.",
        author: "Marcus Sterling",
        role: "Supply Chain VP, Tetra Global",
        rating: 4,
        programTag: "corporate",
        region: "North America",
      },
    ];
    for (const test of testimonialsData) {
      await prisma.testimonial.create({ data: test });
    }
    console.log(`✓ ${testimonialsData.length} testimonials seeded in PostgreSQL`);
  } else {
    console.log(`✓ Database already has ${testCount} testimonials`);
  }

  // 4. Seed Contact Info & Offices
  const offices = [
    {
      city: "London (HQ)",
      address: "120 St James's Square, London, SW1Y 4JH",
      phone: "+44 20 7946 0192",
      email: "london.hq@meruglobalteam.org",
      hours: "9:00 AM - 5:30 PM GMT",
    },
    {
      city: "Singapore (Asia Hub)",
      address: "10 Anson Rd, International Plaza, Singapore 079903",
      phone: "+65 6789 0122",
      email: "singapore.ops@meruglobalteam.org",
      hours: "9:00 AM - 6:00 PM SGT",
    },
    {
      city: "Bogota (LATAM Hub)",
      address: "Cra. 11 #78-22, Bogota, Colombia",
      phone: "+57 601 456 7890",
      email: "bogota.ops@meruglobalteam.org",
      hours: "8:00 AM - 5:00 PM COT",
    },
    {
      city: "Tokyo Office",
      address: "1-chome, Shinjuku, Shinjuku City, Tokyo 160-0022",
      phone: "+81 3 5555 0143",
      email: "tokyo.relations@meruglobalteam.org",
      hours: "9:00 AM - 6:00 PM JST",
    },
  ];

  const socialLinks = {
    facebook: "https://facebook.com",
    twitter: "https://twitter.com",
    instagram: "https://instagram.com",
    linkedin: "https://linkedin.com",
    youtube: "https://youtube.com",
  };

  const contactCount = await prisma.contactInfo.count();
  if (contactCount === 0) {
    await prisma.contactInfo.create({
      data: {
        phone: "+44 20 7946 0192",
        email: "connect@meruglobalteam.org",
        address: "120 St James's Square, London, SW1Y 4JH",
        socialLinks: JSON.stringify(socialLinks),
        googleMapsEmbed: "",
        offices: JSON.stringify(offices),
      },
    });
    console.log("✓ Contact information and offices seeded");
  } else {
    // Update email to meruglobalteam.org if needed
    const existing = await prisma.contactInfo.findFirst();
    if (existing) {
      await prisma.contactInfo.update({
        where: { id: existing.id },
        data: {
          email: "connect@meruglobalteam.org",
          offices: JSON.stringify(offices),
          socialLinks: JSON.stringify(socialLinks),
        },
      });
      console.log("✓ Contact information updated");
    }
  }

  // 5. Seed Homepage Settings
  const tickerItems = [
    { id: "1", label: "EVENT", date: "JUNE 2026", text: "Global Youth Leadership Summit 2026 registration is now officially open.", color: "blue" },
    { id: "2", label: "EXPANSION", date: "MAY 2026", text: "Meru expands footprint to South America with new regional offices in Bogota.", color: "emerald" },
    { id: "3", label: "MILESTONE", date: "APRIL 2026", text: "Corporate Excellence Program achieves milestone of training 50,000+ professionals.", color: "purple" },
    { id: "4", label: "PARTNERS", date: "MARCH 2026", text: "Partnered with 12 new European academic organizations for global exchanges.", color: "amber" },
  ];

  await prisma.homepageSetting.upsert({
    where: { id: "default" },
    update: {
      heroTitle: "Reaching the Unreached",
      heroSubtitle: "Connecting generations to the Great Commission",
      tickerItems: JSON.stringify(tickerItems),
    },
    create: {
      id: "default",
      heroTitle: "Reaching the Unreached",
      heroSubtitle: "Connecting generations to the Great Commission",
      tickerItems: JSON.stringify(tickerItems),
    },
  });
  console.log("✓ Homepage settings seeded");

  // 6. Seed Pages
  const pages = ["home", "about", "history", "programs", "testimonials", "contact"];
  const pageTitles: Record<string, string> = {
    home: "Home",
    about: "About Us",
    history: "History",
    programs: "Programs",
    testimonials: "Testimonials",
    contact: "Contact",
  };

  for (const slug of pages) {
    const content = DEFAULT_PAGE_CONTENTS[slug] || "";
    await prisma.pageContent.upsert({
      where: { slug },
      update: {
        title: pageTitles[slug],
        content,
        status: "published",
      },
      create: {
        slug,
        title: pageTitles[slug],
        content,
        status: "published",
      },
    });
  }
  console.log(`✓ ${pages.length} pages initialized with default content`);

  // 7. Seed History Slots
  const historySlotsCount = await prisma.historySlot.count();
  if (historySlotsCount === 0) {
    const historySlotsData = [
      { title: "First London Forum", year: "2019", tag: "Event", gradient: "from-blue-400 to-indigo-500", caption: "Global Expedition Journey", order: 1 },
      { title: "Tokyo Seminars Group", year: "2021", tag: "Academic", gradient: "from-purple-400 to-pink-500", caption: "Global Expedition Journey", order: 2 },
      { title: "Bogota Office Opening", year: "2022", tag: "Expansion", gradient: "from-emerald-400 to-teal-500", caption: "Global Expedition Journey", order: 3 },
      { title: "Corporate Review Board", year: "2023", tag: "Corporate", gradient: "from-amber-400 to-orange-500", caption: "Global Expedition Journey", order: 4 },
      { title: "Global Youth Congress", year: "2025", tag: "Summit", gradient: "from-sky-400 to-blue-600", caption: "Global Expedition Journey", order: 5 },
      { title: "Africa Initiative Launch", year: "2026", tag: "Field", gradient: "from-rose-400 to-purple-600", caption: "Global Expedition Journey", order: 6 },
    ];
    for (const slot of historySlotsData) {
      await prisma.historySlot.create({ data: slot });
    }
    console.log(`✓ ${historySlotsData.length} history slots seeded in PostgreSQL`);
  } else {
    console.log(`✓ Database already has ${historySlotsCount} history slots`);
  }

  // 8. Seed Team Members
  const teamCount = await prisma.teamMember.count();
  if (teamCount === 0) {
    const teamData = [
      {
        name: "Dr. Alistair Meru",
        role: "Founder & Chief Executive Officer",
        bio: "Former UN education consultant and capability development specialist. Dr. Alistair founded Meru Global Team to bridge resource gaps in emerging economies.",
        initial: "A",
        gradient: "from-blue-600 to-indigo-700",
        order: 1,
      },
      {
        name: "Maria C. Santos",
        role: "Director of Global Operations",
        bio: "Spearheads operational logistics across 45+ countries. Over 15 years of experience setting up academic exchange networks in Latin America and the EU.",
        initial: "M",
        gradient: "from-pink-500 to-purple-600",
        order: 2,
      },
      {
        name: "Kenji Tanaka",
        role: "Director of Academic Relations",
        bio: "Liaises with partner institutions and academic boards globally. Oversees certification approvals and curriculum alignments with international standards.",
        initial: "K",
        gradient: "from-emerald-500 to-teal-600",
        order: 3,
      },
      {
        name: "Amb. Sarah Jenkins",
        role: "Global Youth Ambassador Lead",
        bio: "Advocates for civic youth empowerment at international forums. Leads recruitment for the annual Civic Leadership Summit and regional workshops.",
        initial: "S",
        gradient: "from-amber-500 to-orange-600",
        order: 4,
      },
    ];
    for (const member of teamData) {
      await prisma.teamMember.create({ data: member });
    }
    console.log(`✓ ${teamData.length} team members seeded`);
  }

  console.log("🎉 All production data successfully seeded into Supabase PostgreSQL!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
