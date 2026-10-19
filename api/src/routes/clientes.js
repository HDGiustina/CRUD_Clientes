// Rotas do CRUD de clientes.
// GET /clientes?nome=&cpf= | POST /clientes | PUT /clientes/:id | PATCH /clientes/:id/inativar
const { Router } = require('express');
const { z } = require('zod');
const { prisma } = require('../lib/prisma');

const router = Router();

// Regras dos campos obrigatórios do edital. O complemento é opcional (por isso .optional()).
const clienteSchema = z.object({
  nome: z.string().trim().min(1, 'Nome é obrigatório').max(150),
  // Regex aceita vazio de propósito: vazio cai só no "obrigatório", preenchido errado cai na regra.
  cpf: z
    .string()
    .trim()
    .min(1, 'CPF é obrigatório')
    .regex(/^(\d{11})?$/, 'CPF deve ter 11 números'),
  telefone: z
    .string()
    .trim()
    .min(1, 'Telefone é obrigatório')
    .regex(/^(\d{10,11})?$/, 'Telefone deve ter 10 ou 11 números'),
  cep: z
    .string()
    .trim()
    .min(1, 'CEP é obrigatório')
    .regex(/^(\d{8})?$/, 'CEP deve ter 8 números'),
  cidade: z.string().trim().min(1, 'Cidade é obrigatória').max(100),
  estado: z.string().trim().min(1, 'Estado é obrigatório').max(2),
  endereco: z.string().trim().min(1, 'Endereço é obrigatório').max(150),
  bairro: z.string().trim().min(1, 'Bairro é obrigatório').max(100),
  numero: z
    .string()
    .trim()
    .min(1, 'Número é obrigatório')
    .regex(/^(\d+)?$/, 'Número deve conter só números')
    .transform(Number),
  complemento: z.string().trim().max(100).optional().or(z.literal('')),
});

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// O front manda só dígitos, mas se chegar máscara (ex.: teste via curl),
// limpamos aqui: no banco vai só dígito.
function semMascara(corpo) {
  const limpo = { ...corpo };
  for (const campo of ['cpf', 'telefone', 'cep']) {
    if (typeof limpo[campo] === 'string') limpo[campo] = limpo[campo].replace(/\D/g, '');
  }
  return limpo;
}

// Lista só clientes ATIVOS, com filtros opcionais por nome e CPF (busca parcial, sem diferenciar maiúsculas).
router.get('/', async (req, res, next) => {
  try {
    const { nome = '', cpf = '' } = req.query;
    const clientes = await prisma.cliente.findMany({
      where: {
        ativo: true,
        nome: nome ? { contains: String(nome), mode: 'insensitive' } : undefined,
        cpf: cpf ? { contains: String(cpf) } : undefined,
      },
      orderBy: { id: 'desc' },
    });
    res.json(clientes);
  } catch (err) {
    next(err);
  }
});

// Cria um cliente novo. CPF duplicado vira 409 (o banco barra pelo @unique e o Prisma avisa com P2002).
router.post('/', async (req, res, next) => {
  try {
    const dados = clienteSchema.parse(semMascara(req.body));
    const cliente = await prisma.cliente.create({ data: dados });
    res.status(201).json(cliente);
  } catch (err) {
    next(err);
  }
});

// Edita todos os campos de um cliente existente.
router.put('/:id', async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: 'ID inválido' });
    const dados = clienteSchema.parse(semMascara(req.body));
    const cliente = await prisma.cliente.update({ where: { id }, data: dados });
    res.json(cliente);
  } catch (err) {
    next(err);
  }
});

// Inativa (soft-delete): marca ativo=false em vez de apagar. Idempotente.
router.patch('/:id/inativar', async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ error: 'ID inválido' });
    const cliente = await prisma.cliente.update({ where: { id }, data: { ativo: false } });
    res.json(cliente);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
