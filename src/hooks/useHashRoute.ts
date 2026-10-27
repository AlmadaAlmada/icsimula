import { useEffect, useState } from 'react';

export const ROUTES = ['investimentos', 'financiamento', 'meta', 'sobre'] as const;
export type Route = (typeof ROUTES)[number];

export const DEFAULT_ROUTE: Route = 'investimentos';

/** Lê a rota a partir de um hash como "#/financiamento". Valores desconhecidos caem na rota padrão. */
export function parseHash(hash: string): Route {
  const candidate = hash.replace(/^#\/?/, '').split(/[?/]/)[0];
  return (ROUTES as readonly string[]).includes(candidate) ? (candidate as Route) : DEFAULT_ROUTE;
}

/**
 * Roteamento por hash: funciona em qualquer hospedagem estática (GitHub Pages, Nginx, etc.)
 * sem precisar de regras de rewrite no servidor.
 */
export function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));

  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return route;
}
