#!/usr/bin/env bash
# Configuração do repositório no GitHub como código (requer GitHub CLI autenticado: `gh auth login`).
#
#   bash scripts/configurar-github.sh              # Pages, segurança e variáveis
#   bash scripts/configurar-github.sh --proteger   # + proteção das branches main e develop
#
# O que faz:
#   1. Ativa o GitHub Pages com origem "GitHub Actions".
#   2. Ativa Dependabot alerts/updates, Secret Scanning + Push Protection e reporte privado de vulnerabilidades.
#   3. Cria a variável APP_URL usada pelo workflow de monitoramento.
#   4. (--proteger) Exige PR e os checks do pipeline para mesclar em main e develop.
set -euo pipefail

REPO="$(gh repo view --json nameWithOwner --jq .nameWithOwner)"
OWNER="${REPO%%/*}"
NAME="${REPO##*/}"
APP_URL="https://${OWNER,,}.github.io/${NAME}/"

echo "▶ Repositório: $REPO"

echo "▶ GitHub Pages (origem: GitHub Actions)"
gh api -X POST "repos/$REPO/pages" -f build_type=workflow >/dev/null 2>&1 \
  || gh api -X PUT "repos/$REPO/pages" -f build_type=workflow >/dev/null

echo "▶ Recursos de segurança"
gh api -X PUT "repos/$REPO/vulnerability-alerts" >/dev/null
gh api -X PUT "repos/$REPO/automated-security-fixes" >/dev/null || true
gh api -X PUT "repos/$REPO/private-vulnerability-reporting" >/dev/null || true
gh api -X PATCH "repos/$REPO" --input - >/dev/null <<'JSON'
{
  "allow_squash_merge": true,
  "allow_merge_commit": true,
  "allow_rebase_merge": false,
  "security_and_analysis": {
    "secret_scanning": { "status": "enabled" },
    "secret_scanning_push_protection": { "status": "enabled" }
  }
}
JSON

echo "▶ Variável APP_URL = $APP_URL"
gh variable set APP_URL --repo "$REPO" --body "$APP_URL"

if [ "${1:-}" = "--proteger" ]; then
  echo "▶ Proteção das branches main e develop"
  for BRANCH in main develop; do
    gh api -X PUT "repos/$REPO/branches/$BRANCH/protection" --input - >/dev/null <<'JSON'
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "Qualidade (format, lint, typecheck)",
      "Testes e cobertura",
      "Segurança (dependências + secrets)",
      "Build e artefato",
      "Análise CodeQL (javascript-typescript)"
    ]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 0,
    "dismiss_stale_reviews": true
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": true
}
JSON
  done
fi

echo "✅ Configuração aplicada em https://github.com/$REPO"
