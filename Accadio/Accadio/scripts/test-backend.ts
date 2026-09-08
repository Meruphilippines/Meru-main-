import prisma from "../src/lib/prisma";
import { uploadFile } from "../src/lib/storage";
import { sendInquiryEmails } from "../src/lib/email";

async function testBackend() {
  console.log("==================================================");
  console.log("🧪 RUNNING END-TO-END BACKEND VERIFICATION TESTS");
  console.log("==================================================");

  // 1. Verify Prisma Database Connection & Seeded Data
  console.log("\n[1] Testing Database Models...");
  const adminCount = await prisma.adminUser.count();
  const programCount = await prisma.program.count();
  const testimonialCount = await prisma.testimonial.count();
  const contactInfo = await prisma.contactInfo.findFirst();

  console.log(`✓ Admin Users in DB: ${adminCount}`);
  console.log(`✓ Programs in DB: ${programCount}`);
  console.log(`✓ Testimonials in DB: ${testimonialCount}`);
  console.log(`✓ Contact Email in DB: ${contactInfo?.email}`);

  if (adminCount === 0 || programCount === 0 || testimonialCount === 0) {
    throw new Error("Database tables are unexpectedly empty!");
  }

  // 2. Test Inquiry Persistence & Status Flow
  console.log("\n[2] Testing Contact Inquiry Creation & Status Management...");
  const testInquiry = await prisma.inquiry.create({
    data: {
      name: "Dr. Evelyn Reed",
      email: "evelyn.reed@oxford-research.org",
      phone: "+44 7700 900077",
      department: "academic",
      message: "We would like to explore credit articulation agreements for our post-grad communications cohort.",
      status: "new",
    },
  });
  console.log(`✓ Created test inquiry ID: ${testInquiry.id} with status: "${testInquiry.status}"`);

  // Verify email dispatch logic
  console.log("\n[3] Testing Email Notification Dispatcher...");
  const emailResult = await sendInquiryEmails({
    name: testInquiry.name,
    email: testInquiry.email,
    phone: testInquiry.phone || undefined,
    department: testInquiry.department,
    message: testInquiry.message,
  });
  console.log(`✓ Email notification handler returned:`, emailResult);

  // Update inquiry status to 'read'
  const updatedInquiry = await prisma.inquiry.update({
    where: { id: testInquiry.id },
    data: { status: "read" },
  });
  console.log(`✓ Updated inquiry status to: "${updatedInquiry.status}"`);

  // Clean up test inquiry
  await prisma.inquiry.delete({ where: { id: testInquiry.id } });
  console.log(`✓ Cleaned up test inquiry`);

  // 4. Test Storage Adapter
  console.log("\n[4] Testing Storage Provider Adapter...");
  const sampleBuffer = Buffer.from("Hello Accadio Storage Test File", "utf-8");
  const uploadResult = await uploadFile(sampleBuffer, "test-document.png", "image/png", "test");
  console.log(`✓ Uploaded file via provider "${uploadResult.provider}":`, uploadResult.url);

  // Save to MediaItem table
  const mediaDb = await prisma.mediaItem.create({
    data: {
      filename: uploadResult.filename,
      originalName: "test-document.png",
      type: "image",
      size: uploadResult.size,
      url: uploadResult.url,
      publicId: uploadResult.publicId,
      provider: uploadResult.provider,
    },
  });
  console.log(`✓ Media record saved in database: ID ${mediaDb.id}`);

  // Delete media item
  await prisma.mediaItem.delete({ where: { id: mediaDb.id } });
  console.log(`✓ Media record deleted from database`);

  console.log("\n==================================================");
  console.log("✅ ALL BACKEND & DATABASE VERIFICATIONS PASSED!");
  console.log("==================================================");
}

testBackend()
  .catch((err) => {
    console.error("❌ Test failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
