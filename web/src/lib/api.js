// Camada de acesso à API. Toda conversa com o back passa por aqui,
// então se a URL ou o formato mudarem, só este arquivo muda.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function lerResposta(res) {
  const dados = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(dados.error || `Erro ${res.status}`);
  }
  return dados;
}

export function listarClientes({ nome = '', cpf = '' } = {}) {
  const params = new URLSearchParams();
  if (nome) params.set('nome', nome);
  if (cpf) params.set('cpf', cpf);
  return fetch(`${API_URL}/clientes?${params}`).then(lerResposta);
}
