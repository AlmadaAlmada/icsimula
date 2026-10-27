import { describe, expect, it } from 'vitest';
import { formatBRL, formatPercent, parseNumber } from './format';

describe('formatBRL', () => {
  it('formata em reais com separadores brasileiros', () => {
    expect(formatBRL(1234.5)).toBe('R$ 1.234,50');
    expect(formatBRL(0)).toBe('R$ 0,00');
  });
});

describe('formatPercent', () => {
  it('formata frações como porcentagem', () => {
    expect(formatPercent(0.0125)).toBe('1,25%');
  });
});

describe('parseNumber', () => {
  it.each([
    ['1234', 1234],
    ['1.234,56', 1234.56],
    ['1234,5', 1234.5],
    ['1234.56', 1234.56],
    ['R$ 1.000', 1000],
    ['  42 ', 42],
    ['1.234', 1234],
    ['10.5', 10.5],
    ['-3', -3],
  ])('converte "%s" em %s', (input, expected) => {
    expect(parseNumber(input)).toBe(expected);
  });

  it.each(['', 'abc', '-'])('retorna NaN para "%s"', (input) => {
    expect(parseNumber(input)).toBeNaN();
  });
});
