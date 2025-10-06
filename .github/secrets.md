# GitHub Secrets Configuration

## Required Secrets for CI/CD Pipeline

Pour configurer votre pipeline DevOps, ajoutez ces secrets dans **Settings > Secrets and variables > Actions** de votre repository GitHub.

### 🔑 Blockchain & Smart Contracts

```yaml
TESTNET_PRIVATE_KEY
# Votre clé privée pour déploiement testnet
# ATTENTION: JAMAIS la clé privée mainnet!
# Format: 0x... (64 caractères hexadécimaux)

MAINNET_PRIVATE_KEY
# Clé privée pour production (Base Mainnet)
# ⚠️ CRITIQUE - Stocker dans un vault sécurisé
# Utiliser un wallet dédié avec fonds limités

BASE_SEPOLIA_RPC_URL
# https://sepolia.base.org
# OU Alchemy/Infura endpoint pour Base Sepolia

BASE_RPC_URL
# https://mainnet.base.org
# OU Alchemy/Infura endpoint pour Base Mainnet

BASESCAN_API_KEY
# Pour vérification des contrats
# Obtenir sur: https://basescan.org/myapikey
```

### 🤖 Claude Code / Anthropic

```yaml
ANTHROPIC_API_KEY
# Clé API pour Claude Code
# Obtenir sur: https://console.anthropic.com/
# Format: sk-ant-...
```

### 🚀 Déploiement Frontend

```yaml
NETLIFY_AUTH_TOKEN
# Token d'authentification Netlify
# Obtenir: Netlify Dashboard > User Settings > Applications > Personal Access Tokens

NETLIFY_SITE_ID
# ID du site Netlify
# Trouver dans: Site Settings > General > Site details > Site ID
```

**Alternative: Vercel**

```yaml
VERCEL_TOKEN
# Token d'authentification Vercel
# Obtenir: Vercel Dashboard > Settings > Tokens

VERCEL_ORG_ID
# ID de l'organisation Vercel

VERCEL_PROJECT_ID
# ID du projet Vercel
```

### 🔐 Security & Monitoring

```yaml
SNYK_TOKEN
# Pour scans de sécurité
# Obtenir: https://snyk.io/account

CODECOV_TOKEN
# Pour rapports de couverture
# Obtenir: https://codecov.io/
```

### 📢 Notifications

```yaml
SLACK_WEBHOOK_URL
# Webhook pour notifications Slack
# Créer dans: Slack App > Incoming Webhooks

DISCORD_WEBHOOK
# Webhook pour notifications Discord
# Créer dans: Discord Server Settings > Integrations > Webhooks
```

---

## Configuration des Secrets

### Via GitHub UI:

1. Aller sur votre repository: `https://github.com/fullmeo/Neural_claude_code`
2. **Settings** > **Secrets and variables** > **Actions**
3. Cliquer **New repository secret**
4. Ajouter chaque secret avec son nom exact et sa valeur

### Via GitHub CLI:

```bash
# Installer GitHub CLI
# https://cli.github.com/

# Authentification
gh auth login

# Ajouter les secrets
gh secret set ANTHROPIC_API_KEY --body "sk-ant-your-key-here"
gh secret set TESTNET_PRIVATE_KEY --body "0xyour-private-key"
gh secret set BASESCAN_API_KEY --body "your-basescan-key"
gh secret set NETLIFY_AUTH_TOKEN --body "your-netlify-token"
gh secret set NETLIFY_SITE_ID --body "your-site-id"

# Vérifier les secrets configurés
gh secret list
```

---

## Environments Configuration

Créer des environments pour isolation:

### 1. **Testnet Environment**
- Name: `testnet`
- URL: `https://sepolia.basescan.org`
- Secrets:
  - `TESTNET_PRIVATE_KEY`
  - `BASE_SEPOLIA_RPC_URL`

### 2. **Production Environment**
- Name: `production`
- URL: `https://basescan.org`
- Protection rules:
  - ✅ Required reviewers (2)
  - ✅ Wait timer (15 minutes)
- Secrets:
  - `MAINNET_PRIVATE_KEY`
  - `BASE_RPC_URL`

### Configuration:

1. **Settings** > **Environments** > **New environment**
2. Nom: `testnet` ou `production`
3. **Environment protection rules** (pour production):
   - ✅ Required reviewers: Ajouter 2 reviewers
   - ✅ Wait timer: 900 secondes (15 min)
4. **Environment secrets**: Ajouter les secrets spécifiques

---

## 🔒 Sécurité des Clés Privées

### ⚠️ IMPORTANT - Wallet Sécurisé

**Pour Testnet:**
```
Wallet: 0x074059A50bBB09e74CacfDc73376Da4931eB8f3B
Utilisation: Base Sepolia uniquement
Fonds: Testnet ETH (sans valeur réelle)
```

**Pour Mainnet (Production):**
```
Créer un nouveau wallet dédié:
1. Générer une nouvelle clé avec MetaMask ou hardware wallet
2. Transférer SEULEMENT les fonds nécessaires pour déploiement
3. NE JAMAIS utiliser votre wallet principal
4. Activer 2FA sur GitHub
5. Utiliser GitHub Environments avec reviewers
```

### Protection des Secrets

```bash
# ❌ JAMAIS commiter de secrets
echo ".env" >> .gitignore
echo "*.pem" >> .gitignore
echo "*.key" >> .gitignore

# ✅ Scanner pour secrets exposés
npm install -g truffleHog
truffleHog --regex --entropy=True .

# ✅ Utiliser git-secrets
git secrets --install
git secrets --register-aws
```

---

## Obtenir les Clés API

### Anthropic (Claude Code)
1. Aller sur: https://console.anthropic.com/
2. **API Keys** > **Create Key**
3. Copier la clé: `sk-ant-...`
4. Ajouter à GitHub Secrets: `ANTHROPIC_API_KEY`

### BaseScan
1. Aller sur: https://basescan.org/myapikey
2. **Add** > Nom: "DJ Cloudio CI/CD"
3. Copier la clé
4. Ajouter à GitHub Secrets: `BASESCAN_API_KEY`

### Netlify
1. Dashboard Netlify: https://app.netlify.com/
2. **User Settings** > **Applications** > **New Access Token**
3. Copier le token
4. Site ID: **Site Settings** > **General** > **Site ID**
5. Ajouter les 2 à GitHub Secrets

### Alchemy (RPC URLs)
1. Aller sur: https://www.alchemy.com/
2. **Create App** > Sélectionner "Base" et "Base Sepolia"
3. Copier les HTTPS URLs
4. Ajouter à GitHub Secrets:
   - `BASE_SEPOLIA_RPC_URL`
   - `BASE_RPC_URL`

---

## Vérification des Secrets

Après configuration, vérifier avec:

```bash
# Lister les secrets (ne montre pas les valeurs)
gh secret list

# Tester le workflow
gh workflow run ci-cd-pipeline.yml

# Voir le statut
gh run list --workflow=ci-cd-pipeline.yml
```

---

## 🎯 Checklist de Configuration

- [ ] `ANTHROPIC_API_KEY` configuré
- [ ] `TESTNET_PRIVATE_KEY` configuré (wallet 0x074059...)
- [ ] `BASE_SEPOLIA_RPC_URL` configuré
- [ ] `BASESCAN_API_KEY` configuré
- [ ] `NETLIFY_AUTH_TOKEN` configuré
- [ ] `NETLIFY_SITE_ID` configuré
- [ ] Environment "testnet" créé
- [ ] Environment "production" créé avec protection
- [ ] Notifications Slack/Discord configurées (optionnel)
- [ ] Secrets de sécurité (Snyk, Codecov) configurés (optionnel)

---

**Repository:** `https://github.com/fullmeo/Neural_claude_code`

**Note:** Les secrets sont chiffrés par GitHub et jamais exposés dans les logs. Utilisez toujours `${{ secrets.SECRET_NAME }}` dans les workflows.
