/*
  Warnings:

  - Made the column `inviteCode` on table `Room` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Room` MODIFY `inviteCode` VARCHAR(191) NOT NULL;
