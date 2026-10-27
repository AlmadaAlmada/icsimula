import { AdSlot } from './components/AdSlot';
import { BUILD_INFO } from './buildInfo';
import { useHashRoute, type Route } from './hooks/useHashRoute';
import { AboutPage } from './pages/AboutPage';
import { FinancingPage } from './pages/FinancingPage';
import { GoalPage } from './pages/GoalPage';
import { InvestmentPage } from './pages/InvestmentPage';

const NAV: { route: Route; label: string }[] = [
  { route: 'investimentos', label: 'Investimentos' },
  { route: 'financiamento', label: 'Financiamento' },
  { route: 'meta', label: 'Metas' },
  { route: 'sobre', label: 'Sobre' },
];

const PAGES: Record<Route, () => JSX.Element> = {
  investimentos: InvestmentPage,
  financiamento: FinancingPage,
  meta: GoalPage,
  sobre: AboutPage,
};

export default function App() {
  const route = useHashRoute();
  // eslint-disable-next-line security/detect-object-injection -- route é sempre um valor validado de ROUTES
  const Page = PAGES[route];

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

      <AdSlot slot="topo" />

      <div className="layout">
        <main id="conteudo">
          <Page />
        </main>
        <AdSlot slot="lateral" />
      </div>

      <AdSlot slot="rodape" />

      <footer className="footer">
        <p>SimulaFácil — simulações educativas, não constituem recomendação financeira.</p>
        <p className="footer__version" data-testid="app-version">
          v{BUILD_INFO.version} · {BUILD_INFO.commit}
        </p>
      </footer>
    </div>
  );
}
