import prisma from "../src/lib/prisma";

async function main() {
  console.log("=== DB STATUS ===");
  console.log("News count:", await prisma.newsArticle.count());
  console.log("News items:", JSON.stringify(await prisma.newsArticle.findMany(), null, 2));
  console.log("Programs count:", await prisma.program.count());
  console.log("Programs:", JSON.stringify(await prisma.program.findMany({ select: { id: true, title: true, isPublished: true } }), null, 2));
  console.log("HomepageSetting:", JSON.stringify(await prisma.homepageSetting.findFirst(), null, 2));
  console.log("PageContents:", JSON.stringify(await prisma.pageContent.findMany(), null, 2));
  console.log("Testimonials count:", await prisma.testimonial.count());
  console.log("History count:", await prisma.historySlot.count());
  console.log("MediaItem count:", await prisma.mediaItem.count());
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
