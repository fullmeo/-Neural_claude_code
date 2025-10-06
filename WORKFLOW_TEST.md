# 🧪 Test GitHub Actions Workflow

## Fichiers Ajoutés pour CI/CD

### 1. Configuration Files
- ✅ `package.json` - Dependencies et scripts npm
- ✅ `.eslintrc.json` - Configuration ESLint
- ✅ `.prettierrc.json` - Configuration Prettier
- ✅ `LICENSE` - MIT License

### 2. Workflows
- ✅ `.github/workflows/ci-cd-pipeline.yml` - Pipeline complet
- ✅ `.github/workflows/claude-code-integration.yml` - Claude Code automation
- ✅ `.github/workflows/test-workflow.yml` - Workflow de test basique

---

## 🚀 Tester le Workflow

### Option 1: Push et Auto-trigger

```bash
# Ajouter tous les nouveaux fichiers
git add package.json .eslintrc.json .prettierrc.json LICENSE .github/workflows/test-workflow.yml WORKFLOW_TEST.md

# Commit
git commit -m "ci: Add package.json, linting config, and test workflow"

# Push vers GitHub
git push origin main

# Le workflow se déclenche automatiquement!
```

**Vérifier:**
1. Aller sur: https://github.com/fullmeo/-Neural_claude_code/actions
2. Voir "Test Workflow" en cours d'exécution
3. Cliquer pour voir les logs

### Option 2: Déclencher Manuellement

1. Aller sur: https://github.com/fullmeo/-Neural_claude_code/actions
2. Cliquer sur "Test Workflow"
3. Bouton "Run workflow" (à droite)
4. Sélectionner branche: `main`
5. Cliquer "Run workflow"

---

## 📊 Workflows Disponibles

### 1. Test Workflow (Basique)
**Fichier:** `.github/workflows/test-workflow.yml`

**Ce qu'il fait:**
- ✅ Checkout du code
- ✅ Setup Node.js
- ✅ Liste tous les fichiers
- ✅ Vérifie les smart contracts
- ✅ Confirme que tout fonctionne

**Triggers:**
- Push sur `main` ou `develop`
- Pull Request vers `main`
- Manuel (workflow_dispatch)

### 2. CI/CD Pipeline (Complet)
**Fichier:** `.github/workflows/ci-cd-pipeline.yml`

**Jobs:**
1. **code-quality** - ESLint, Prettier
2. **smart-contract-tests** - Tests Hardhat
3. **frontend-tests** - Tests Jest
4. **security-audit** - npm audit, Snyk, Slither
5. **deploy-testnet** - Déploiement Base Sepolia
6. **deploy-frontend** - Déploiement Netlify
7. **deploy-mainnet** - Déploiement Base (manuel)
8. **notify** - Notifications Slack/Discord

**Secrets requis:**
- `ANTHROPIC_API_KEY`
- `TESTNET_PRIVATE_KEY`
- `BASE_SEPOLIA_RPC_URL`
- `BASESCAN_API_KEY`
- `NETLIFY_AUTH_TOKEN`
- `NETLIFY_SITE_ID`

### 3. Claude Code Integration
**Fichier:** `.github/workflows/claude-code-integration.yml`

**Workflows:**
1. **claude-code-review** - Review automatique des PRs
2. **claude-auto-fix** - Fix bugs avec `/claude fix`
3. **claude-contract-test** - Génération tests smart contracts
4. **claude-security-audit** - Audit sécurité complet
5. **claude-optimize** - Optimisation performance
6. **claude-docs-update** - Mise à jour documentation
7. **claude-refactor** - Refactoring code
8. **claude-validate-deployment** - Validation déploiement

---

## ✅ Vérifications Avant Full Pipeline

### 1. Test Workflow Passe
```bash
# Après push
# Aller sur: https://github.com/fullmeo/-Neural_claude_code/actions
# Vérifier que "Test Workflow" est ✅ vert
```

### 2. Secrets Configurés
```bash
# Vérifier sur GitHub:
# Settings > Secrets and variables > Actions
# Doit avoir au minimum:
- ANTHROPIC_API_KEY
- TESTNET_PRIVATE_KEY
- BASE_SEPOLIA_RPC_URL
- BASESCAN_API_KEY
```

### 3. Environments Créés
```bash
# Settings > Environments
# Doit avoir:
- testnet (branch: develop)
- production (branch: main, protected)
```

### 4. Actions Activées
```bash
# Settings > Actions > General
- ✅ Allow all actions and reusable workflows
- ✅ Read and write permissions
- ✅ Allow GitHub Actions to create PRs
```

---

## 🔧 Commandes Locales

### Installation
```bash
# Installer dependencies
npm install

# Installer dependencies contrats
cd contracts
npm install
cd ..
```

### Linting
```bash
# Check code quality
npm run lint

# Format code
npm run format

# Check formatting
npm run format:check
```

### Tests Locaux
```bash
# Test smart contracts
cd contracts
npx hardhat test
npx hardhat coverage

# Run local server
npm start
```

---

## 📈 Étapes Suivantes

### Phase 1: Test Workflow ✅
- [ ] Commit nouveaux fichiers
- [ ] Push vers GitHub
- [ ] Vérifier workflow passe
- [ ] Voir logs dans Actions

### Phase 2: Configurer Secrets
- [ ] ANTHROPIC_API_KEY
- [ ] TESTNET_PRIVATE_KEY
- [ ] BASE_SEPOLIA_RPC_URL
- [ ] BASESCAN_API_KEY

### Phase 3: Premier Déploiement
- [ ] Obtenir testnet ETH
- [ ] Push sur develop
- [ ] Voir déploiement automatique
- [ ] Vérifier contrats sur BaseScan

### Phase 4: Production
- [ ] Créer production environment
- [ ] Ajouter reviewers
- [ ] Merge vers main
- [ ] Déploiement production

---

## 🔗 Liens Utiles

**GitHub Actions:**
- Actions: https://github.com/fullmeo/-Neural_claude_code/actions
- Workflows: https://github.com/fullmeo/-Neural_claude_code/tree/main/.github/workflows
- Settings: https://github.com/fullmeo/-Neural_claude_code/settings

**Documentation:**
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)

---

## 🆘 Dépannage

### Workflow échoue sur "npm ci"
```bash
# Solution: Créer package-lock.json
npm install
git add package-lock.json
git commit -m "chore: Add package-lock.json"
git push
```

### Workflow échoue sur secrets manquants
```bash
# Solution: Ajouter secrets dans Settings
# Settings > Secrets and variables > Actions > New secret
```

### Workflow ne se déclenche pas
```bash
# Solution: Vérifier que Actions est activé
# Settings > Actions > General > Allow all actions
```

---

**Prochaine action: Commit et push pour déclencher le workflow de test!** 🚀

```bash
git add .
git commit -m "ci: Setup CI/CD configuration and test workflow"
git push origin main
```
