/*
  Warnings:

  - You are about to alter the column `cpf` on the `clientes` table. The data in that column could be lost. The data in that column will be cast from `VarChar(14)` to `VarChar(11)`.
  - You are about to alter the column `telefone` on the `clientes` table. The data in that column could be lost. The data in that column will be cast from `VarChar(20)` to `VarChar(11)`.
  - You are about to alter the column `cep` on the `clientes` table. The data in that column could be lost. The data in that column will be cast from `VarChar(9)` to `VarChar(8)`.

*/
-- AlterTable
ALTER TABLE "clientes" ALTER COLUMN "cpf" SET DATA TYPE VARCHAR(11),
ALTER COLUMN "telefone" SET DATA TYPE VARCHAR(11),
ALTER COLUMN "cep" SET DATA TYPE VARCHAR(8);
