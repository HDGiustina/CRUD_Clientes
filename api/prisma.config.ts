import "dotenv/config";
import { defineConfig } from "prisma/config";

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL não definida. Copie .env.example para .env (raiz e api/).');
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
