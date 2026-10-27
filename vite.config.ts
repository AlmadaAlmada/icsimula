/// <reference types="vitest/config" />
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

// Caminho fixo, resolvido a partir do próprio arquivo de configuração (não vem de entrada externa).
// eslint-disable-next-line security/detect-non-literal-fs-filename
const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8')) as { version: string };

function resolveCommit(): string {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA.slice(0, 7);
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return 'local';
  }
}

const buildInfo = {
  version: pkg.version,
  commit: resolveCommit(),
  builtAt: new Date().toISOString(),
};

/**
 * Gera `version.json` dentro do artefato de build.
 * O workflow de monitoramento consulta esse arquivo para saber qual versão está no ar.
 */
function versionFile(): Plugin {
  return {
    name: 'icsimula-version-file',
    apply: 'build',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: JSON.stringify({ name: 'icsimula', status: 'ok', ...buildInfo }, null, 2),
      });
    },
  };
}

export default defineConfig({
  // No GitHub Pages o site fica em /<repositorio>/; o pipeline informa via BASE_PATH.
  base: process.env.BASE_PATH ?? '/',
  plugins: [react(), versionFile()],
  define: {
    __APP_VERSION__: JSON.stringify(buildInfo.version),
    __APP_COMMIT__: JSON.stringify(buildInfo.commit),
    __APP_BUILT_AT__: JSON.stringify(buildInfo.builtAt),
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    reporters: process.env.CI ? ['default', 'junit'] : ['default'],
    outputFile: { junit: './reports/junit.xml' },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/main.tsx', 'src/vite-env.d.ts', 'src/test/**', 'src/**/*.test.{ts,tsx}'],
      reporter: ['text', 'html', 'lcov', 'json-summary'],
      reportsDirectory: './coverage',
      // Critério automatizado de qualidade: abaixo disso o pipeline falha.
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
});
