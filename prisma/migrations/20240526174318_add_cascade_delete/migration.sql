-- DropForeignKey
ALTER TABLE "Program" DROP CONSTRAINT "Program_channelId_fkey";

-- AddForeignKey
ALTER TABLE "Program" ADD CONSTRAINT "Program_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
