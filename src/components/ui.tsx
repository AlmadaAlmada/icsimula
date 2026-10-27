import type { ReactNode } from 'react';
import { formatBRL } from '../lib/format';

interface NumberFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  suffix?: string;
  hint?: string;
}

export function NumberField({ id, label, value, onChange, error, suffix, hint }: NumberFieldProps) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(' ');
  return (
    <div className={`field${error ? ' field--error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <div className="field__control">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={value}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy || undefined}
          onChange={(event) => onChange(event.target.value)}
        />
        {suffix && <span className="field__suffix">{suffix}</span>}
      </div>
      {hint && (
        <small id={`${id}-hint`} className="field__hint">
          {hint}
        </small>
      )}
      {error && (
        <small id={`${id}-error`} className="field__error" role="alert">
          {error}
        </small>
      )}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  tone?: 'default' | 'positive' | 'negative' | 'highlight';
  testId?: string;
}

export function StatCard({ label, value, tone = 'default', testId }: StatCardProps) {
  return (
    <div className={`stat stat--${tone}`}>
      <span className="stat__label">{label}</span>
      <strong className="stat__value" data-testid={testId}>
        {formatBRL(value)}
      </strong>
    </div>
  );
}

interface CompositionBarProps {
  parts: { label: string; value: number; className: string }[];
}

/** Barra horizontal que mostra a composição de um total (ex.: investido x juros). */
export function CompositionBar({ parts }: CompositionBarProps) {
  const total = parts.reduce((sum, part) => sum + Math.max(0, part.value), 0);
  if (total <= 0) return null;
  return (
    <figure className="composition">
      <div
        className="composition__bar"
        role="img"
        aria-label={parts.map((p) => `${p.label}: ${formatBRL(p.value)}`).join(', ')}
      >
        {parts.map((part) => (
          <span
            key={part.label}
            className={`composition__part ${part.className}`}
            style={{ width: `${(Math.max(0, part.value) / total) * 100}%` }}
          />
        ))}
      </div>
      <figcaption className="composition__legend">
        {parts.map((part) => (
          <span key={part.label}>
            <i className={`dot ${part.className}`} aria-hidden="true" /> {part.label} (
            {((Math.max(0, part.value) / total) * 100).toFixed(1)}%)
          </span>
        ))}
      </figcaption>
    </figure>
  );
}

export function Card({ title, children, subtitle }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="card" aria-label={title}>
      <header className="card__header">
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </header>
      {children}
    </section>
  );
}
