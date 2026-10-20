-- CreateTable
CREATE TABLE "SiteCurtain" (
    "id" TEXT NOT NULL DEFAULT 'site',
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT NOT NULL DEFAULT 'We''ll be back shortly',
    "message" TEXT NOT NULL DEFAULT 'The boutique is being freshened up. Please visit again soon.',
    "droppedAt" TIMESTAMP(3),
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteCurtain_pkey" PRIMARY KEY ("id")
);
