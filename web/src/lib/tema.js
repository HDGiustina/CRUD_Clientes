import { useEffect, useState } from 'react';

// Tema claro/escuro: vale o salvo no navegador; sem nada salvo, segue o sistema.
export function temaInicial() {
  try {
    const salvo = localStorage.getItem('clientes-tema');
    if (salvo === 'claro' || salvo === 'escuro') return salvo;
  } catch {
    // Navegador sem localStorage: cai para o sistema.
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro';
}

export function useTema() {
  const [tema, setTema] = useState(temaInicial);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', tema === 'escuro');
    try {
      localStorage.setItem('clientes-tema', tema);
    } catch {
      // Sem localStorage o tema só vale nesta sessão.
    }
  }, [tema]);

  const alternar = () => setTema((t) => (t === 'escuro' ? 'claro' : 'escuro'));
  return [tema, alternar];
}
