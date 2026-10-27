import { parseNumber } from './format';

export interface FieldRule {
  label: string;
  min?: number;
  max?: number;
  integer?: boolean;
}

export type FieldErrors<K extends string> = Partial<Record<K, string>>;

/**
 * Valida um conjunto de campos de formulário (texto) contra regras simples.
 * Retorna os valores numéricos e as mensagens de erro por campo.
 */
export function validateFields<K extends string>(
  raw: Record<K, string>,
  rules: Record<K, FieldRule>,
): { values: Record<K, number>; errors: FieldErrors<K>; valid: boolean } {
  const values = {} as Record<K, number>;
  const errors: FieldErrors<K> = {};

  for (const key of Object.keys(rules) as K[]) {
    // As chaves vêm do objeto de regras tipado pelo próprio código, não de entrada do usuário.
    // eslint-disable-next-line security/detect-object-injection
    const rule = rules[key];
    // eslint-disable-next-line security/detect-object-injection
    const value = parseNumber(raw[key] ?? '');
    // eslint-disable-next-line security/detect-object-injection
    values[key] = value;

    let message: string | undefined;
    if (Number.isNaN(value)) message = `Informe ${rule.label.toLowerCase()}.`;
    else if (rule.integer && !Number.isInteger(value)) message = `${rule.label} deve ser um número inteiro.`;
    else if (rule.min !== undefined && value < rule.min) message = `${rule.label} deve ser no mínimo ${rule.min}.`;
    else if (rule.max !== undefined && value > rule.max) message = `${rule.label} deve ser no máximo ${rule.max}.`;

    // eslint-disable-next-line security/detect-object-injection
    if (message) errors[key] = message;
  }

  return { values, errors, valid: Object.keys(errors).length === 0 };
}
