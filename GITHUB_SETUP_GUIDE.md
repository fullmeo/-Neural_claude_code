# 🚀 Guide de Configuration GitHub - DJ Cloudio

## Étape 1: Créer le Repository GitHub

### Option A: Via l'Interface GitHub

1. **Aller sur GitHub**: https://github.com/new
2. **Remplir les informations:**
   - Repository name: `Neural_claude_code`
   - Description: `🎛️ DJ Cloudio - AI-Powered Prophetic DJ with Web3 Integration`
   - Visibility: **Public** (ou Private selon préférence)
   - ❌ Ne pas initialiser avec README (on a déjà les fichiers)
   - ❌ Ne pas ajouter .gitignore (déjà présent)
   - ❌ Ne pas ajouter license (déjà présent si existant)
3. **Cliquer "Create repository"**

### Option B: Via GitHub CLI

```bash
# Installer GitHub CLI (si pas déjà fait)
# Windows (winget):
winget install --id GitHub.cli

# Ou télécharger: https://cli.github.com/

# Authentification
gh auth login

# Créer le repository
gh repo create Neural_claude_code --public --description "🎛️ DJ Cloudio - AI-Powered Prophetic DJ with Web3 Integration"
```

---

## Étape 2: Initialiser Git Local (si pas déjà fait)

```bash
# Naviguer vers le projet
cd C:\Users\diase\OneDrive\Bureau\Neural_claude_code

# Vérifier si Git est déjà initialisé
git status

# Si pas initialisé, faire:
git init

# Configurer votre identité (si première fois)
git config user.name "fullmeo"
git config user.email "votre-email@example.com"
```

---

## Étape 3: Créer .gitignore

```bash
# Créer .gitignore pour éviter de commit des fichiers sensibles
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
package-lock.json

# Environment variables
.env
.env.local
.env.production
*.env

# Build outputs
dist/
build/
*.log

# Contract artifacts
contracts/artifacts/
contracts/cache/
contracts/deployments/
contracts/coverage/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db
desktop.ini

# Private keys (IMPORTANT!)
*.pem
*.key
*.p12
private-key.txt

# Hardhat
coverage/
coverage.json
typechain/
typechain-types/

# Testing
.nyc_output/

# Temporary
*.tmp
*.temp
EOF
```

---

## Étape 4: Préparer les Fichiers

```bash
# Vérifier les fichiers présents
ls -la

# Vous devriez avoir:
# - neuralmix_enhanced_fixed.html
# - neural-*.js (tous les modules)
# - contracts/ (contrats Solidity)
# - .github/workflows/ (pipelines CI/CD)
# - *.md (documentation)
```

---

## Étape 5: Premier Commit et Push

```bash
# Ajouter tous les fichiers
git add .

# Vérifier ce qui sera commité
git status

# Premier commit
git commit -m "🎉 Initial commit: DJ Cloudio v1.0

Features:
- 🎛️ Neural AI Autopilot with 10 advanced transitions
- 🔮 Prophetic playlist system with Tarot integration
- 📖 Narrative engine with 5 epic story arcs
- 🗳️ Web3 DAO ritual voting
- 🎨 NFT session minting
- ⛓️ Smart contracts (RitualDAO, PropheticSessionNFT)
- 🚀 CI/CD pipeline with Claude Code integration
- 📚 Complete documentation

Tech Stack:
- Web Audio API
- Solidity 0.8.20
- Hardhat
- Web3.js
- Base (L2)
- GitHub Actions
- Claude Code AI"

# Ajouter le remote (remplacer par votre URL)
git remote add origin https://github.com/fullmeo/Neural_claude_code.git

# Vérifier le remote
git remote -v

# Push vers GitHub
git push -u origin main

# Si erreur "main n'existe pas", créer la branche:
git branch -M main
git push -u origin main
```

---

## Étape 6: Créer la Branche Develop

```bash
# Créer branche develop
git checkout -b develop

# Push vers GitHub
git push -u origin develop

# Revenir sur main
git checkout main
```

---

## Étape 7: Configurer les Branch Protection Rules

### Via GitHub UI:

1. Aller sur le repository: `https://github.com/fullmeo/Neural_claude_code`
2. **Settings** > **Branches**
3. **Add branch protection rule**
4. **Branch name pattern:** `main`
5. Cocher:
   - ✅ **Require a pull request before merging**
     - Require approvals: **2**
     - Dismiss stale PR approvals when new commits are pushed
   - ✅ **Require status checks to pass before merging**
     - Require branches to be up to date
     - Status checks:
       - `code-quality`
       - `smart-contract-tests`
       - `frontend-tests`
       - `security-audit`
   - ✅ **Require conversation resolution before merging**
   - ✅ **Require signed commits** (optionnel mais recommandé)
   - ✅ **Include administrators**
6. **Create**

Répéter pour `develop` avec règles moins strictes (1 approval).

---

## Étape 8: Configurer les Secrets GitHub

### Secrets Essentiels:

```bash
# Via GitHub CLI
gh secret set ANTHROPIC_API_KEY
# Coller votre clé API Claude Code: sk-ant-...

gh secret set TESTNET_PRIVATE_KEY
# Coller la clé privée de: 0x074059A50bBB09e74CacfDc73376Da4931eB8f3B

gh secret set BASE_SEPOLIA_RPC_URL
# Exemple: https://sepolia.base.org
# Ou Alchemy: https://base-sepolia.g.alchemy.com/v2/YOUR_KEY

gh secret set BASESCAN_API_KEY
# Obtenir sur: https://basescan.org/myapikey

gh secret set NETLIFY_AUTH_TOKEN
# Dashboard Netlify > User Settings > Applications > New Access Token

gh secret set NETLIFY_SITE_ID
# Dashboard Netlify > Site Settings > General > Site ID
```

### Via GitHub UI:

1. **Settings** > **Secrets and variables** > **Actions**
2. **New repository secret**
3. Ajouter chaque secret:
   - Name: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-...`
4. **Add secret**

---

## Étape 9: Créer les Environments

### 1. Testnet Environment

1. **Settings** > **Environments** > **New environment**
2. Name: `testnet`
3. **Configure environment**:
   - Deployment branches: `develop`
   - Environment secrets:
     - `TESTNET_PRIVATE_KEY`: [votre clé privée testnet]
     - `BASE_SEPOLIA_RPC_URL`: [RPC URL]
4. **Save protection rules**

### 2. Production Environment

1. **Settings** > **Environments** > **New environment**
2. Name: `production`
3. **Configure environment**:
   - **Deployment branches:** `main` only
   - **Required reviewers:** Ajouter 2 reviewers
   - **Wait timer:** 900 seconds (15 minutes)
   - Environment secrets:
     - `MAINNET_PRIVATE_KEY`: [clé privée production - WALLET DÉDIÉ]
     - `BASE_RPC_URL`: [RPC mainnet]
4. **Save protection rules**

---

## Étape 10: Activer GitHub Actions

1. **Settings** > **Actions** > **General**
2. **Actions permissions:**
   - ✅ Allow all actions and reusable workflows
3. **Workflow permissions:**
   - ✅ Read and write permissions
   - ✅ Allow GitHub Actions to create and approve pull requests
4. **Save**

---

## Étape 11: Configurer Netlify (Frontend Deployment)

### Option A: Via Netlify UI

1. Aller sur: https://app.netlify.com/
2. **Add new site** > **Import an existing project**
3. **Connect to Git provider** > **GitHub**
4. Sélectionner repository: `Neural_claude_code`
5. **Build settings:**
   - Branch to deploy: `develop` (pour staging)
   - Build command: `npm run build` (ou laisser vide si pas de build)
   - Publish directory: `.` (ou `dist/` si vous avez un build)
6. **Deploy site**
7. Noter le **Site ID** dans Site Settings > General

### Option B: Via Netlify CLI

```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Initialiser
netlify init

# Suivre les prompts:
# - Create & configure new site
# - Team: votre team
# - Site name: djcloudio ou autre
# - Build command: (laisser vide)
# - Directory: .

# Deploy
netlify deploy --prod
```

---

## Étape 12: Vérifier le Pipeline

```bash
# Créer un fichier de test
echo "# Test Pipeline" > TEST.md

# Commit et push
git add TEST.md
git commit -m "test: Verify CI/CD pipeline"
git push origin develop

# Voir les workflows s'exécuter
gh run watch

# Ou sur GitHub:
# Actions tab > Voir les workflows en cours
```

---

## Étape 13: Premier Déploiement Testnet

### Déclencher le déploiement:

```bash
# S'assurer d'être sur develop
git checkout develop

# Vérifier que tous les secrets sont configurés
gh secret list

# Push pour déclencher le pipeline
git push origin develop

# Suivre l'exécution
gh run list --workflow=ci-cd-pipeline.yml
gh run watch
```

### Vérifier le déploiement:

```bash
# Une fois terminé, vérifier:

# 1. Contrats déployés
# Aller sur: https://sepolia.basescan.org
# Chercher votre wallet: 0x074059A50bBB09e74CacfDc73376Da4931eB8f3B
# Voir les transactions de déploiement

# 2. Frontend déployé
# URL Netlify: https://[site-name].netlify.app
# Ou https://djcloudio-staging.netlify.app

# 3. Artifacts de déploiement
# Actions > Dernier run > Artifacts > testnet-deployment
# Télécharger pour voir les adresses des contrats
```

---

## Étape 14: Mettre à Jour le Frontend avec les Adresses

```bash
# Récupérer les adresses des contrats déployés
# (dans les artifacts ou logs du workflow)

DAO_ADDRESS="0x..." # De l'output du déploiement
NFT_ADDRESS="0x..." # De l'output du déploiement

# Mettre à jour neural-web3-connector.js
# Ouvrir le fichier et mettre à jour:
# contracts: {
#   84532: { // Base Sepolia
#     dao: '0x...',
#     nft: '0x...'
#   }
# }

# Commit et push
git add neural-web3-connector.js
git commit -m "feat: Update contract addresses for Base Sepolia testnet"
git push origin develop
```

---

## Étape 15: Tester l'Application

```bash
# 1. Ouvrir l'app
# URL: https://[votre-site].netlify.app

# 2. Connecter MetaMask
# - Ajouter Base Sepolia network
# - Se connecter avec wallet

# 3. Tester DAO Voting
# - Créer une proposal
# - Voter pour un ritual
# - Finaliser

# 4. Tester NFT Minting
# - Démarrer autopilot
# - Jouer quelques tracks
# - Stopper autopilot
# - Minter la session

# 5. Vérifier sur BaseScan
# https://sepolia.basescan.org/address/[DAO_ADDRESS]
# https://sepolia.basescan.org/address/[NFT_ADDRESS]
```

---

## 🎯 Checklist Complète

### Repository Setup
- [ ] Repository GitHub créé: `Neural_claude_code`
- [ ] Git local initialisé
- [ ] .gitignore créé
- [ ] Premier commit effectué
- [ ] Push vers GitHub réussi
- [ ] Branche `develop` créée

### Configuration GitHub
- [ ] Branch protection rules configurées (main + develop)
- [ ] Secrets GitHub ajoutés:
  - [ ] `ANTHROPIC_API_KEY`
  - [ ] `TESTNET_PRIVATE_KEY`
  - [ ] `BASE_SEPOLIA_RPC_URL`
  - [ ] `BASESCAN_API_KEY`
  - [ ] `NETLIFY_AUTH_TOKEN`
  - [ ] `NETLIFY_SITE_ID`
- [ ] Environments créés:
  - [ ] `testnet` (develop branch)
  - [ ] `production` (main branch + protection)
- [ ] GitHub Actions activé

### Deployment
- [ ] Netlify site créé
- [ ] CI/CD pipeline testé
- [ ] Contrats déployés sur Base Sepolia
- [ ] Contrats vérifiés sur BaseScan
- [ ] Frontend déployé sur Netlify
- [ ] Adresses mises à jour dans le frontend

### Testing
- [ ] Application accessible via Netlify
- [ ] Wallet connection fonctionne
- [ ] DAO voting flow testé
- [ ] NFT minting flow testé
- [ ] Transactions visibles sur BaseScan

---

## 🆘 Troubleshooting

### "Repository already exists"
```bash
# Si le repo existe déjà localement
git remote set-url origin https://github.com/fullmeo/Neural_claude_code.git
git push -u origin main
```

### "Permission denied"
```bash
# Vérifier SSH keys ou utiliser HTTPS avec token
git remote set-url origin https://github.com/fullmeo/Neural_claude_code.git

# Ou configurer SSH:
gh auth setup-git
```

### "Workflows ne se déclenchent pas"
```bash
# Vérifier Actions activées
# Settings > Actions > General > Allow all actions

# Vérifier permissions
# Settings > Actions > General > Workflow permissions > Read/write
```

### "Deployment fails - Missing secrets"
```bash
# Vérifier secrets configurés
gh secret list

# Re-ajouter si manquant
gh secret set SECRET_NAME
```

---

## 📚 Ressources

- **GitHub Docs:** https://docs.github.com
- **GitHub CLI:** https://cli.github.com
- **Netlify Docs:** https://docs.netlify.com
- **Base Docs:** https://docs.base.org

---

## 🚀 Commandes Rapides

```bash
# Status du repository
git status
gh repo view

# Voir workflows
gh workflow list
gh run list

# Voir secrets (noms seulement)
gh secret list

# Logs du dernier run
gh run view --log

# Créer une PR
gh pr create --base main --head develop --title "Release v1.0"

# Déployer manuellement
gh workflow run ci-cd-pipeline.yml

# Clone le repo (pour d'autres devs)
gh repo clone fullmeo/Neural_claude_code
```

---

**Votre repository GitHub est maintenant configuré! 🎉**

**URL:** https://github.com/fullmeo/Neural_claude_code

**Prochaine étape:** Suivre `DEVOPS_INTEGRATION_GUIDE.md` pour les workflows avancés avec Claude Code.
