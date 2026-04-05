import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function addSeo() {
  const newSettings = [
    { key: "logo_url", value: "", label: "Site Logo URL", type: "text", group: "general" },
    { key: "seo_title", value: "TechServ - Premium Web Services", label: "SEO Title", type: "text", group: "general" },
    { key: "seo_description", value: "Access our exclusive digital services, social media campaigns, and web development programs.", label: "SEO Description", type: "textarea", group: "general" },
    { key: "seo_keywords", value: "services, web development, social media, subscription", label: "SEO Keywords", type: "text", group: "general" },
    { key: "seo_author", value: "TechServ Team", label: "SEO Author", type: "text", group: "general" }
  ];

  for (const setting of newSettings) {
    await db.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log("SEO keys populated successfully!");
}

addSeo()
  .catch(console.error)
  .finally(() => db.$disconnect());
