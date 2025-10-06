# 🚀 Quick Start - Claude CLI

**Installation en 2 minutes** ⚡

---

## 📦 Installation

```bash
# 1. Cloner le repo (si pas déjà fait)
git clone https://github.com/fullmeo/-Neural_claude_code.git
cd Neural_claude_code

# 2. Installer dépendances
npm install

# 3. Test le CLI
node claude-cli.js --help
```

---

## 🎯 Utilisation Rapide

### Mode Interactif (Recommandé)

```bash
# Lancer le menu
node claude-cli.js

# Ou avec npm
npm run claude
```

**Interface:**
```
╔═══════════════════════════════════════════════════════════════════════╗
║     🤖 CLAUDE CLI - DJ Cloudio Development Assistant 🎛️✨          ║
╚═══════════════════════════════════════════════════════════════════════╝

✨ Available Actions
────────────────────────────────────────────────────────────────

  1. 🔍 Analyze Project
  2. 🧪 Run Tests
  3. 🎯 Test Coverage
  4. 🔒 Security Audit
  5. 🔧 Auto-Fix Issues
  6. 🚀 Deploy Contracts
  7. 📚 Generate Documentation
  8. ℹ️ Project Status
  9. 👀 Code Review
  10. ⚡ Performance Optimization

  0. ✗ Exit

Select action (0-10):
```

### Commandes Rapides

```bash
# Analyse projet
node claude-cli.js analyze

# Statut
node claude-cli.js status

# Tests
node claude-cli.js test

# Auto-fix code
node claude-cli.js fix

# Security audit
node claude-cli.js security

# Review checklist
node claude-cli.js review
```

---

## 🔥 Top 5 Commandes

### 1️⃣ Analyse complète
```bash
npm run claude:analyze
```
**Fait:** Scan complet du projet + qualité + tests + coverage

### 2️⃣ Auto-fix
```bash
npm run claude:fix
```
**Fait:** ESLint --fix + Prettier sur tout le code

### 3️⃣ Tests
```bash
npm run claude:test
```
**Fait:** Exécute les 81 tests smart contracts

### 4️⃣ Review + GitHub
```bash
npm run claude:review
```
**Fait:** Checklist locale + déclenche workflow GitHub

### 5️⃣ Status
```bash
npm run claude:status
```
**Fait:** Dashboard santé du projet

---

## 🎨 Alias npm Disponibles

```bash
npm run claude              # Mode interactif
npm run claude:analyze      # Analyse
npm run claude:test         # Tests
npm run claude:coverage     # Coverage
npm run claude:fix          # Auto-fix
npm run claude:review       # Review + GitHub
npm run claude:security     # Security + GitHub
npm run claude:optimize     # Performance
npm run claude:docs         # Documentation
npm run claude:status       # Status
```

---

## 🔗 Intégration GitHub

### Prérequis

```bash
# Installer GitHub CLI
# Windows:
winget install GitHub.cli

# Mac:
brew install gh

# Linux:
sudo apt install gh

# Authentifier
gh auth login
```

### Déclencher workflows

```bash
# Review complète
npm run claude:review
# → Exécute checklist + gh workflow run code-quality.yml

# Security audit
npm run claude:security
# → npm audit + gh workflow run security

# Ou manuellement
gh workflow run code-quality.yml -f task=full-scan
gh run watch
```

---

## 💡 Exemples

### Avant un commit

```bash
# 1. Fix automatique
npm run claude:fix

# 2. Tests
npm run claude:test

# 3. Review
npm run claude:review

# 4. Commit
git add .
git commit -m "feat: nouvelle fonctionnalité"
```

### Debugging

```bash
# 1. Status
npm run claude:status

# 2. Analyse
npm run claude:analyze

# 3. Si erreurs
npm run claude:fix
```

### Avant déploiement

```bash
# 1. Tests + coverage
npm run claude:test
npm run coverage

# 2. Security
npm run claude:security

# 3. Optimization
npm run claude:optimize

# 4. Deploy
npm run deploy:testnet
```

---

## 📚 Documentation Complète

Voir **[CLAUDE_CLI_README.md](./CLAUDE_CLI_README.md)** pour:
- Guide complet de toutes les actions
- Configuration avancée
- Personnalisation
- Troubleshooting
- Intégration GitHub workflows

---

## 🆘 Aide Rapide

```bash
# Aide
node claude-cli.js --help

# Version
node claude-cli.js --version

# Interactive
node claude-cli.js
```

---

## ✅ Checklist Installation

- [ ] `git clone` effectué
- [ ] `npm install` exécuté
- [ ] CLI testé avec `node claude-cli.js --help`
- [ ] GitHub CLI installé (`gh --version`)
- [ ] Authentifié GitHub (`gh auth login`)
- [ ] Test d'une action: `npm run claude:status`

---

**Status:** ![Ready](https://img.shields.io/badge/Status-Ready-success) 🤖✨

*C'est parti !* 🚀
