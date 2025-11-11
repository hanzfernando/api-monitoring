/*
  Warnings:

  - Added the required column `apiKeyValue` to the `api_logs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "api_keys" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "api_logs" ADD COLUMN     "apiKeyId" INTEGER,
ADD COLUMN     "apiKeyValue" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "api_logs" ADD CONSTRAINT "api_logs_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "api_keys"("id") ON DELETE SET NULL ON UPDATE CASCADE;
