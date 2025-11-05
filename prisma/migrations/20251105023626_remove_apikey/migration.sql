/*
  Warnings:

  - You are about to drop the column `apiKey` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."users_apiKey_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "apiKey";
