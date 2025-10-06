# 🔗 GitHub Workflow Examples - Claude CLI Integration

**Guide pratique pour déclencher workflows GitHub via Claude CLI**

---

## 📋 Workflows Disponibles

### 1. **ci-cd-pipeline.yml**
**Jobs:** 8 jobs (code quality, tests, security, deployment)
**Triggers:** push, pull_request, workflow_dispatch

### 2. **code-quality.yml**
**Jobs:** 9 jobs (ESLint, CodeQL, SonarCloud, Slither, security, complexity, AI review, performance, docs)
**Triggers:** push, pull_request, workflow_dispatch
**Modes:** full-scan, security-only, code-quality-only, performance-analysis

---

## 🚀 Déclencher avec Claude CLI

### Via npm Scripts (Recommandé)

```bash
# Review complète (checklist + workflow)
npm run claude:review
# → Exécute: node claude-cli.js review
# → Puis: gh workflow run code-quality.yml -f task=code-quality-only

# Security audit (local + workflow)
npm run claude:security
# → Exécute: node claude-cli.js security
# → Puis: gh workflow run code-quality.yml -f task=security-only
```

### Manuellement avec gh CLI

```bash
# Workflow code-quality avec mode spécifique
gh workflow run code-quality.yml -f task=full-scan
gh workflow run code-quality.yml -f task=security-only
gh workflow run code-quality.yml -f task=code-quality-only
gh workflow run code-quality.yml -f task=performance-analysis

# Workflow CI/CD pipeline
gh workflow run ci-cd-pipeline.yml
```

---

## 📊 Surveiller l'Exécution

### Commandes de Base

```bash
# Liste des workflows
gh workflow list

# Runs récents
gh run list

# Surveiller en temps réel
gh run watch

# Voir un run spécifique
gh run view <run-id>

# Logs d'un run
gh run view <run-id> --log

# Logs seulement des jobs échoués
gh run view <run-id> --log-failed
```

### Exemple Complet

```bash
# 1. Déclencher workflow
gh workflow run code-quality.yml -f task=full-scan

# 2. Récupérer le run ID (dernière ligne)
gh run list --limit 1

# 3. Surveiller en temps réel
gh run watch <run-id>

# 4. Si échec, voir les logs
gh run view <run-id> --log-failed
```

---

## 🎯 Cas d'Usage Pratiques

### Cas 1: Review avant Pull Request

```bash
# 1. Analyse locale
npm run claude:analyze

# 2. Fix automatique
npm run claude:fix

# 3. Tests
npm run claude:test

# 4. Review + GitHub workflow
npm run claude:review

# 5. Attendre résultats
gh run watch

# 6. Créer PR si tout est vert
gh pr create --title "feat: nouvelle fonctionnalité" --body "Description"
```

### Cas 2: Security Audit Complet

```bash
# 1. Audit local
npm run claude:security

# 2. Vérifier output
# - npm audit résultats
# - Recommandations Slither

# 3. Si OK, déclencher workflow complet
gh workflow run code-quality.yml -f task=security-only

# 4. Surveiller
gh run watch
```

### Cas 3: Debugging Workflow Échec

```bash
# 1. Lister les runs récents
gh run list --limit 5

# 2. Voir détails du run échoué
gh run view <run-id>

# 3. Voir logs des jobs échoués
gh run view <run-id> --log-failed

# 4. Fixer localement
npm run claude:fix

# 5. Re-tester
npm run claude:test

# 6. Re-déclencher workflow
gh workflow run code-quality.yml -f task=full-scan
```

### Cas 4: Déploiement Testnet

```bash
# 1. Vérifier status
npm run claude:status

# 2. Tests complets
npm run claude:test
npm run coverage

# 3. Security audit
npm run claude:security

# 4. Déclencher déploiement (si secrets configurés)
gh workflow run ci-cd-pipeline.yml

# 5. Surveiller déploiement
gh run watch

# 6. Vérifier artifacts
gh run view <run-id>
# → Voir "Artifacts" section pour deployment-output.txt
```

---

## 🔍 Workflows par Job

### code-quality.yml - Jobs Détaillés

#### Job 1: lint-javascript
```bash
# Déclenche seulement linting
# (pas de façon isolée, mais inclus dans code-quality-only)
gh workflow run code-quality.yml -f task=code-quality-only
```
**Fait:**
- ESLint avec reviewdog (annotations PR)
- Prettier check

#### Job 2: codeql-analysis
```bash
gh workflow run code-quality.yml -f task=security-only
```
**Fait:**
- CodeQL security scan
- Détection vulnérabilités JavaScript
- Upload SARIF results

#### Job 3: sonarcloud-scan
```bash
# Nécessite SONAR_TOKEN dans secrets
gh workflow run code-quality.yml -f task=code-quality-only
```
**Fait:**
- Tests avec coverage
- Upload vers SonarCloud
- Quality gate check

#### Job 4: solidity-security
```bash
gh workflow run code-quality.yml -f task=security-only
```
**Fait:**
- Installation Slither
- Analyse smart contracts
- Upload rapport (artifact)
- Comment PR avec résultats

#### Job 5: dependency-security
```bash
gh workflow run code-quality.yml -f task=security-only
```
**Fait:**
- npm audit
- Snyk scan (si SNYK_TOKEN configuré)
- Upload SARIF results

#### Job 6: complexity-analysis
```bash
gh workflow run code-quality.yml -f task=code-quality-only
```
**Fait:**
- Analyse complexité (complexity-report)
- Check duplication (jscpd)
- Upload rapports (artifacts)

#### Job 7: ai-code-review
```bash
# Automatique sur PR
# Ou manuellement:
gh workflow run code-quality.yml -f task=code-quality-only
```
**Fait:**
- Détecte fichiers modifiés
- Génère checklist review
- Poste comment sur PR

#### Job 8: performance-analysis
```bash
gh workflow run code-quality.yml -f task=performance-analysis
```
**Fait:**
- Benchmark gas smart contracts
- Analyse bundle size
- Upload rapports

#### Job 9: documentation-check
```bash
gh workflow run code-quality.yml -f task=code-quality-only
```
**Fait:**
- Vérifie README.md
- Check NatSpec dans .sol
- Liste TODOs/FIXME

---

## 🎨 Combinaisons Recommandées

### Workflow Quotidien

```bash
# Matin: Status
npm run claude:status

# Développement: Auto-fix continu
npm run claude:fix

# Avant commit: Review
npm run claude:review && gh run watch
```

### Avant Merge PR

```bash
# 1. Full scan local
npm run claude:analyze

# 2. Tests complets
npm run claude:test
npm run coverage

# 3. Security
npm run claude:security

# 4. Workflow GitHub complet
gh workflow run code-quality.yml -f task=full-scan

# 5. Attendre tous les jobs
gh run watch

# 6. Merger si tout vert
gh pr merge --auto --squash
```

### Release Process

```bash
# 1. Vérifier tout est vert
gh run list --limit 5

# 2. Tests + security
npm run claude:test
npm run claude:security

# 3. Workflow CI/CD
gh workflow run ci-cd-pipeline.yml

# 4. Surveiller déploiement
gh run watch

# 5. Tag release (si mainnet)
git tag v1.0.0
git push origin v1.0.0
```

---

## 🔧 Configuration GitHub CLI

### Installation

```bash
# Windows
winget install GitHub.cli

# Mac
brew install gh

# Linux
sudo apt install gh
```

### Authentification

```bash
# Login interactif
gh auth login

# Ou avec token
gh auth login --with-token < token.txt

# Vérifier status
gh auth status
```

### Configuration

```bash
# Set default editor
gh config set editor "code --wait"

# Set default repo
gh repo set-default

# View config
gh config list
```

---

## 📚 Secrets Requis

### Pour CI/CD Pipeline

```bash
# Configurer dans GitHub Settings > Secrets

# Smart Contracts
TESTNET_PRIVATE_KEY=0x...
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASESCAN_API_KEY=your_api_key

# Frontend Deployment
NETLIFY_AUTH_TOKEN=your_token
NETLIFY_SITE_ID=your_site_id

# Notifications (optionnel)
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
DISCORD_WEBHOOK=https://discord.com/api/webhooks/...
```

### Pour Code Quality

```bash
# SonarCloud (optionnel)
SONAR_TOKEN=your_token

# Snyk (optionnel)
SNYK_TOKEN=your_token

# GitHub token (automatique)
GITHUB_TOKEN=${{ secrets.GITHUB_TOKEN }}
```

---

## 🎯 Troubleshooting

### Erreur: "gh: command not found"

```bash
# Installer GitHub CLI
# Voir section "Configuration GitHub CLI"
```

### Erreur: "workflow not found"

```bash
# Vérifier workflows disponibles
gh workflow list

# Vérifier nom exact
gh workflow view code-quality.yml
```

### Erreur: "403 Resource not accessible by integration"

```bash
# Vérifier permissions GitHub Actions
# Settings > Actions > General > Workflow permissions
# → Cocher "Read and write permissions"
```

### Workflow bloqué en "pending"

```bash
# Vérifier limites de concurrence
# .github/workflows/*.yml

# Annuler run bloqué
gh run cancel <run-id>
```

### Secrets manquants

```bash
# Vérifier secrets configurés (noms seulement)
gh secret list

# Ajouter secret manquant
gh secret set SECRET_NAME

# Ou via interface
# GitHub > Settings > Secrets and variables > Actions > New secret
```

---

## 🚦 Status Codes

### Exit Codes

```bash
# Workflow success
echo $?  # 0

# Workflow failure
echo $?  # 1

# Workflow cancelled
echo $?  # 130
```

### Check Status

```bash
# Vérifier si workflow a réussi
if gh run view <run-id> | grep -q "completed successfully"; then
  echo "Success!"
else
  echo "Failed!"
fi
```

---

## 📈 Best Practices

1. **Toujours surveiller après déclenchement**
   ```bash
   gh workflow run code-quality.yml -f task=full-scan && gh run watch
   ```

2. **Vérifier secrets avant déploiement**
   ```bash
   gh secret list
   ```

3. **Tester localement d'abord**
   ```bash
   npm run claude:test
   npm run claude:fix
   # Puis workflow
   ```

4. **Utiliser les bons modes de scan**
   - `full-scan`: Avant merge PR
   - `security-only`: Après updates dépendances
   - `code-quality-only`: Pendant développement
   - `performance-analysis`: Avant release

5. **Documenter les runs importants**
   ```bash
   gh run view <run-id> > deployment-log.txt
   ```

---

## 🔗 Liens Utiles

- **GitHub CLI Docs:** https://cli.github.com/manual/
- **Workflow Syntax:** https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions
- **gh run commands:** https://cli.github.com/manual/gh_run

---

**Status:** ![Production Ready](https://img.shields.io/badge/Status-Production%20Ready-success)

*Master GitHub Workflows avec Claude CLI* 🚀✨
