-- AlterTable
ALTER TABLE "Profile" ADD COLUMN "browseAnonymously" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "ProfileView" (
    "id" TEXT NOT NULL,
    "viewerUserId" TEXT NOT NULL,
    "viewedUserId" TEXT NOT NULL,
    "anonymous" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfileView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProfileView_viewedUserId_createdAt_idx" ON "ProfileView"("viewedUserId", "createdAt");

-- CreateIndex
CREATE INDEX "ProfileView_viewerUserId_viewedUserId_createdAt_idx" ON "ProfileView"("viewerUserId", "viewedUserId", "createdAt");

-- AddForeignKey
ALTER TABLE "ProfileView" ADD CONSTRAINT "ProfileView_viewerUserId_fkey" FOREIGN KEY ("viewerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileView" ADD CONSTRAINT "ProfileView_viewedUserId_fkey" FOREIGN KEY ("viewedUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
