import type { Route } from './hooks/useHashRoute';
import { InvestmentPage } from './pages/InvestmentPage';

const NAV: { route: Route; label: string }[] = [{ route: 'investimentos', label: 'Investimentos' }];

export default function App() {
  const route: Route = 'investimentos';

  return (
    <div className="app">
      <header className="topbar">
        <a className="brand" href="#/investimentos">
          <span className="brand__logo" aria-hidden="true">
            S
          </span>
          SimulaFácil
        </a>
        <nav aria-label="Simuladores">
          <ul>
            {NAV.map((item) => (
              <li key={item.route}>
                <a href={`#/${item.route}`} aria-current={item.route === route ? 'page' : undefined}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main id="conteudo">
        <InvestmentPage />
      </main>
    </div>
  );
}
