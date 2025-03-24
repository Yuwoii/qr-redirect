-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "QRCode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "QRCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Redirect" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "qrCodeId" TEXT NOT NULL,
    "visitCount" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Redirect_qrCodeId_fkey" FOREIGN KEY ("qrCodeId") REFERENCES "QRCode" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "QRCode_slug_key" ON "QRCode"("slug");

-- CreateIndex
CREATE INDEX "QRCode_userId_idx" ON "QRCode"("userId");

-- CreateIndex
CREATE INDEX "QRCode_slug_idx" ON "QRCode"("slug");

-- CreateIndex
CREATE INDEX "QRCode_createdAt_idx" ON "QRCode"("createdAt");

-- CreateIndex
CREATE INDEX "Redirect_qrCodeId_idx" ON "Redirect"("qrCodeId");

-- CreateIndex
CREATE INDEX "Redirect_isActive_idx" ON "Redirect"("isActive");

-- CreateIndex
CREATE INDEX "Redirect_createdAt_idx" ON "Redirect"("createdAt");
