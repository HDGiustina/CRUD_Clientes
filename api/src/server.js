// Servidor Express: recebe JSON, libera o front (CORS) e traduz erros para HTTP.
require('dotenv/config');
const express = require('express');
const cors = require('cors');
const clientesRouter = require('./routes/clientes');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Em desenvolvimento a porta do Vite varia (5173, 5174…), então libera qualquer localhost.
app.use(cors({ origin: [/^http:\/\/localhost:\d+$/] }));
app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true }));
app.use('/clientes', clientesRouter);

// Tradutor de erros: validação (Zod) -> 400, CPF duplicado (P2002) -> 409, resto -> 500.
app.use((err, req, res, next) => {
  if (err?.name === 'ZodError') {
    return res.status(400).json({
      error: 'Dados inválidos',
      detalhes: err.issues.map((i) => ({ campo: i.path.join('.'), mensagem: i.message })),
    });
  }
  if (err?.code === 'P2002') {
    return res.status(409).json({ error: 'CPF já cadastrado' });
  }
  if (err?.code === 'P2025') {
    return res.status(404).json({ error: 'Cliente não encontrado' });
  }
  console.error(err);
  res.status(500).json({ error: 'Erro interno' });
});

app.listen(PORT, () => console.log(`API ouvindo em http://localhost:${PORT}`));
