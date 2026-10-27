# Política de segurança

## Reportar uma vulnerabilidade

Não abra issue pública. Use **Security → Report a vulnerability** (Private vulnerability reporting) neste repositório.

## Controles automatizados

| Controle                    | Ferramenta                                                             | Onde                       |
| --------------------------- | ---------------------------------------------------------------------- | -------------------------- |
| SAST                        | CodeQL (`security-extended`) + ESLint `eslint-plugin-security`         | `codeql.yml`, `ci.yml`     |
| Dependências vulneráveis    | `npm audit`, Dependency Review, Dependabot                             | `ci.yml`, `dependabot.yml` |
| Integridade de pacotes      | `npm audit signatures` + `npm ci` com lockfile                         | `ci.yml`                   |
| Secret scanning             | Gitleaks (histórico completo) + GitHub Secret Scanning/Push Protection | `ci.yml`                   |
| Imagem de container         | Grype, usuário não-root, SBOM e proveniência                           | `docker.yml`               |
| Cadeia de suprimentos do CI | Actions fixadas por SHA, permissões mínimas, Dependabot para actions   | todos os workflows         |
