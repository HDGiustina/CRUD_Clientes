// Conexão com o banco: Prisma (consultas tipadas) + pg (motorista do Postgres).
// O adapter é exigência do Prisma 7: o PrismaClient recebe a conexão pronta.
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL não definida. Copie .env.example para .env');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

module.exports = { prisma };
