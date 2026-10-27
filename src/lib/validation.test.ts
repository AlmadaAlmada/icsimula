import { describe, expect, it } from 'vitest';
import { validateFields } from './validation';

const rules = {
  amount: { label: 'Valor', min: 0, max: 100 },
  months: { label: 'Prazo', min: 1, integer: true },
};

describe('validateFields', () => {
  it('aceita valores válidos', () => {
    const result = validateFields({ amount: '50', months: '12' }, rules);
    expect(result.valid).toBe(true);
    expect(result.values).toEqual({ amount: 50, months: 12 });
    expect(result.errors).toEqual({});
  });

  it('acusa campo vazio', () => {
    const result = validateFields({ amount: '', months: '12' }, rules);
    expect(result.valid).toBe(false);
    expect(result.errors.amount).toBe('Informe valor.');
  });

  it('acusa valores fora do intervalo', () => {
    expect(validateFields({ amount: '-1', months: '1' }, rules).errors.amount).toMatch(/mínimo 0/);
    expect(validateFields({ amount: '101', months: '1' }, rules).errors.amount).toMatch(/máximo 100/);
  });

  it('exige inteiro quando configurado', () => {
    expect(validateFields({ amount: '1', months: '1,5' }, rules).errors.months).toMatch(/inteiro/);
  });
});
