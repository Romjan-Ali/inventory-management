-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar" TEXT,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventories" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "category" TEXT NOT NULL,
    "tags" TEXT[],
    "version" INTEGER NOT NULL DEFAULT 1,
    "creatorId" TEXT NOT NULL,
    "string1Name" TEXT,
    "string1Description" TEXT,
    "string1Visible" BOOLEAN NOT NULL DEFAULT false,
    "string1Order" INTEGER NOT NULL DEFAULT 0,
    "string2Name" TEXT,
    "string2Description" TEXT,
    "string2Visible" BOOLEAN NOT NULL DEFAULT false,
    "string2Order" INTEGER NOT NULL DEFAULT 1,
    "string3Name" TEXT,
    "string3Description" TEXT,
    "string3Visible" BOOLEAN NOT NULL DEFAULT false,
    "string3Order" INTEGER NOT NULL DEFAULT 2,
    "text1Name" TEXT,
    "text1Description" TEXT,
    "text1Visible" BOOLEAN NOT NULL DEFAULT false,
    "text1Order" INTEGER NOT NULL DEFAULT 3,
    "text2Name" TEXT,
    "text2Description" TEXT,
    "text2Visible" BOOLEAN NOT NULL DEFAULT false,
    "text2Order" INTEGER NOT NULL DEFAULT 4,
    "text3Name" TEXT,
    "text3Description" TEXT,
    "text3Visible" BOOLEAN NOT NULL DEFAULT false,
    "text3Order" INTEGER NOT NULL DEFAULT 5,
    "number1Name" TEXT,
    "number1Description" TEXT,
    "number1Visible" BOOLEAN NOT NULL DEFAULT false,
    "number1Order" INTEGER NOT NULL DEFAULT 6,
    "number2Name" TEXT,
    "number2Description" TEXT,
    "number2Visible" BOOLEAN NOT NULL DEFAULT false,
    "number2Order" INTEGER NOT NULL DEFAULT 7,
    "number3Name" TEXT,
    "number3Description" TEXT,
    "number3Visible" BOOLEAN NOT NULL DEFAULT false,
    "number3Order" INTEGER NOT NULL DEFAULT 8,
    "boolean1Name" TEXT,
    "boolean1Description" TEXT,
    "boolean1Visible" BOOLEAN NOT NULL DEFAULT false,
    "boolean1Order" INTEGER NOT NULL DEFAULT 9,
    "boolean2Name" TEXT,
    "boolean2Description" TEXT,
    "boolean2Visible" BOOLEAN NOT NULL DEFAULT false,
    "boolean2Order" INTEGER NOT NULL DEFAULT 10,
    "boolean3Name" TEXT,
    "boolean3Description" TEXT,
    "boolean3Visible" BOOLEAN NOT NULL DEFAULT false,
    "boolean3Order" INTEGER NOT NULL DEFAULT 11,
    "link1Name" TEXT,
    "link1Description" TEXT,
    "link1Visible" BOOLEAN NOT NULL DEFAULT false,
    "link1Order" INTEGER NOT NULL DEFAULT 12,
    "link2Name" TEXT,
    "link2Description" TEXT,
    "link2Visible" BOOLEAN NOT NULL DEFAULT false,
    "link2Order" INTEGER NOT NULL DEFAULT 13,
    "link3Name" TEXT,
    "link3Description" TEXT,
    "link3Visible" BOOLEAN NOT NULL DEFAULT false,
    "link3Order" INTEGER NOT NULL DEFAULT 14,
    "customIdFormat" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items" (
    "id" TEXT NOT NULL,
    "customId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "inventoryId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "string1Value" TEXT,
    "string2Value" TEXT,
    "string3Value" TEXT,
    "text1Value" TEXT,
    "text2Value" TEXT,
    "text3Value" TEXT,
    "number1Value" DOUBLE PRECISION,
    "number2Value" DOUBLE PRECISION,
    "number3Value" DOUBLE PRECISION,
    "boolean1Value" BOOLEAN,
    "boolean2Value" BOOLEAN,
    "boolean3Value" BOOLEAN,
    "link1Value" TEXT,
    "link2Value" TEXT,
    "link3Value" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_accesses" (
    "id" TEXT NOT NULL,
    "inventoryId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "canWrite" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "inventory_accesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "inventoryId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "likes" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "likes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "items_inventoryId_customId_key" ON "items"("inventoryId", "customId");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_accesses_inventoryId_userId_key" ON "inventory_accesses"("inventoryId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "likes_itemId_userId_key" ON "likes"("itemId", "userId");

-- AddForeignKey
ALTER TABLE "inventories" ADD CONSTRAINT "inventories_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "inventories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_accesses" ADD CONSTRAINT "inventory_accesses_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "inventories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_accesses" ADD CONSTRAINT "inventory_accesses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_inventoryId_fkey" FOREIGN KEY ("inventoryId") REFERENCES "inventories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
