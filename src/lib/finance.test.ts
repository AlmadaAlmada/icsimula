import { describe, expect, it } from 'vitest';
import { annualToMonthlyRate, round2, simulateCompound } from './finance';

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

describe('simulateCompound', () => {
  it('sem aportes, aplica juros compostos sobre o valor inicial', () => {
    const result = simulateCompound(1000, 0, 0.01, 12);
    expect(result.finalAmount).toBeCloseTo(1126.83, 2);
    expect(result.totalInvested).toBe(1000);
  });

  it('com taxa zero o valor final é a soma dos aportes', () => {
    const result = simulateCompound(1000, 100, 0, 24);
    expect(result.finalAmount).toBe(3400);
    expect(result.totalInterest).toBe(0);
    expect(result.byYear).toHaveLength(2);
  });

  it('inclui o ano parcial na evolução anual', () => {
    const result = simulateCompound(0, 100, 0.005, 18);
    expect(result.byYear.map((row) => row.year)).toEqual([1, 2]);
    expect(result.byYear.at(-1)?.balance).toBe(result.finalAmount);
  });

  it('bate com a fórmula fechada de valor futuro', () => {
    const i = 0.008;
    const n = 120;
    const expected = 5000 * Math.pow(1 + i, n) + (300 * (Math.pow(1 + i, n) - 1)) / i;
    expect(simulateCompound(5000, 300, i, n).finalAmount).toBeCloseTo(expected, 1);
  });
});
