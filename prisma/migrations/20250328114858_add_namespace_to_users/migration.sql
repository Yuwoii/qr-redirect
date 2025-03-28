/*
  Warnings:

  - A unique constraint covering the columns `[userId,slug]` on the table `QRCode` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "QRCode_slug_key";

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "namespace" TEXT, -- Make it nullable initially
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "id", "name", "password", "updatedAt") SELECT "createdAt", "email", "id", "name", "password", "updatedAt" FROM "User";

-- Generate random namespaces for existing users
-- For SQLite we use the hex function to create a random string
UPDATE "new_User" SET "namespace" = substr(hex(randomblob(16)), 1, 25) WHERE "namespace" IS NULL;

DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_namespace_key" ON "User"("namespace");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_namespace_idx" ON "User"("namespace");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "QRCode_userId_slug_key" ON "QRCode"("userId", "slug");

-- Finally, make namespace non-nullable after we've filled in values
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User2" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "namespace" TEXT NOT NULL, -- Now make it required
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User2" ("createdAt", "email", "id", "name", "namespace", "password", "updatedAt") SELECT "createdAt", "email", "id", "name", "namespace", "password", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User2" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_namespace_key" ON "User"("namespace");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_namespace_idx" ON "User"("namespace");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
