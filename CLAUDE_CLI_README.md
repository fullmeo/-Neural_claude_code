# 🤖 Claude CLI - DJ Cloudio Development Assistant

**Version:** 1.0.0
**Status:** ![Production Ready](https://img.shields.io/badge/Status-Production%20Ready-success)

Un assistant de développement local simulant Claude Code avec interface interactive et glyphes.

---

## ✨ Fonctionnalités

### 🎨 Interface avec Glyphes
- Bannière stylisée avec couleurs ANSI
- Icônes pour chaque type d'action
- Messages colorés (succès ✅, erreur ❌, warning ⚠️, info ℹ️)
- Menu interactif avec numérotation

### 🧠 Analyse Intelligente
- Lecture automatique de `.claude/CLAUDE.md`
- Parsing de la configuration du projet
- Analyse multi-dimensionnelle du codebase
- Statistiques de fichiers et tests

### 🔧 Actions Disponibles

| Action | Commande | Description | Glyph |
|--------|----------|-------------|-------|
| **Analyze** | `claude analyze` | Analyse complète du projet | 🔍 |
| **Test** | `claude test` | Exécute les tests Hardhat | 🧪 |
| **Coverage** | `claude coverage` | Génère rapport de couverture | 🎯 |
| **Security** | `claude security` | Audit de sécurité (npm audit + Slither) | 🔒 |
| **Fix** | `claude fix` | Auto-fix ESLint + Prettier | 🔧 |
| **Deploy** | `claude deploy` | Déploiement testnet | 🚀 |
| **Docs** | `claude docs` | Génération documentation | 📚 |
| **Status** | `claude status` | Dashboard santé projet | ℹ️ |
| **Review** | `claude review` | Checklist code review | 👀 |
| **Optimize** | `claude optimize` | Analyse performance | ⚡ |

---

## 🚀 Installation

### 1. Installation locale

```bash
# Dans le répertoire du projet
npm install

# Rendre le script exécutable (Linux/Mac)
chmod +x claude-cli.js
```

### 2. Installation globale (optionnel)

```bash
# Installer globalement
npm link

# Maintenant "claude" est disponible partout
claude --help
```

### 3. Alias npm (déjà configurés)

Tous les alias sont déjà dans `package.json`:

```bash
npm run claude              # Mode interactif
npm run claude:analyze      # Analyse projet
npm run claude:test         # Tests
npm run claude:fix          # Auto-fix
npm run claude:review       # Review + GitHub workflow
npm run claude:security     # Security audit + workflow
npm run claude:optimize     # Performance analysis
npm run claude:docs         # Documentation check
npm run claude:status       # Project dashboard
```

---

## 📖 Utilisation

### Mode Interactif

```bash
# Lancer le menu interactif
node claude-cli.js

# Ou avec npm
npm run claude

# Ou si installé globalement
claude
```

**Interface:**
```
╔═══════════════════════════════════════════════════════════════════════╗
║     🤖 CLAUDE CLI - DJ Cloudio Development Assistant 🎛️✨          ║
╚═══════════════════════════════════════════════════════════════════════╝

ℹ️ Project: DJ Cloudio
ℹ️ Root: /path/to/project

✨ Available Actions
────────────────────────────────────────────────────────────────

  1. 🔍 Analyze Project
     Comprehensive multi-dimensional code analysis

  2. 🧪 Run Tests
     Execute test suite with coverage

  3. 🎯 Test Coverage
     Generate coverage report

  4. 🔒 Security Audit
     Run security analysis on smart contracts

  5. 🔧 Auto-Fix Issues
     Automatically fix linting issues

  6. 🚀 Deploy Contracts
     Deploy smart contracts to testnet

  7. 📚 Generate Documentation
     Generate API documentation

  8. ℹ️ Project Status
     Show project health dashboard

  9. 👀 Code Review
     AI-assisted code review checklist

  10. ⚡ Performance Optimization
      Analyze and optimize performance

  0. ✗ Exit

Select action (0-10):
```

### Mode Ligne de Commande

```bash
# Analyse complète
node claude-cli.js analyze

# Tests avec couverture
node claude-cli.js test

# Auto-fix linting
node claude-cli.js fix

# Security audit
node claude-cli.js security

# Aide
node claude-cli.js --help
```

---

## 🎯 Actions Détaillées

### 1. 🔍 Analyze Project

**Commande:** `claude analyze`

**Ce qu'elle fait:**
- Compte les fichiers par type (.js, .sol, .html, .md)
- Vérifie le statut Git
- Analyse la qualité du code avec ESLint
- Exécute les tests smart contracts
- Génère rapport de couverture
- Fournit recommandations

**Exemple de sortie:**
```
🔍 Project Analysis
────────────────────────────────────────────────────────────────

ℹ️ JavaScript files: 13
ℹ️ Solidity contracts: 2
ℹ️ HTML files: 1
ℹ️ Documentation files: 8
ℹ️ Test files: 2
ℹ️ Directories: 12
ℹ️ Git status: clean

🎯 Code Quality Analysis
────────────────────────────────────────────────────────────────

  🔍 Running ESLint...
✅ ESLint: No issues found

  🧪 Running smart contract tests...
✅ Tests: 81 passing, 0 failing

  🎯 Checking test coverage...
✅ Coverage: 100% (excellent)
```

### 2. 🧪 Run Tests

**Commande:** `claude test`

**Ce qu'elle fait:**
- Navigate vers `contracts/`
- Exécute `npx hardhat test`
- Affiche résultats complets
- Indique succès/échec

### 3. 🎯 Test Coverage

**Commande:** `claude coverage`

**Ce qu'elle fait:**
- Génère rapport de couverture avec Hardhat
- Affiche métriques (statements, branches, functions, lines)
- Identifie code non testé

### 4. 🔒 Security Audit

**Commande:** `claude security`

**Ce qu'elle fait:**
- Exécute `npm audit` pour dépendances
- Suggère installation de Slither pour analyse smart contracts
- Liste vulnérabilités trouvées
- Fournit recommandations de fix

**Intégration GitHub:**
```bash
# Lance aussi le workflow de sécurité
npm run claude:security
# → Exécute npm audit + gh workflow run code-quality.yml -f task=security-only
```

### 5. 🔧 Auto-Fix Issues

**Commande:** `claude fix`

**Ce qu'elle fait:**
- Exécute `eslint --fix` sur tous les fichiers
- Applique Prettier pour formater le code
- Corrige automatiquement les problèmes simples
- Affiche problèmes nécessitant intervention manuelle

**Exemple:**
```bash
npm run claude:fix

🔧 Auto-Fix
────────────────────────────────────────────────────────────────

  ✨ Running ESLint with --fix...
✅ Linting issues fixed

  ✨ Running Prettier...
✅ Code formatted
```

### 6. 🚀 Deploy Contracts

**Commande:** `claude deploy`

**Ce qu'elle fait:**
- Compile les smart contracts
- Vérifie configuration `.env`
- Fournit instructions de déploiement
- Liste secrets requis

**Secrets requis:**
```
TESTNET_PRIVATE_KEY=your_key
BASE_SEPOLIA_RPC_URL=your_rpc_url
BASESCAN_API_KEY=your_api_key
```

### 7. 📚 Generate Documentation

**Commande:** `claude docs`

**Ce qu'elle fait:**
- Liste tous les fichiers de documentation
- Vérifie présence de README, guides, etc.
- Suggère génération JSDoc
- Identifie documentation manquante

### 8. ℹ️ Project Status

**Commande:** `claude status`

**Dashboard complet:**
- Nombre de tests
- Documentation coverage
- Statut Git
- Health metrics
- Recommandations

### 9. 👀 Code Review

**Commande:** `claude review`

**Checklist automatique:**
- ✓ Code suit style guidelines
- ✓ Pas de console.log en production
- ✓ Error handling implémenté
- ✓ Tests ajoutés
- ✓ Documentation à jour
- ✓ Pas de vulnérabilités
- ✓ Gas optimisé (smart contracts)

**Intégration GitHub:**
```bash
npm run claude:review
# → Exécute checklist + gh workflow run code-quality.yml -f task=code-quality-only
```

### 10. ⚡ Performance Optimization

**Commande:** `claude optimize`

**Analyses:**
- Taille des bundles JavaScript
- Fichiers les plus volumineux
- Recommandations d'optimisation
- Suggestions de minification/lazy loading

---

## 🔗 Intégration GitHub Workflows

Le CLI s'intègre avec les workflows GitHub via `gh` CLI:

### claude review → Workflow code-quality

```bash
npm run claude:review
# 1. Exécute checklist locale
# 2. Déclenche: gh workflow run code-quality.yml -f task=code-quality-only
# 3. GitHub exécute: ESLint + Prettier + CodeQL + Slither
```

### claude security → Workflow security-only

```bash
npm run claude:security
# 1. Exécute npm audit local
# 2. Déclenche: gh workflow run code-quality.yml -f task=security-only
# 3. GitHub exécute: npm audit + Snyk + Slither + CodeQL
```

### Workflows disponibles

**Fichier:** `.github/workflows/code-quality.yml`

**Modes d'exécution:**
- `full-scan` - Analyse complète (tous les jobs)
- `security-only` - Seulement audits sécurité
- `code-quality-only` - Seulement qualité code
- `performance-analysis` - Seulement performance

**Déclencher manuellement:**
```bash
gh workflow run code-quality.yml -f task=full-scan
gh workflow run code-quality.yml -f task=security-only
gh workflow run code-quality.yml -f task=code-quality-only
gh workflow run code-quality.yml -f task=performance-analysis
```

**Surveiller l'exécution:**
```bash
gh run watch
gh run list
gh run view <run-id>
```

---

## 📋 Configuration .claude/CLAUDE.md

Le CLI lit automatiquement `.claude/CLAUDE.md` et parse:

### Sections détectées:
- **Project Overview** → Nom du projet
- **Core Technologies** → Liste des technologies
- **Key Modules** → Modules avec fichiers
- **Quick Commands** → Commandes bash extraites

### Exemple de parsing:

**Fichier `.claude/CLAUDE.md`:**
```markdown
# CLAUDE.md - DJ Cloudio Project Instructions

## Core Technologies

- **Frontend**: Web Audio API, HTML5
- **Blockchain**: Solidity 0.8.20, Hardhat

### Key Modules

### 1. Neural AI Autopilot (`neural-ai-autopilot.js`)
### 2. Transitions (`neural-ai-transitions.js`)

## Quick Commands

bash
npm test
npm run lint
```

**Parsing:**
```javascript
{
  projectName: 'DJ Cloudio',
  technologies: ['Frontend', 'Blockchain'],
  modules: [
    { name: 'Neural AI Autopilot', file: 'neural-ai-autopilot.js' },
    { name: 'Transitions', file: 'neural-ai-transitions.js' }
  ],
  quickCommands: ['npm test', 'npm run lint']
}
```

---

## 🎨 Personnalisation

### Ajouter une nouvelle action

**Fichier:** `claude-cli.js`

```javascript
const ACTIONS = {
  // ... actions existantes

  myaction: {
    name: 'My Custom Action',
    icon: GLYPHS.magic,
    description: 'Does something amazing',
    async execute(projectRoot, config) {
      printSection('My Action', GLYPHS.magic);

      // Votre logique ici
      printAction('Doing something...', GLYPHS.lightning);

      // Exécuter commande
      try {
        execSync('your-command', { cwd: projectRoot, stdio: 'inherit' });
        printSuccess('Action completed!');
      } catch (error) {
        printError('Action failed');
      }
    }
  }
};
```

### Ajouter de nouveaux glyphes

```javascript
const GLYPHS = {
  // ... glyphes existants
  myicon: '🎉',
  another: '🌟'
};
```

---

## 🔧 Dépannage

### Erreur: "Cannot find module"

```bash
npm install
```

### Erreur: "Permission denied"

```bash
# Linux/Mac
chmod +x claude-cli.js

# Windows: Exécuter avec node
node claude-cli.js
```

### ESLint/Prettier non trouvés

```bash
npm install -D eslint prettier
```

### Hardhat non trouvé

```bash
cd contracts
npm install
```

### GitHub CLI non disponible

```bash
# Installer gh CLI
# Linux: sudo apt install gh
# Mac: brew install gh
# Windows: winget install GitHub.cli

# Authentifier
gh auth login
```

---

## 📚 Exemples d'Utilisation

### Workflow de développement quotidien

```bash
# 1. Vérifier statut du projet
npm run claude:status

# 2. Analyser le code
npm run claude:analyze

# 3. Corriger problèmes automatiques
npm run claude:fix

# 4. Exécuter tests
npm run claude:test

# 5. Review avant commit
npm run claude:review
```

### Avant un déploiement

```bash
# 1. Tests complets
npm run claude:test

# 2. Security audit
npm run claude:security

# 3. Vérifier couverture
npm run coverage

# 4. Optimisation
npm run claude:optimize

# 5. Documentation
npm run claude:docs

# 6. Déploiement
npm run deploy:testnet
```

### Debugging workflow GitHub

```bash
# 1. Review locale
npm run claude:review

# 2. Vérifier workflow
gh workflow list

# 3. Déclencher manuellement
gh workflow run code-quality.yml -f task=full-scan

# 4. Surveiller
gh run watch

# 5. Voir logs si échec
gh run view --log-failed
```

---

## 🌟 Fonctionnalités Avancées

### Mode Verbose

Modifiez `claude-cli.js` pour ajouter logs détaillés:

```javascript
const VERBOSE = process.env.VERBOSE === 'true';

if (VERBOSE) {
  console.log('Detailed logging enabled');
}
```

**Utilisation:**
```bash
VERBOSE=true node claude-cli.js analyze
```

### Mode CI/CD

Désactiver couleurs et interactivité pour CI:

```bash
CI=true node claude-cli.js analyze
```

### Export de rapports

Rediriger sortie vers fichier:

```bash
node claude-cli.js analyze > analysis-report.txt
node claude-cli.js status > status-report.txt
```

---

## 🤝 Contribution

Pour améliorer le CLI:

1. Fork le repository
2. Modifier `claude-cli.js`
3. Tester avec `node claude-cli.js`
4. Créer PR avec description des changements

---

## 📄 License

MIT License - Voir [LICENSE](./LICENSE)

---

## 🎉 Crédits

Développé avec ❤️ pour le projet DJ Cloudio

**Powered by:**
- Node.js
- ANSI Colors
- Claude AI (inspiration)

---

**Status:** ![Production Ready](https://img.shields.io/badge/Status-Production%20Ready-success) 🤖✨

*Un assistant de développement qui comprend votre projet.* 🎛️🔮
