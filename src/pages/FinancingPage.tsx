import { useMemo, useState } from 'react';
import { Card, NumberField, StatCard } from '../components/ui';
import { annualToMonthlyRate, simulatePrice, simulateSac, type FinancingResult } from '../lib/finance';
import { formatBRL } from '../lib/format';
import { validateFields } from '../lib/validation';

type Field = 'price' | 'down' | 'rate' | 'months';

const RULES = {
  price: { label: 'Valor do bem', min: 1, max: 1_000_000_000 },
  down: { label: 'Entrada', min: 0, max: 1_000_000_000 },
  rate: { label: 'Taxa anual', min: 0, max: 100 },
  months: { label: 'Prazo', min: 1, max: 420, integer: true },
};

export function FinancingPage() {
  const [form, setForm] = useState<Record<Field, string>>({
    price: '300000',
    down: '60000',
    rate: '11',
    months: '360',
  });
  const [showSchedule, setShowSchedule] = useState<'PRICE' | 'SAC' | null>(null);

  const { values, errors, valid } = useMemo(() => {
    const base = validateFields(form, RULES);
    if (base.valid && base.values.down >= base.values.price) {
      return {
        ...base,
        valid: false,
        errors: { ...base.errors, down: 'A entrada deve ser menor que o valor do bem.' },
      };
    }
    return base;
  }, [form]);

  const results = useMemo(() => {
    if (!valid) return null;
    const principal = values.price - values.down;
    const monthlyRate = annualToMonthlyRate(values.rate);
    return {
      price: simulatePrice(principal, monthlyRate, values.months),
      sac: simulateSac(principal, monthlyRate, values.months),
    };
  }, [valid, values]);

  const set = (field: Field) => (value: string) => setForm((prev) => ({ ...prev, [field]: value }));
  const cheaper = results && results.sac.totalPaid < results.price.totalPaid ? 'SAC' : 'PRICE';
  const savings = results ? Math.abs(results.price.totalPaid - results.sac.totalPaid) : 0;

  return (
    <div className="page">
      <Card title="Simulador de financiamento" subtitle="Compare as tabelas SAC e Price para imóveis ou veículos.">
        <form className="form-grid" onSubmit={(e) => e.preventDefault()} noValidate>
          <NumberField
            id="fin-price"
            label="Valor do bem"
            suffix="R$"
            value={form.price}
            onChange={set('price')}
            error={errors.price}
          />
          <NumberField
            id="fin-down"
            label="Entrada"
            suffix="R$"
            value={form.down}
            onChange={set('down')}
            error={errors.down}
          />
          <NumberField
            id="fin-rate"
            label="Taxa anual"
            suffix="% a.a."
            value={form.rate}
            onChange={set('rate')}
            error={errors.rate}
          />
          <NumberField
            id="fin-months"
            label="Prazo"
            suffix="meses"
            value={form.months}
            onChange={set('months')}
            error={errors.months}
          />
        </form>
      </Card>

      {results && (
        <>
          <p className="callout" data-testid="fin-verdict">
            O sistema <strong>{cheaper}</strong> custa <strong>{formatBRL(savings)}</strong> a menos no total.
          </p>
          <div className="compare">
            <SystemCard
              result={results.price}
              title="Tabela Price"
              note="Parcelas fixas do início ao fim."
              onToggle={setShowSchedule}
              open={showSchedule === 'PRICE'}
            />
            <SystemCard
              result={results.sac}
              title="Tabela SAC"
              note="Parcelas decrescentes, amortização constante."
              onToggle={setShowSchedule}
              open={showSchedule === 'SAC'}
            />
          </div>
        </>
      )}
    </div>
  );
}

interface SystemCardProps {
  result: FinancingResult;
  title: string;
  note: string;
  open: boolean;
  onToggle: (system: 'PRICE' | 'SAC' | null) => void;
}

function SystemCard({ result, title, note, open, onToggle }: SystemCardProps) {
  const key = result.system.toLowerCase();
  return (
    <Card title={title} subtitle={note}>
      <div className="stats stats--stacked">
        <StatCard label="Primeira parcela" value={result.firstPayment} testId={`${key}-first`} />
        <StatCard label="Última parcela" value={result.lastPayment} testId={`${key}-last`} />
        <StatCard label="Total de juros" value={result.totalInterest} tone="negative" testId={`${key}-interest`} />
        <StatCard label="Total pago" value={result.totalPaid} tone="highlight" testId={`${key}-total`} />
      </div>
      <button
        type="button"
        className="btn btn--ghost"
        aria-expanded={open}
        onClick={() => onToggle(open ? null : result.system)}
      >
        {open ? 'Ocultar' : 'Ver'} tabela de parcelas
      </button>
      {open && (
        <div className="table-wrap table-wrap--scroll">
          <table>
            <caption>Parcelas — {title}</caption>
            <thead>
              <tr>
                <th scope="col">Mês</th>
                <th scope="col">Parcela</th>
                <th scope="col">Juros</th>
                <th scope="col">Amortização</th>
                <th scope="col">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {result.schedule.map((row) => (
                <tr key={row.month}>
                  <td>{row.month}</td>
                  <td>{formatBRL(row.payment)}</td>
                  <td>{formatBRL(row.interest)}</td>
                  <td>{formatBRL(row.amortization)}</td>
                  <td>{formatBRL(row.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
