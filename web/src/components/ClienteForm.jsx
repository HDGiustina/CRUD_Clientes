import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { buscarEnderecoPorCep } from '@/lib/viacep';
import { mascaraCEP, mascaraCPF, mascaraTelefone, soDigitos } from '@/lib/mascaras';

const CAMPOS_INICIAIS = {
  nome: '',
  cpf: '',
  telefone: '',
  cep: '',
  cidade: '',
  estado: '',
  endereco: '',
  bairro: '',
  numero: '',
  complemento: '',
};

// Campos que o edital exige preenchidos (complemento é o único opcional).
const OBRIGATORIOS = ['nome', 'cpf', 'telefone', 'cep', 'cidade', 'estado', 'endereco', 'bairro', 'numero'];

export default function ClienteForm({ inicial = null, salvando = false, erroServidor = [], aoSalvar, aoCancelar }) {
  const [valores, setValores] = useState(CAMPOS_INICIAIS);
  const [erros, setErros] = useState({});
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [avisoCep, setAvisoCep] = useState('');

  // Quando abre para editar, preenche com os dados do cliente (só dígitos do banco
  // ganham máscara aqui na tela); para novo, limpa.
  useEffect(() => {
    if (!inicial) {
      setValores(CAMPOS_INICIAIS);
    } else {
      setValores({
        ...CAMPOS_INICIAIS,
        ...inicial,
        cpf: mascaraCPF(inicial.cpf),
        telefone: mascaraTelefone(inicial.telefone),
        cep: mascaraCEP(inicial.cep),
        numero: String(inicial.numero ?? ''),
      });
    }
    setErros({});
    setAvisoCep('');
  }, [inicial]);

  function alterar(campo, valor, comMascara) {
    setValores((v) => ({ ...v, [campo]: comMascara ? comMascara(valor) : valor }));
    setErros((e) => ({ ...e, [campo]: '' }));
  }

  function aoDigitarCampo(nome, valor) {
    if (nome === 'cep') return aoDigitarCep(valor);
    if (nome === 'cpf') return alterar(nome, valor, mascaraCPF);
    if (nome === 'telefone') return alterar(nome, valor, mascaraTelefone);
    if (nome === 'numero') return alterar(nome, soDigitos(valor));
    return alterar(nome, valor);
  }
  async function aoDigitarCep(valor) {
    alterar('cep', valor, mascaraCEP);
    setAvisoCep('');
    const digitos = soDigitos(valor);
    if (digitos.length !== 8) return;
    setBuscandoCep(true);
    try {
      const { cidade, estado } = await buscarEnderecoPorCep(digitos);
      setValores((v) => ({ ...v, cidade, estado }));
      setAvisoCep('Endereço localizado pelo CEP.');
    } catch (e) {
      setAvisoCep(e.message);
    } finally {
      setBuscandoCep(false);
    }
  }

  function validar() {
    const novos = {};
    for (const campo of OBRIGATORIOS) {
      if (!String(valores[campo] || '').trim()) novos[campo] = 'Obrigatório';
    }
    setErros(novos);
    return Object.keys(novos).length === 0;
  }

  function enviar(e) {
    e.preventDefault();
    if (!validar()) return;
    // Pro banco vai só dígito: a máscara é só visual.
    aoSalvar({
      ...valores,
      cpf: soDigitos(valores.cpf),
      telefone: soDigitos(valores.telefone),
      cep: soDigitos(valores.cep),
    });
  }

  function campo(nome, rotulo, props = {}) {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={`cliente-${nome}`}>
          {rotulo} {OBRIGATORIOS.includes(nome) && <span className="text-destructive">*</span>}
        </Label>
        <Input
          id={`cliente-${nome}`}
          value={valores[nome]}
          onChange={(e) => aoDigitarCampo(nome, e.target.value)}
          aria-invalid={Boolean(erros[nome])}
          {...props}
        />
        {erros[nome] && <p className="text-xs text-destructive">{erros[nome]}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2">{campo('nome', 'Nome do cliente')}</div>
      <div>{campo('cpf', 'CPF', { placeholder: '000.000.000-00' })}</div>
      <div>{campo('telefone', 'Telefone', { placeholder: '(11) 99999-9999' })}</div>
      <div>
        {campo('cep', 'CEP', { placeholder: '00000-000', inputMode: 'numeric' })}
        <p className="mt-1 text-xs text-muted-foreground" aria-live="polite">
          {buscandoCep ? 'Buscando endereço…' : avisoCep}
        </p>
      </div>
      <div>{campo('numero', 'Número', { inputMode: 'numeric' })}</div>
      <div>{campo('endereco', 'Endereço')}</div>
      <div>{campo('bairro', 'Bairro')}</div>
      <div>{campo('cidade', 'Cidade')}</div>
      <div>{campo('estado', 'Estado (UF)', { maxLength: 2 })}</div>
      <div className="sm:col-span-2">{campo('complemento', 'Complemento (opcional)')}</div>

      {erroServidor.length > 0 && (
        <ul className="space-y-1 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm sm:col-span-2">
          {erroServidor.map((mensagem) => (
            <li key={mensagem}>• {mensagem}</li>
          ))}
        </ul>
      )}

      <div className="flex justify-end gap-2 sm:col-span-2">
        <Button type="button" variant="outline" onClick={aoCancelar} disabled={salvando}>
          Cancelar
        </Button>
        <Button type="submit" disabled={salvando} className="font-extrabold uppercase tracking-[0.12em]">
          {salvando ? 'Salvando…' : 'Salvar'}
        </Button>
      </div>
    </form>
  );
}
