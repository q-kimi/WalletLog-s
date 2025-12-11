# BudgStat - Gestion de Dépenses

Application moderne et minimaliste pour gérer vos dépenses avec dark mode intégré.

## 🚀 Fonctionnalités

- 📊 Dashboard avec statistiques complètes
- 💰 Ajout et gestion de dépenses et revenus
- 📈 Graphiques et visualisations interactives
- 🏷️ Catégorisation des dépenses (18 catégories)
- 🔄 Paiements et revenus récurrents
- 💾 Comptes d'épargne multiples
- 📅 Calendrier des transactions
- 🌙 Dark mode automatique
- 💾 Stockage local (localStorage)
- 📱 Design responsive
- 🌍 Support multilingue (Français)
- 💱 Support multi-devises (EUR)

## ✅ Prérequis

- **Node.js** : version ≥ 18 (recommandé : 20+)
- **pnpm** : version ≥ 8.0.0
  - Installation : `npm install -g pnpm`

## 🛠️ Installation

```bash
# Installer les dépendances
pnpm install
```

> Si des scripts de build sont bloqués (warning pnpm “Ignored build scripts”), exécutez `pnpm approve-builds` puis relancez `pnpm install`.

## 🏃 Démarrage

```bash
# Mode développement
pnpm dev

# Build de production
pnpm build

# Démarrer en production
pnpm start
```

Le serveur de développement est accessible sur **http://localhost:3001**

## 📦 Structure du Projet

```
budgstat/
├── app/                 # Pages Next.js (App Router)
│   ├── layout.tsx      # Layout principal
│   ├── page.tsx        # Page d'accueil
│   └── globals.css     # Styles globaux
├── components/         # Composants React
│   ├── Dashboard.tsx   # Tableau de bord
│   ├── ExpenseForm.tsx # Formulaire de dépense
│   ├── IncomeForm.tsx  # Formulaire de revenu
│   └── ...            # Autres composants
├── types/              # Définitions TypeScript
│   └── index.ts        # Types principaux
├── next.config.js      # Configuration Next.js
├── tailwind.config.ts  # Configuration Tailwind CSS
└── tsconfig.json       # Configuration TypeScript
```

## 🏗️ Technologies

- **Next.js 15** - Framework React avec App Router
- **React 18** - Bibliothèque UI
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS utilitaire
- **Recharts** - Bibliothèque de graphiques
- **Lucide React** - Icônes
- **date-fns** - Manipulation de dates

## 📝 Scripts Disponibles

- `pnpm dev` - Démarre le serveur de développement avec Turbopack
- `pnpm build` - Compile l'application pour la production
- `pnpm start` - Démarre le serveur de production
- `pnpm lint` - Vérifie le code avec ESLint
- `pnpm type-check` - Vérifie les types TypeScript

## 🚢 Déploiement (production)

1. **Installer les dépendances (lockfile figé)**
   ```bash
   pnpm install --frozen-lockfile
   ```
2. **Construire**
   ```bash
   pnpm build
   ```
3. **Lancer le serveur**
   ```bash
   pnpm start
   ```
   - Port par défaut : `3000` (ou `3001` si vous changez le script `dev`).  
   - Pour changer le port en production : `PORT=4000 pnpm start`.

4. **Process manager (optionnel)**
   - PM2 : `pm2 start "pnpm start" --name budgstat`
   - Systemd (Linux) : créer un service qui lance `pnpm start` depuis le dossier du projet.

### Remarques Next.js 15
- `pnpm dev` utilise Turbopack (dev only).  
- `pnpm build`/`pnpm start` utilisent le pipeline Next classique.

## 🔧 Configuration

### Port

Le port de dev est **3001**. Pour le modifier, éditez le script `dev` dans `package.json` :

```json
"dev": "next dev --turbopack -p 3001"
```

En production, utilisez la variable d'environnement `PORT` (ex. `PORT=4000 pnpm start`).

### Variables d'environnement

Aucune variable d'environnement requise pour le moment. Les données sont stockées localement dans le navigateur.

## 👤 Auteur

Développé avec ❤️ pour une gestion simple et efficace de vos finances.