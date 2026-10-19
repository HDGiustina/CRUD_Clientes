import { useEffect, useState } from 'react';
import { ArrowUpRight, Moon, Plus, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { atualizarCliente, criarCliente, inativarCliente, listarClientes } from '@/lib/api';
import { useTema } from '@/lib/tema';
import ClienteForm from '@/components/ClienteForm';

function enderecoCompleto(c) {
  return `${c.endereco}, ${c.numero} - ${c.bairro}, ${c.cidade}/${c.estado} · CEP ${c.cep}`;
}

export default function App() {
  const [clientes, setClientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroCpf, setFiltroCpf] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState([]);
  const [tema, alternarTema] = useTema();

  async function carregar(filtros = {}) {
    setCarregando(true);
    setErro('');
    try {
      setClientes(await listarClientes(filtros));
    } catch (e) {
      setErro(
        e.message === 'Failed to fetch'
          ? 'Não foi possível conectar ao servidor. Verifique se ele está em execução e tente novamente.'
          : e.message,
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function buscar(e) {
    e.preventDefault();
    carregar({ nome: filtroNome, cpf: filtroCpf });
  }

  function limpar() {
    setFiltroNome('');
    setFiltroCpf('');
    carregar();
  }

  function abrirNovo() {
    setEditando(null);
    setErroForm([]);
    setModalAberto(true);
  }

  function abrirEdicao(cliente) {
    setEditando(cliente);
    setErroForm([]);
    setModalAberto(true);
  }

  // Salva criando (modal novo) ou atualizando (modal edição); 409 vira mensagem no form.
  async function salvar(valores) {
    setSalvando(true);
    setErroForm([]);
    try {
      if (editando) {
        await atualizarCliente(editando.id, valores);
      } else {
        await criarCliente(valores);
      }
      setModalAberto(false);
      carregar({ nome: filtroNome, cpf: filtroCpf });
    } catch (e) {
      setErroForm(e.detalhes?.length > 0 ? e.detalhes : [e.message]);
    } finally {
      setSalvando(false);
    }
  }

  const [inativando, setInativando] = useState(null);

  function pedirInativacao(cliente) {
    setInativando(cliente);
  }

  async function confirmarInativacao() {
    if (!inativando) return;
    try {
      await inativarCliente(inativando.id);
      setInativando(null);
      carregar({ nome: filtroNome, cpf: filtroCpf });
    } catch (e) {
      setInativando(null);
      setErro(e.message);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:px-6">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Cadastro · Tela única</p>
            <h1 className="font-heading text-4xl font-semibold tracking-tight">Clientes</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {clientes.length === 1 ? '1 cliente na lista' : `${clientes.length} clientes na lista`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={alternarTema}
              aria-label={tema === 'escuro' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
              title={tema === 'escuro' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            >
              {tema === 'escuro' ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
            <Button onClick={abrirNovo} className="font-extrabold uppercase tracking-[0.12em]">
              <Plus className="size-4" />
              Novo Cliente
            </Button>
          </div>
        </header>

        <main className="flex-1">
        <form onSubmit={buscar} className="mb-6 grid grid-cols-1 gap-3 rounded-lg border p-4 sm:grid-cols-[1fr_1fr_auto_auto]">
          <div className="space-y-1.5">
            <Label htmlFor="filtro-nome">Nome do cliente</Label>
            <Input
              id="filtro-nome"
              placeholder="Ex.: Maria"
              value={filtroNome}
              onChange={(e) => setFiltroNome(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="filtro-cpf">CPF</Label>
            <Input
              id="filtro-cpf"
              placeholder="Ex.: 123.456"
              value={filtroCpf}
              onChange={(e) => setFiltroCpf(e.target.value)}
            />
          </div>
          <div className="flex items-end gap-2">
            <Button type="submit" className="font-extrabold uppercase tracking-[0.12em]">Filtrar</Button>
            <Button type="button" variant="outline" onClick={limpar}>
              Limpar
            </Button>
          </div>
        </form>

        {erro && (
          <div className="mb-4 flex flex-col gap-3 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p>{erro}</p>
            <Button type="button" variant="outline" size="sm" onClick={() => carregar({ nome: filtroNome, cpf: filtroCpf })}>
              Tentar novamente
            </Button>
          </div>
        )}

        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader className="bg-muted/60">
              <TableRow className="hover:bg-muted/60">
                <TableHead className="text-xs font-bold uppercase tracking-[0.12em]">Nome</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-[0.12em]">CPF</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-[0.12em]">Telefone</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-[0.12em]">Endereço completo</TableHead>
                <TableHead className="text-right text-xs font-bold uppercase tracking-[0.12em]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {carregando ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Carregando…
                  </TableCell>
                </TableRow>
              ) : clientes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nenhum cliente encontrado. Clique em “Novo Cliente” para cadastrar.
                  </TableCell>
                </TableRow>
              ) : (
                clientes.map((c) => (
                  <TableRow key={c.id} className="border-b-2 hover:bg-muted/40">
                    <TableCell className="py-4 align-top font-semibold">{c.nome}</TableCell>
                    <TableCell className="py-4 align-top tabular-nums">{c.cpf}</TableCell>
                    <TableCell className="py-4 align-top tabular-nums">{c.telefone}</TableCell>
                    <TableCell className="max-w-72 truncate py-4 align-top text-sm" title={enderecoCompleto(c)}>
                      {enderecoCompleto(c)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap py-4 text-right align-top">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => abrirEdicao(c)}>
                          Editar
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => pedirInativacao(c)}>
                          Inativar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        </main>

        <footer className="mt-10 flex flex-col items-center gap-2 border-t pt-6 pb-2 text-sm text-muted-foreground sm:flex-row sm:justify-between">
          <p>
            Desenvolvido por{' '}
            <a
              href="https://www.linkedin.com/in/helenadgiustina/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Helena Della Giustina
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
          </p>
        </footer>

        <Dialog open={modalAberto} onOpenChange={setModalAberto}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editando ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
              <DialogDescription>
                {editando ? 'Altere os dados e salve.' : 'Preencha os dados. O CEP busca a cidade e o estado sozinhos.'}
              </DialogDescription>
            </DialogHeader>
            <ClienteForm
              key={editando ? editando.id : 'novo'}
              inicial={editando}
              salvando={salvando}
              erroServidor={erroForm}
              aoSalvar={salvar}
              aoCancelar={() => setModalAberto(false)}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={Boolean(inativando)} onOpenChange={(aberto) => !aberto && setInativando(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Inativar cliente</DialogTitle>
              <DialogDescription>
                <span className="font-semibold text-foreground">{inativando?.nome}</span> vai sair da lista, mas os
                dados continuam guardados no banco.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setInativando(null)}>
                Cancelar
              </Button>
              <Button type="button" variant="destructive" onClick={confirmarInativacao}>
                Inativar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
