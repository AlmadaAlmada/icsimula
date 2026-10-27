/**
 * Funções financeiras puras do SimulaFácil.
 * Não dependem de React nem do DOM — por isso concentram a maior parte dos testes unitários.
 */

export interface ScheduleRow {
  month: number;
  payment: number;
  interest: number;
  amortization: number;
  balance: number;
}

export interface FinancingResult {
  system: 'PRICE' | 'SAC';
  principal: number;
  firstPayment: number;
  lastPayment: number;
  totalPaid: number;
  totalInterest: number;
  schedule: ScheduleRow[];
}

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

/** Parcela fixa do Sistema Price (tabela Price / francês). */
export function pricePayment(principal: number, monthlyRate: number, months: number): number {
  assertPositiveInteger(months, 'prazo');
  if (monthlyRate === 0) return principal / months;
  return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
}

export function simulatePrice(principal: number, monthlyRate: number, months: number): FinancingResult {
  const payment = pricePayment(principal, monthlyRate, months);
  const schedule: ScheduleRow[] = [];
  let balance = principal;

  for (let month = 1; month <= months; month++) {
    const interest = balance * monthlyRate;
    // Na última parcela amortiza exatamente o saldo restante, eliminando resíduos de arredondamento.
    const amortization = month === months ? balance : payment - interest;
    balance = Math.max(0, balance - amortization);
    schedule.push({ month, payment: interest + amortization, interest, amortization, balance });
  }

  return summarize('PRICE', principal, schedule);
}

export function simulateSac(principal: number, monthlyRate: number, months: number): FinancingResult {
  assertPositiveInteger(months, 'prazo');
  const amortization = principal / months;
  const schedule: ScheduleRow[] = [];
  let balance = principal;

  for (let month = 1; month <= months; month++) {
    const interest = balance * monthlyRate;
    balance = Math.max(0, balance - amortization);
    schedule.push({ month, payment: amortization + interest, interest, amortization, balance });
  }

  return summarize('SAC', principal, schedule);
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

function summarize(system: 'PRICE' | 'SAC', principal: number, schedule: ScheduleRow[]): FinancingResult {
  const totalPaid = schedule.reduce((sum, row) => sum + row.payment, 0);
  const rounded = schedule.map((row) => ({
    month: row.month,
    payment: round2(row.payment),
    interest: round2(row.interest),
    amortization: round2(row.amortization),
    balance: round2(row.balance),
  }));
  return {
    system,
    principal: round2(principal),
    firstPayment: rounded[0]?.payment ?? 0,
    lastPayment: rounded[rounded.length - 1]?.payment ?? 0,
    totalPaid: round2(totalPaid),
    totalInterest: round2(totalPaid - principal),
    schedule: rounded,
  };
}

function assertPositiveInteger(value: number, name: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new RangeError(`O ${name} deve ser um número inteiro maior que zero.`);
  }
}
