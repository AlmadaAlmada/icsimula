import { describe, expect, it } from 'vitest';
import { annualToMonthlyRate, round2 } from './finance';

describe('round2', () => {
  it('arredonda para duas casas decimais corrigindo ponto flutuante', () => {
    expect(round2(1.005)).toBe(1.01);
    expect(round2(2.344)).toBe(2.34);
    expect(round2(-1.555)).toBe(-1.55);
  });
});

describe('annualToMonthlyRate', () => {
  it('converte 12% a.a. para ~0,9489% a.m.', () => {
    expect(annualToMonthlyRate(12)).toBeCloseTo(0.009489, 6);
  });

  it('retorna 0 para taxa zero', () => {
    expect(annualToMonthlyRate(0)).toBe(0);
  });

  it('é consistente: compor 12 meses devolve a taxa anual', () => {
    const monthly = annualToMonthlyRate(10);
    expect(Math.pow(1 + monthly, 12) - 1).toBeCloseTo(0.1, 10);
  });

  it('rejeita taxas menores ou iguais a -100%', () => {
    expect(() => annualToMonthlyRate(-100)).toThrow(RangeError);
  });
});
