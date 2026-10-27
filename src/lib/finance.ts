/**
 * Funções financeiras puras do SimulaFácil.
 * Não dependem de React nem do DOM — por isso concentram a maior parte dos testes unitários.
 */

/** Arredonda para 2 casas decimais evitando erros de ponto flutuante (ex.: 1.005). */
export function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Converte taxa anual efetiva (em %) para taxa mensal equivalente (fração). */
export function annualToMonthlyRate(annualPercent: number): number {
  if (annualPercent <= -100) {
    throw new RangeError('A taxa anual deve ser maior que -100%.');
  }
  return Math.pow(1 + annualPercent / 100, 1 / 12) - 1;
}
