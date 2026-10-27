import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DEFAULT_ROUTE, parseHash, useHashRoute } from './useHashRoute';

describe('parseHash', () => {
  it.each([
    ['#/financiamento', 'financiamento'],
    ['#meta', 'meta'],
    ['#/sobre?x=1', 'sobre'],
    ['', DEFAULT_ROUTE],
    ['#/inexistente', DEFAULT_ROUTE],
  ])('"%s" → %s', (hash, expected) => {
    expect(parseHash(hash)).toBe(expected);
  });
});

describe('useHashRoute', () => {
  it('reage a mudanças de hash', () => {
    const { result } = renderHook(() => useHashRoute());
    expect(result.current).toBe(DEFAULT_ROUTE);

    act(() => {
      window.location.hash = '#/meta';
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });

    expect(result.current).toBe('meta');
  });
});
