/*
  Warnings:

  - The primary key for the `activity` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropIndex
DROP INDEX "public"."activity_id_userId_key";

-- AlterTable
ALTER TABLE "public"."activity" DROP CONSTRAINT "activity_pkey",
ADD CONSTRAINT "activity_pkey" PRIMARY KEY ("id", "userId");
