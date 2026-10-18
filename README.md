# Cadastro de Clientes — tela única

CRUD de clientes com **cadastro, edição, filtros e inativação** em tela única: modal de Novo/Editar Cliente, filtros por nome e CPF, tabela com endereço completo, busca automática de cidade/estado pelo CEP (ViaCEP), tema claro/escuro e layout responsivo.

## Tecnologias

- **Back:** Node 24, Express 4, Prisma 7, Zod, Postgres 16 (Docker)
- **Front:** React 19, Vite, Tailwind CSS v4, shadcn/ui, lucide-react

## Pré-requisitos

- [Node 24+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) em execução
- Git

## Como rodar

```powershell
# 1. Clonar e entrar na pasta
git clone <url-do-repositorio>
cd Projeto

# 2. Subir o Postgres (primeira vez baixa a imagem; dados persistem no volume)
docker compose up -d db

# 3. Configurar variáveis de ambiente
copy .env.example .env            # raiz (referência)
copy api\.env.example api\.env    # back (usada pelo Prisma)
copy web\.env.example web\.env    # front (URL da API)
```

> No Linux/Mac troque `copy` por `cp` e a barra por `/`.

```powershell
# 4. Criar as tabelas
cd api
npm install
npx prisma migrate dev

# 5. Subir a API (http://localhost:3000)
npm run dev

# 6. Em outro terminal, subir o front (http://localhost:5173)
cd ..\web
npm install
npm run dev
```

Abra **http://localhost:5173** — a lista começa vazia; clique em **Novo Cliente** para cadastrar o primeiro.

## Scripts SQL

- `scripts/create_tables.sql` — criação da tabela `clientes` (mesmo SQL aplicado pela migração do Prisma em `api/prisma/migrations/`).

## Estrutura

```
Projeto/
├── docker-compose.yml      # Postgres 16 (container clientes-db)
├── .env.example            # modelo das variáveis
├── scripts/
│   └── create_tables.sql   # script de criação das tabelas
├── api/                    # back-end (Express + Prisma)
│   ├── prisma/schema.prisma
│   ├── prisma.config.ts
│   └── src/                # server.js, routes/clientes.js, lib/prisma.js
└── web/                    # front-end (React + Vite + Tailwind + shadcn/ui)
    └── src/                # App.jsx, components/, lib/api.js, lib/viacep.js
```

## Regras do cadastro

- Campos obrigatórios: nome, CPF, telefone, CEP, cidade, estado, endereço, bairro e número. Complemento é opcional.
- CPF, telefone e CEP aceitam máscara na tela, mas o banco guarda **só dígitos**.
- CPF duplicado é recusado (erro 409). Inativar **não apaga**: marca `ativo=false` e o cliente sai da lista.

## Autora

Desenvolvido por [Helena Della Giustina](https://www.linkedin.com/in/helenadgiustina/).
