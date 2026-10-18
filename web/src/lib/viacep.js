// Busca cidade e estado pelo CEP usando o serviço público ViaCEP.
// Recebe o CEP com ou sem máscara; retorna { cidade, estado } ou lança erro.
export async function buscarEnderecoPorCep(cepDigitado) {
  const cep = (cepDigitado || '').replace(/\D/g, '');
  if (cep.length !== 8) {
    throw new Error('CEP precisa ter 8 números');
  }
  const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
  if (!res.ok) {
    throw new Error('Não foi possível buscar o CEP agora');
  }
  const dados = await res.json();
  if (dados.erro) {
    throw new Error('CEP não encontrado');
  }
  return { cidade: dados.localidade || '', estado: dados.uf || '' };
}
