// Camada de acesso à API. Toda conversa com o back passa por aqui,
// então se a URL ou o formato mudarem, só este arquivo muda.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function lerResposta(res) {
  const dados = await res.json().catch(() => ({}));
  if (!res.ok) {
    // O back manda `detalhes` por campo; guardamos a lista no erro para exibir um item por linha.
    const erro = new Error(dados.error || `Erro ${res.status}`);
    erro.detalhes = dados.detalhes?.map((d) => d.mensagem) ?? [];
    throw erro;
  }
  return dados;
}

export function listarClientes({ nome = '', cpf = '' } = {}) {
  const params = new URLSearchParams();
  if (nome) params.set('nome', nome);
  if (cpf) params.set('cpf', cpf);
  return fetch(`${API_URL}/clientes?${params}`).then(lerResposta);
}

export function criarCliente(dados) {
  return fetch(`${API_URL}/clientes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  }).then(lerResposta);
}

export function atualizarCliente(id, dados) {
  return fetch(`${API_URL}/clientes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  }).then(lerResposta);
}

export function inativarCliente(id) {
  return fetch(`${API_URL}/clientes/${id}/inativar`, { method: 'PATCH' }).then(lerResposta);
}
