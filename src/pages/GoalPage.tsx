import { useMemo, useState } from 'react';
import { Card, NumberField, StatCard } from '../components/ui';
import { annualToMonthlyRate, requiredMonthlyDeposit } from '../lib/finance';
import { formatBRL } from '../lib/format';
import { validateFields } from '../lib/validation';

type Field = 'goal' | 'initial' | 'rate' | 'years';

const RULES = {
  goal: { label: 'Meta', min: 1, max: 1_000_000_000 },
  initial: { label: 'Valor que já tenho', min: 0, max: 1_000_000_000 },
  rate: { label: 'Taxa anual', min: 0, max: 100 },
  years: { label: 'Prazo', min: 1, max: 60, integer: true },
};

export function GoalPage() {
  const [form, setForm] = useState<Record<Field, string>>({
    goal: '100000',
    initial: '5000',
    rate: '10',
    years: '5',
  });

  const { values, errors, valid } = useMemo(() => validateFields(form, RULES), [form]);
  const deposit = useMemo(() => {
    if (!valid) return null;
    return requiredMonthlyDeposit(values.goal, values.initial, annualToMonthlyRate(values.rate), values.years * 12);
  }, [valid, values]);

  const set = (field: Field) => (value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="page">
      <Card title="Planejador de metas" subtitle="Descubra quanto guardar por mês para realizar um objetivo.">
        <form className="form-grid" onSubmit={(e) => e.preventDefault()} noValidate>
          <NumberField
            id="goal-goal"
            label="Meta"
            suffix="R$"
            value={form.goal}
            onChange={set('goal')}
            error={errors.goal}
          />
          <NumberField
            id="goal-initial"
            label="Valor que já tenho"
            suffix="R$"
            value={form.initial}
            onChange={set('initial')}
            error={errors.initial}
          />
          <NumberField
            id="goal-rate"
            label="Taxa anual"
            suffix="% a.a."
            value={form.rate}
            onChange={set('rate')}
            error={errors.rate}
          />
          <NumberField
            id="goal-years"
            label="Prazo"
            suffix="anos"
            value={form.years}
            onChange={set('years')}
            error={errors.years}
          />
        </form>
      </Card>

      {deposit !== null && (
        <Card title="Resultado">
          {deposit === 0 ? (
            <p className="callout callout--success" data-testid="goal-done">
              Boa notícia: o valor que você já tem rende o suficiente para atingir {formatBRL(values.goal)} sem novos
              aportes.
            </p>
          ) : (
            <div className="stats">
              <StatCard label="Aporte mensal necessário" value={deposit} tone="highlight" testId="goal-deposit" />
              <StatCard
                label="Total que você vai depositar"
                value={deposit * values.years * 12 + values.initial}
                testId="goal-total"
              />
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
