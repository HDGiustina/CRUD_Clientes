import { useEffect, useState } from 'react';
import { ArrowUpRight, Moon, Plus, Sun } from 'lucide-react';import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { listarClientes } from '@/lib/api';
import { useTema } from '@/lib/tema';

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
  const [tema, alternarTema] = useTema();

  async function carregar(filtros = {}) {
    setCarregando(true);
    setErro('');
    try {
      setClientes(await listarClientes(filtros));
    } catch (e) {
      setErro(e.message === 'Failed to fetch' ? 'API fora do ar. Suba o back (npm run dev em api/).' : e.message);
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
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
            <Button onClick={() => setModalAberto(true)} className="font-extrabold uppercase tracking-[0.12em]">
              <Plus className="size-4" />
              Novo Cliente
            </Button>
          </div>
        </header>

        <main>
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

        {erro && <p className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm">{erro}</p>}

        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Endereço completo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
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
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.nome}</TableCell>
                    <TableCell className="tabular-nums">{c.cpf}</TableCell>
                    <TableCell className="tabular-nums">{c.telefone}</TableCell>
                    <TableCell>{enderecoCompleto(c)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" disabled>
                          Editar
                        </Button>
                        <Button variant="destructive" size="sm" disabled>
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Cliente</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">O formulário chega na próxima etapa.</p>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
