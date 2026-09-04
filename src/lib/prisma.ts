import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const getPrisma = () => {
  if (global.prisma) return global.prisma;
  
  // Use the connection URL for better-sqlite3 adapter (Prisma 7 format)
  const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
  const prisma = new PrismaClient({ adapter });
  
  if (process.env.NODE_ENV !== "production") global.prisma = prisma;
  return prisma;
};

export const prisma = getPrisma();
