import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const filePath = dbUrl.replace(/^file:/, "");
const absolutePath = path.isAbsolute(filePath)
  ? filePath
  : path.join(process.cwd(), filePath);

const adapter = new PrismaBetterSqlite3({ url: absolutePath });
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.upsert({
    where: { id: "dummy-user-01" },
    update: {},
    create: {
      id: "dummy-user-01",
      email: "test@example.com",
      displayName: "テストユーザー",
    },
  });

  console.log("Seeded user:", user.displayName);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
