-- CreateTable
CREATE TABLE "clientes" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(150) NOT NULL,
    "cpf" VARCHAR(14) NOT NULL,
    "telefone" VARCHAR(20) NOT NULL,
    "cep" VARCHAR(9) NOT NULL,
    "cidade" VARCHAR(100) NOT NULL,
    "estado" VARCHAR(2) NOT NULL,
    "endereco" VARCHAR(150) NOT NULL,
    "bairro" VARCHAR(100) NOT NULL,
    "numero" VARCHAR(20) NOT NULL,
    "complemento" VARCHAR(100),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clientes_cpf_key" ON "clientes"("cpf");
