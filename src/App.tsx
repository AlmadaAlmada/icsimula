import { useHashRoute, type Route } from './hooks/useHashRoute';
import { FinancingPage } from './pages/FinancingPage';
import { GoalPage } from './pages/GoalPage';
import { InvestmentPage } from './pages/InvestmentPage';

const NAV: { route: Route; label: string }[] = [
  { route: 'investimentos', label: 'Investimentos' },
  { route: 'financiamento', label: 'Financiamento' },
  { route: 'meta', label: 'Metas' },
];

function pageFor(route: Route) {
  switch (route) {
    case 'financiamento':
      return FinancingPage;
    case 'meta':
      return GoalPage;
    default:
      return InvestmentPage;
  }
}

export default function App() {
  const route = useHashRoute();
  const Page = pageFor(route);

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
        <Page />
      </main>
    </div>
  );
}
