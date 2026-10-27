/**
 * Funções financeiras puras do SimulaFácil.
 * Não dependem de React nem do DOM — por isso concentram a maior parte dos testes unitários.
 */

export interface CompoundYearRow {
  year: number;
  invested: number;
  interest: number;
  balance: number;
}

export interface CompoundResult {
  finalAmount: number;
  totalInvested: number;
  totalInterest: number;
  byYear: CompoundYearRow[];
}

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

/**
 * Juros compostos com aporte inicial e aportes mensais (no fim de cada mês).
 */
export function simulateCompound(
  initial: number,
  monthlyDeposit: number,
  monthlyRate: number,
  months: number,
): CompoundResult {
  assertPositiveInteger(months, 'prazo');
  let balance = initial;
  let invested = initial;
  const byYear: CompoundYearRow[] = [];

  for (let month = 1; month <= months; month++) {
    balance = balance * (1 + monthlyRate) + monthlyDeposit;
    invested += monthlyDeposit;
    if (month % 12 === 0 || month === months) {
      byYear.push({
        year: Math.ceil(month / 12),
        invested: round2(invested),
        interest: round2(balance - invested),
        balance: round2(balance),
      });
    }
  }

  return {
    finalAmount: round2(balance),
    totalInvested: round2(invested),
    totalInterest: round2(balance - invested),
    byYear,
  };
}

function assertPositiveInteger(value: number, name: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new RangeError(`O ${name} deve ser um número inteiro maior que zero.`);
  }
}
