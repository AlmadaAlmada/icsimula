import { Card } from '../components/ui';
import { BUILD_INFO } from '../buildInfo';

export function AboutPage() {
  return (
    <div className="page">
      <Card title="Sobre o SimulaFácil">
        <div className="prose">
          <p>
            O SimulaFácil reúne calculadoras financeiras gratuitas para ajudar você a decidir melhor: quanto um
            investimento rende, qual sistema de financiamento sai mais barato e quanto guardar por mês para chegar a uma
            meta.
          </p>
          <p>
            Os resultados são estimativas educativas e não consideram impostos, tarifas, seguros ou inflação. Não
            constituem recomendação de investimento.
          </p>
          <h3>Versão publicada</h3>
          <dl className="build-info">
            <dt>Versão</dt>
            <dd data-testid="about-version">{BUILD_INFO.version}</dd>
            <dt>Commit</dt>
            <dd>
              <code>{BUILD_INFO.commit}</code>
            </dd>
            <dt>Build</dt>
            <dd>{BUILD_INFO.builtAt}</dd>
          </dl>
        </div>
      </Card>
    </div>
  );
}
