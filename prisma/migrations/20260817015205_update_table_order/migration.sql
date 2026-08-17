/*
  Warnings:

  - You are about to drop the column `shipping_cost` on the `orders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `orders` DROP COLUMN `shipping_cost`,
    ADD COLUMN `loket_name` VARCHAR(50) NULL,
    ADD COLUMN `pickup_location` TEXT NULL;
