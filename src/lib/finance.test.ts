import { describe, expect, it } from 'vitest';
import { annualToMonthlyRate, pricePayment, round2, simulateCompound, simulatePrice, simulateSac } from './finance';

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

describe('pricePayment', () => {
  it('calcula a parcela fixa clássica (100 mil, 1% a.m., 12 meses)', () => {
    expect(pricePayment(100_000, 0.01, 12)).toBeCloseTo(8884.88, 2);
  });

  it('divide igualmente quando a taxa é zero', () => {
    expect(pricePayment(1200, 0, 12)).toBe(100);
  });

  it.each([0, -1, 1.5, Number.NaN])('rejeita prazo inválido (%s)', (months) => {
    expect(() => pricePayment(1000, 0.01, months)).toThrow(RangeError);
  });
});

describe('simulatePrice', () => {
  const result = simulatePrice(100_000, 0.01, 12);

  it('gera uma linha por mês e quita o saldo', () => {
    expect(result.schedule).toHaveLength(12);
    expect(result.schedule.at(-1)?.balance).toBe(0);
  });

  it('mantém parcelas iguais', () => {
    expect(result.firstPayment).toBe(8884.88);
    expect(result.lastPayment).toBeCloseTo(8884.88, 1);
  });

  it('total pago = principal + juros', () => {
    expect(result.totalPaid).toBeCloseTo(result.principal + result.totalInterest, 2);
    expect(result.totalInterest).toBeCloseTo(6618.55, 1);
  });

  it('amortização cresce ao longo do tempo', () => {
    expect(result.schedule[11].amortization).toBeGreaterThan(result.schedule[0].amortization);
  });
});

describe('simulateSac', () => {
  const result = simulateSac(120_000, 0.01, 12);

  it('mantém amortização constante', () => {
    const amortizations = new Set(result.schedule.map((row) => row.amortization));
    expect(amortizations).toEqual(new Set([10_000]));
  });

  it('tem parcelas decrescentes', () => {
    expect(result.firstPayment).toBe(11_200);
    expect(result.lastPayment).toBe(10_100);
  });

  it('total de juros é menor que no sistema Price com os mesmos parâmetros', () => {
    const price = simulatePrice(120_000, 0.01, 12);
    expect(result.totalInterest).toBeLessThan(price.totalInterest);
    expect(result.totalInterest).toBe(7800);
  });

  it('rejeita prazo inválido', () => {
    expect(() => simulateSac(1000, 0.01, 0)).toThrow(RangeError);
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
