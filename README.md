# CleanCheck — Plateforme SaaS pour sociétés de nettoyage

CleanCheck est la plateforme tout-en-un pour les sociétés de nettoyage professionnelles. Générez des QR codes dynamiques, suivez vos interventions en temps réel via des checklists interactives, et automatisez votre Score Qualité client.

## 🚀 Fonctionnalités

- **QR Codes dynamiques** : Générez des QR Codes uniques pour chaque intervention
- **Checklists interactives** : Templates personnalisables, tâches avec photos et notes
- **Score Qualité automatisé** : Évaluation client 5 étoiles, score agent automatique
- **Dashboard manager** : Vue d'ensemble complète de l'activité
- **Scan mobile** : Interface optimisée pour les agents sur le terrain
- **Rapport client** : Le client scanne le QR et évalue la prestation

## 🛠️ Tech Stack

- **Framework** : Next.js 16 (App Router)
- **Langage** : TypeScript
- **Base de données** : SQLite + Prisma ORM
- **UI** : Tailwind CSS + shadcn/ui
- **Auth** : JWT + bcryptjs
- **Charts** : Recharts

## 📦 Installation

```bash
npm install
cp .env.example .env
npx prisma db push
npx tsx prisma/seed-cleancheck.ts
npm run dev
```

## 🔑 Identifiants de démo

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Super Admin | superadmin@cleancheck.fr | SuperAdmin2025! |
| Manager | marie.dupont@cleanpro.fr | Manager2025! |
| Agent | sophie.laurent@cleanpro.fr | Agent2025! |

## 📁 Structure

```
src/
├── app/
│   ├── api/cleancheck/     # API REST (auth, CRUD, QR, scores)
│   ├── auth/               # Pages de connexion/inscription
│   ├── dashboard/          # Dashboard manager
│   ├── scan/[token]/       # Interface agent (scan QR)
│   └── page.tsx            # Landing page
├── components/
│   ├── dashboard-layout.tsx
│   ├── data-table.tsx
│   └── ui/                 # Composants shadcn/ui
└── lib/
    ├── auth.ts             # JWT, bcrypt, sessions
    ├── db.ts               # Prisma client singleton
    ├── scoring.ts          # Algorithme de scoring qualité
    └── utils.ts
```

## 📄 Licence

MIT
