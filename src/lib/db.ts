import { PrismaClient } from "@prisma/client";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// In serverless environments, we need to be careful about connection management
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['error'],
    // Don't override the URL in the client as we're using POSTGRES_URL_NON_POOLING in the schema
  });
};

// Create or reuse the prisma client instance
export const prisma = globalForPrisma.prisma || prismaClientSingleton();

// Save the client instance if not in production
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma; 