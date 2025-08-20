-- AlterTable
ALTER TABLE `Message` ADD COLUMN `parentMessageId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_parentMessageId_fkey` FOREIGN KEY (`parentMessageId`) REFERENCES `Message`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
