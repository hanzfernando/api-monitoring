/*
  Warnings:

  - You are about to drop the column `responseTime` on the `api_logs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "api_logs" DROP COLUMN "responseTime";
