/*
  Warnings:

  - Added the required column `responseTime` to the `api_logs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "api_logs" ADD COLUMN     "responseTime" DOUBLE PRECISION NOT NULL;
