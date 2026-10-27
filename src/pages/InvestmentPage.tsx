import { useMemo, useState } from 'react';
import { Card, CompositionBar, NumberField, StatCard } from '../components/ui';
import { annualToMonthlyRate, simulateCompound } from '../lib/finance';
import { formatBRL, formatPercent } from '../lib/format';
import { validateFields } from '../lib/validation';

type Field = 'initial' | 'monthly' | 'rate' | 'years';

const RULES = {
  initial: { label: 'Valor inicial', min: 0, max: 1_000_000_000 },
  monthly: { label: 'Aporte mensal', min: 0, max: 100_000_000 },
  rate: { label: 'Taxa anual', min: 0, max: 100 },
  years: { label: 'Prazo', min: 1, max: 60, integer: true },
};

export function InvestmentPage() {
  const [form, setForm] = useState<Record<Field, string>>({
    initial: '1000',
    monthly: '500',
    rate: '10',
    years: '10',
  });

  const { values, errors, valid } = useMemo(() => validateFields(form, RULES), [form]);
  const result = useMemo(() => {
    if (!valid) return null;
    const monthlyRate = annualToMonthlyRate(values.rate);
    return { monthlyRate, ...simulateCompound(values.initial, values.monthly, monthlyRate, values.years * 12) };
  }, [valid, values]);

  const set = (field: Field) => (value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="page">
      <Card
        title="Simulador de investimentos"
        subtitle="Veja quanto seu dinheiro rende com juros compostos e aportes mensais."
      >
        <form className="form-grid" onSubmit={(e) => e.preventDefault()} noValidate>
          <NumberField
            id="inv-initial"
            label="Valor inicial"
            suffix="R$"
            value={form.initial}
            onChange={set('initial')}
            error={errors.initial}
          />
          <NumberField
            id="inv-monthly"
            label="Aporte mensal"
            suffix="R$"
            value={form.monthly}
            onChange={set('monthly')}
            error={errors.monthly}
          />
          <NumberField
            id="inv-rate"
            label="Taxa anual"
            suffix="% a.a."
            value={form.rate}
            onChange={set('rate')}
            error={errors.rate}
          />
          <NumberField
            id="inv-years"
            label="Prazo"
            suffix="anos"
            value={form.years}
            onChange={set('years')}
            error={errors.years}
          />
        </form>
      </Card>

      {result && (
        <Card title="Resultado" subtitle={`Taxa mensal equivalente: ${formatPercent(result.monthlyRate)}`}>
          <div className="stats">
            <StatCard label="Valor final" value={result.finalAmount} tone="highlight" testId="inv-final" />
            <StatCard label="Total investido" value={result.totalInvested} testId="inv-invested" />
            <StatCard label="Juros ganhos" value={result.totalInterest} tone="positive" testId="inv-interest" />
          </div>
          <CompositionBar
            parts={[
              { label: 'Investido', value: result.totalInvested, className: 'c-invested' },
              { label: 'Juros', value: result.totalInterest, className: 'c-interest' },
            ]}
          />
          <div className="table-wrap">
            <table>
              <caption>Evolução ano a ano</caption>
              <thead>
                <tr>
                  <th scope="col">Ano</th>
                  <th scope="col">Investido</th>
                  <th scope="col">Juros acumulados</th>
                  <th scope="col">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {result.byYear.map((row) => (
                  <tr key={row.year}>
                    <td>{row.year}</td>
                    <td>{formatBRL(row.invested)}</td>
                    <td>{formatBRL(row.interest)}</td>
                    <td>{formatBRL(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
