const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const percentFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'percent',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Formata número como moeda brasileira. O espaço não separável do Intl é normalizado. */
export function formatBRL(value: number): string {
  return currencyFormatter.format(value).replace(/\u00a0/g, ' ');
}

/** Formata uma fração (0.0125) como porcentagem (1,25%). */
export function formatPercent(fraction: number): string {
  return percentFormatter.format(fraction).replace(/\u00a0/g, ' ');
}

/**
 * Converte texto digitado pelo usuário em número.
 * Aceita "1.234,56", "1234,56", "1234.56" e "R$ 1.000".
 */
export function parseNumber(input: string): number {
  const cleaned = input.replace(/[^\d,.-]/g, '').trim();
  if (cleaned === '' || cleaned === '-') return Number.NaN;
  // Com vírgula: padrão brasileiro (ponto = milhar). Sem vírgula: pontos só são milhar se agruparem 3 dígitos.
  const groups = cleaned.replace(/^-/, '').split('.');
  const thousandsOnly = groups.length > 1 && groups[0].length <= 3 && groups.slice(1).every((g) => g.length === 3);
  const normalized = cleaned.includes(',') || thousandsOnly ? cleaned.replace(/\./g, '').replace(',', '.') : cleaned;
  return Number(normalized);
}
