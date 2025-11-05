/*
  Warnings:

  - You are about to drop the column `request` on the `api_logs` table. All the data in the column will be lost.
  - You are about to drop the column `response` on the `api_logs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "api_logs" DROP COLUMN "request",
DROP COLUMN "response",
ADD COLUMN     "responseTime" INTEGER;
