# OKAR - Passeport Numérique Automobile 🚗🇸🇳

## 📋 Description

**OKAR** est le Passeport Numérique Automobile du Sénégal - une application web pour gérer l'historique complet d'un véhicule.

### Fonctionnalités

- 🔍 Vérification de plaque
- 📋 Carnet d'entretien numérique
- 🏦 Réseau de garages partenaires
- 📊 Score de santé véhicule
- 📄 Rapports PDF (1 000 FCFA)

## 🚀 Déploiement Coolify

### 1. Variables d'environnement

```env
DATABASE_URL="file:/app/data/okar.db"
NEXTAUTH_SECRET="votre-secret-ici"
NEXTAUTH_URL="https://votre-domaine.com"
```

### 2. Déployer

1. Connectez le repo GitHub à Coolify
2. Coolify détecte le Dockerfile automatiquement
3. Ajoutez les variables d'environnement
4. Déployez!

C'est tout! La base de données SQLite est créée automatiquement.

## 🛠️ Développement local

```bash
# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env

# Initialiser la base de données
npx prisma db push
npm run seed

# Démarrer
npm run dev
```

## 🔐 Comptes de démonstration

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| SuperAdmin | superadmin@okar.sn | admin123 |
| Garage | moussa.diop@autodakar.sn | password123 |
| Driver | amadou.diouf@email.com | password123 |

---

Made with ❤️ in Sénégal 🇸🇳
