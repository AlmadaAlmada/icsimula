import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CompositionBar, NumberField } from './ui';

describe('NumberField', () => {
  it('liga dica e erro ao input via aria-describedby', () => {
    render(<NumberField id="x" label="Campo" value="" onChange={() => {}} hint="Dica" error="Erro" />);
    const input = screen.getByLabelText('Campo');
    expect(input).toHaveAttribute('aria-describedby', 'x-hint x-error');
    expect(screen.getByText('Dica')).toBeInTheDocument();
  });

  it('não define aria-describedby sem dica nem erro', () => {
    render(<NumberField id="y" label="Outro" value="1" onChange={() => {}} />);
    expect(screen.getByLabelText('Outro')).not.toHaveAttribute('aria-describedby');
  });
});

describe('CompositionBar', () => {
  it('não renderiza quando o total é zero', () => {
    const { container } = render(<CompositionBar parts={[{ label: 'A', value: 0, className: 'a' }]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('mostra percentuais de cada parte', () => {
    render(
      <CompositionBar
        parts={[
          { label: 'A', value: 75, className: 'a' },
          { label: 'B', value: 25, className: 'b' },
        ]}
      />,
    );
    expect(screen.getByText(/A \(75\.0%\)/)).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAccessibleName('A: R$ 75,00, B: R$ 25,00');
  });
});
