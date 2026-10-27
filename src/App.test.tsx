import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';

function goTo(hash: string) {
  act(() => {
    window.location.hash = hash;
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  });
}

describe('App', () => {
  it('renderiza marca, navegação e espaços publicitários', () => {
    render(<App />);
    expect(screen.getByRole('link', { name: /simulafácil/i })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Simuladores' })).toBeInTheDocument();
    expect(screen.getAllByLabelText('Espaço publicitário')).toHaveLength(3);
    expect(screen.getByTestId('app-version')).toHaveTextContent(/^v\d+\.\d+\.\d+/);
  });

  it('abre o simulador de investimentos por padrão e marca o link ativo', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Simulador de investimentos' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Investimentos' })).toHaveAttribute('aria-current', 'page');
  });

  it('navega entre as páginas pelo hash', () => {
    render(<App />);
    goTo('#/financiamento');
    expect(screen.getByRole('heading', { name: 'Simulador de financiamento' })).toBeInTheDocument();
    goTo('#/meta');
    expect(screen.getByRole('heading', { name: 'Planejador de metas' })).toBeInTheDocument();
    goTo('#/sobre');
    expect(screen.getByRole('heading', { name: 'Sobre o SimulaFácil' })).toBeInTheDocument();
    expect(screen.getByTestId('about-version')).toBeInTheDocument();
  });
});

describe('Simulador de investimentos', () => {
  it('calcula com os valores padrão', () => {
    render(<App />);
    expect(screen.getByTestId('inv-invested')).toHaveTextContent('R$ 61.000,00');
    expect(screen.getByTestId('inv-final')).toHaveTextContent(/R\$ \d{3}\.\d{3},\d{2}/);
    expect(screen.getByRole('table', { name: 'Evolução ano a ano' })).toBeInTheDocument();
  });

  it('recalcula quando o usuário altera um campo', async () => {
    const user = userEvent.setup();
    render(<App />);
    const monthly = screen.getByLabelText('Aporte mensal');
    await user.clear(monthly);
    await user.type(monthly, '0');
    const rate = screen.getByLabelText('Taxa anual');
    await user.clear(rate);
    await user.type(rate, '0');
    expect(screen.getByTestId('inv-final')).toHaveTextContent('R$ 1.000,00');
    expect(screen.getByTestId('inv-interest')).toHaveTextContent('R$ 0,00');
  });

  it('mostra erro e esconde o resultado com entrada inválida', async () => {
    const user = userEvent.setup();
    render(<App />);
    const years = screen.getByLabelText('Prazo');
    await user.clear(years);
    expect(screen.getByRole('alert')).toHaveTextContent('Informe prazo.');
    expect(years).toHaveAttribute('aria-invalid', 'true');
    expect(screen.queryByTestId('inv-final')).not.toBeInTheDocument();
  });
});

describe('Simulador de financiamento', () => {
  it('compara SAC e Price e indica o mais barato', () => {
    render(<App />);
    goTo('#/financiamento');
    expect(screen.getByTestId('fin-verdict')).toHaveTextContent(/O sistema SAC custa R\$ [\d.]+,\d{2} a menos/);
    expect(screen.getByTestId('price-first')).toBeInTheDocument();
    expect(screen.getByTestId('sac-first')).toBeInTheDocument();
  });

  it('exibe e oculta a tabela de parcelas', async () => {
    const user = userEvent.setup();
    render(<App />);
    goTo('#/financiamento');
    const sacCard = screen.getByRole('region', { name: 'Tabela SAC' });
    const toggle = within(sacCard).getByRole('button', { name: /ver tabela/i });
    await user.click(toggle);
    const table = within(sacCard).getByRole('table');
    expect(within(table).getAllByRole('row')).toHaveLength(361);
    await user.click(within(sacCard).getByRole('button', { name: /ocultar/i }));
    expect(within(sacCard).queryByRole('table')).not.toBeInTheDocument();
  });

  it('valida entrada maior que o valor do bem', async () => {
    const user = userEvent.setup();
    render(<App />);
    goTo('#/financiamento');
    const down = screen.getByLabelText('Entrada');
    await user.clear(down);
    await user.type(down, '400000');
    expect(screen.getByRole('alert')).toHaveTextContent('A entrada deve ser menor que o valor do bem.');
    expect(screen.queryByTestId('fin-verdict')).not.toBeInTheDocument();
  });

  it('com juros zero os dois sistemas empatam e Price é exibido', async () => {
    const user = userEvent.setup();
    render(<App />);
    goTo('#/financiamento');
    const rate = screen.getByLabelText('Taxa anual');
    await user.clear(rate);
    await user.type(rate, '0');
    expect(screen.getByTestId('fin-verdict')).toHaveTextContent('O sistema PRICE custa R$ 0,00 a menos');
  });
});

describe('Planejador de metas', () => {
  it('calcula o aporte mensal necessário', () => {
    render(<App />);
    goTo('#/meta');
    expect(screen.getByTestId('goal-deposit')).toHaveTextContent(/R\$ 1\.\d{3},\d{2}/);
    expect(screen.getByTestId('goal-total')).toBeInTheDocument();
  });

  it('avisa quando a meta já é atingida sem aportes', async () => {
    const user = userEvent.setup();
    render(<App />);
    goTo('#/meta');
    const initial = screen.getByLabelText('Valor que já tenho');
    await user.clear(initial);
    await user.type(initial, '200000');
    expect(screen.getByTestId('goal-done')).toBeInTheDocument();
  });
});
