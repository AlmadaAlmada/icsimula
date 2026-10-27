#!/usr/bin/env node
/**
 * Health check / smoke test da aplicação publicada.
 *
 * Uso:  node scripts/smoke-test.mjs <url> [--expect-commit <sha>] [--retries 3] [--delay 10]
 *
 * Verificações:
 *   1. A página inicial responde HTTP 200 dentro do tempo limite.
 *   2. O HTML contém o conteúdo esperado (título "SimulaFácil" e o container #root).
 *   3. O bundle JavaScript referenciado no HTML está acessível.
 *   4. /version.json responde com status "ok" (e, opcionalmente, o commit esperado).
 *
 * Usado em dois momentos:
 *   - logo após o deploy (pipeline CI/CD) → garante que a versão nova subiu;
 *   - periodicamente (workflow de monitoramento) → garante que continua no ar.
 *
 * Saída: código 0 = disponível; código 1 = indisponível/degradada.
 * Quando roda no GitHub Actions, grava um resumo em $GITHUB_STEP_SUMMARY e o resultado em $GITHUB_OUTPUT.
 */
import { appendFileSync } from 'node:fs';

const args = process.argv.slice(2);
const baseUrl = (args.find((a) => !a.startsWith('--')) ?? process.env.APP_URL ?? '').replace(/\/?$/, '/');
const option = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? args[index + 1] : fallback;
};
const retries = Number(option('retries', '3'));
const delaySeconds = Number(option('delay', '10'));
const expectCommit = option('expect-commit', '');
const TIMEOUT_MS = 15_000;

if (!/^https?:\/\//.test(baseUrl)) {
  console.error('Informe a URL da aplicação: node scripts/smoke-test.mjs https://usuario.github.io/repo/');
  process.exit(2);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function timedFetch(url) {
  const started = performance.now();
  const response = await fetch(url, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { 'cache-control': 'no-cache', 'user-agent': 'icsimula-healthcheck' },
  });
  const body = await response.text();
  return { status: response.status, body, ms: Math.round(performance.now() - started) };
}

async function runChecks() {
  const checks = [];
  const check = (name, ok, detail) => checks.push({ name, ok, detail });

  const home = await timedFetch(`${baseUrl}?healthcheck=${Date.now()}`);
  check('HTTP 200 na página inicial', home.status === 200, `status ${home.status} em ${home.ms} ms`);
  check(
    'Conteúdo esperado no HTML',
    home.body.includes('SimulaFácil') && home.body.includes('id="root"'),
    'título + #root',
  );

  const script = home.body.match(/<script[^>]+src="([^"]+\.js)"/)?.[1];
  if (script) {
    const asset = await timedFetch(new URL(script, baseUrl).toString());
    check(
      'Bundle JavaScript acessível',
      asset.status === 200 && asset.body.length > 1000,
      `${script} → ${asset.status}`,
    );
  } else {
    check('Bundle JavaScript acessível', false, 'nenhum <script src> encontrado');
  }

  let version = null;
  try {
    const res = await timedFetch(`${baseUrl}version.json?t=${Date.now()}`);
    version = JSON.parse(res.body);
    check(
      'version.json com status ok',
      res.status === 200 && version.status === 'ok',
      `v${version.version} (${version.commit})`,
    );
  } catch (error) {
    check('version.json com status ok', false, String(error));
  }

  if (expectCommit) {
    const short = expectCommit.slice(0, 7);
    check(
      'Commit publicado = commit do pipeline',
      version?.commit === short,
      `esperado ${short}, publicado ${version?.commit}`,
    );
  }

  return { checks, version, responseMs: home.ms };
}

let result;
let lastError;
for (let attempt = 1; attempt <= retries; attempt++) {
  try {
    result = await runChecks();
    if (result.checks.every((c) => c.ok)) break;
    lastError = result.checks
      .filter((c) => !c.ok)
      .map((c) => c.name)
      .join(', ');
  } catch (error) {
    lastError = error instanceof Error ? error.message : String(error);
    result = { checks: [{ name: 'Requisição HTTP', ok: false, detail: lastError }], version: null, responseMs: null };
  }
  console.warn(`Tentativa ${attempt}/${retries} falhou: ${lastError}`);
  if (attempt < retries) await sleep(delaySeconds * 1000);
}

const healthy = result.checks.every((c) => c.ok);
const lines = [
  `## ${healthy ? '✅ Aplicação disponível' : '❌ Aplicação indisponível'}`,
  '',
  `- URL: ${baseUrl}`,
  `- Verificado em: ${new Date().toISOString()}`,
  result.responseMs !== null ? `- Tempo de resposta: ${result.responseMs} ms` : '',
  result.version ? `- Versão publicada: v${result.version.version} · commit ${result.version.commit}` : '',
  '',
  '| Verificação | Resultado | Detalhe |',
  '|---|---|---|',
  ...result.checks.map((c) => `| ${c.name} | ${c.ok ? '✅' : '❌'} | ${c.detail} |`),
].filter((line, i, all) => line !== '' || all[i - 1] !== '');

console.log(lines.join('\n'));
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${lines.join('\n')}\n`);
if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `healthy=${healthy}\nreport<<EOF\n${lines.join('\n')}\nEOF\n`);
}

process.exit(healthy ? 0 : 1);
