# SmartConform — Backlog V2 (compte gratuit)

## Résumé

Version avec inscription permettant de conserver un historique des documents, un dashboard de conformité avec calendrier visuel, et des alertes email automatiques avant chaque expiration. Limite : 10 documents. Intègre les pratiques mid-level : tests E2E, CI/CD complet, monitoring.

## Prérequis

- V1 fonctionnelle **et** en production avec une URL live. Ne pas commencer V2 avant d'avoir validé que le flux extraction fonctionne correctement sur des documents réels variés.

---

## Stack technique ajoutée

- **Authentification** : NextAuth.js (Auth.js)
- **Base de données** : PostgreSQL (Neon — gratuit)
- **ORM** : Prisma
- **Envoi email** : Nodemailer + Gmail SMTP
- **Tests E2E** : Playwright
- **CI/CD** : GitHub Actions (pipeline complet tests → build → deploy)
- **Monitoring** : Sentry
- **Cron** : Vercel Cron + Cronitor (heartbeat monitoring)

---

## Étapes de développement

### 1. Setup base de données

**Actions :**
- Créer compte Neon (PostgreSQL gratuit)
- Installer Prisma
- Configurer la connexion dans `.env`

**Technos :** Prisma, PostgreSQL

---

### 2. Modéliser les données

**Actions :**
- Créer le schéma Prisma :

```prisma
model User {
  id        String     @id @default(cuid())
  email     String     @unique
  name      String?
  createdAt DateTime   @default(now())
  documents Document[]
}

model Document {
  id                       String       @id @default(cuid())
  userId                   String
  user                     User         @relation(fields: [userId], references: [id])
  type                     String       // assurance, attestation_urssaf, certification, habilitation, bail, etc.
  emetteur                 String
  dateEmission             DateTime
  dateExpiration           DateTime
  conditionsRenouvellement String?
  confidence               Float        @default(1.0)
  statut                   String       // actif, expire_bientot, expire
  fichierUrl               String?
  alertesEnvoyees          Int          @default(0)  // 0, 1, 2, 3, 4 (pour J-90, J-30, J-15, J-7)
  createdAt                DateTime     @default(now())
  updatedAt                DateTime     @updatedAt
}
```

- Créer index sur `dateExpiration` pour les requêtes du cron :
  `@@index([dateExpiration])` dans le modèle Document
- Exécuter la migration

**Technos :** Prisma

---

### 3. Authentification

**Actions :**
- Installer NextAuth.js
- Configurer provider Google (OAuth)
- Créer les routes `/api/auth/[...nextauth]/route.ts`
- Lier l'utilisateur NextAuth à la table User Prisma
- Page de connexion avec le design system SmartConform

**Technos :** NextAuth.js

---

### 4. Adapter le flux existant

**Actions :**
- Si utilisateur connecté : sauvegarder le document extrait en BDD après validation
- Si utilisateur non connecté : comportement V1 (extraction + calendrier, pas de sauvegarde)
- Le rate limiting passe de IP à userId pour les connectés (10 documents max en gratuit)
- Après extraction réussie, proposer : "Créez un compte pour sauvegarder ce document et recevoir des alertes automatiques"

**Technos :** Prisma, NextAuth

---

### 5. Dashboard de conformité

C'est la page centrale de la V2 — le recruteur doit être impressionné par cette vue.

**Actions :**
- Créer page `/dashboard`
- Protéger la route (redirect si non connecté)
- **Indicateur de conformité global** : barre de progression avec % de documents à jour, utilisant le composant meter du design system
- **Liste des documents** avec colonnes :
  - Type de document (icône + label)
  - Émetteur
  - Date d'expiration (Geist Mono, tabular-nums)
  - Jours restants (Geist Mono)
  - Statut (badge : vert "À jour" / orange "Expire dans Xj" / rouge "Expiré")
- Trier par date d'expiration croissante (le plus urgent en premier)
- Filtres par statut (tous / à jour / expire bientôt / expiré)
- Bouton "Ajouter un document" qui renvoie vers le flux d'upload

**Technos :** React, Prisma

> **Post LinkedIn :** dashboard de conformité avec indicateur temps réel — l'utilisateur voit d'un coup d'œil où il en est.

---

### 6. Calendrier visuel des échéances

**Actions :**
- Créer composant `CalendarView` : vue mensuelle avec les échéances positionnées
- Chaque document apparaît sur la date d'expiration avec son badge de statut
- Cliquer sur un document ouvre un panneau latéral avec les détails + conditions de renouvellement
- Vue par défaut : 3 prochains mois
- Couleurs cohérentes avec le design system (sémantique : vert/orange/rouge)

**Technos :** React (composant custom, pas de lib externe)

---

### 7. Cron d'alertes email

**Actions :**
- Créer API route `POST /api/cron/alertes`
- Sécuriser avec un header `Authorization` (secret dans variables env)
- Configurer dans `vercel.json` :

```json
{
  "crons": [
    {
      "path": "/api/cron/alertes",
      "schedule": "0 9 * * *"
    }
  ]
}
```

- Logique :
  - Récupérer les documents où `statut != 'expire'` ET jours restants ∈ {90, 30, 15, 7}
  - Pour chaque document, vérifier que l'alerte correspondante n'a pas déjà été envoyée (via `alertesEnvoyees`)
  - Envoyer l'email avec le template correspondant au palier
  - Incrémenter `alertesEnvoyees`
  - Logger chaque envoi dans Sentry (info level)

- Créer 4 templates email dans `/templates` :
  - J-90 : "Pensez à anticiper le renouvellement de [type] — [émetteur]"
  - J-30 : "Votre [type] expire dans 30 jours — [conditions de renouvellement]"
  - J-15 : "Rappel urgent : [type] expire dans 15 jours"
  - J-7 : "Dernier rappel : [type] expire dans 7 jours — risque d'amende / non-conformité"
- Template de base partagé (header, footer, signature) pour éviter la duplication (DRY)
- Footer de chaque email : "Envoyé via SmartConform — outil développé par [Julien Desbard](lien LinkedIn), développeur Full Stack JS"

- **Heartbeat monitoring** : en fin de cron, envoyer un ping HTTP à Cronitor (gratuit) pour vérifier que le cron a bien tourné. Si le ping ne part pas, Cronitor alerte par email.

**Error handling :**
- Si Nodemailer SMTP échoue : retry 1x, puis marquer le document avec un flag `alerteEchec: true` en BDD, log Sentry (error level)
- Si la requête BDD échoue : log Sentry, ne pas envoyer d'emails partiels

**Technos :** Vercel Cron, Nodemailer, Prisma, Cronitor

> **Post LinkedIn :** alertes automatiques de conformité — plus jamais de document expiré par oubli.

---

### 8. Gestion des documents

**Actions :**
- Créer API route `PATCH /api/documents/[id]` pour la correction manuelle des données
- Créer API route `DELETE /api/documents/[id]` pour la suppression
- Mettre à jour automatiquement le `statut` quand `dateExpiration` change
- Rafraîchir l'affichage côté client après modification

**Technos :** Next.js API Routes, Prisma

---

### 9. Navigation et UI

**Actions :**
- Ajouter header avec : logo SmartConform, lien dashboard, bouton connexion/déconnexion
- Afficher le nom/email de l'utilisateur connecté
- Bouton "Ajouter un document" visible partout
- Compteur de documents (X/10) pour les utilisateurs gratuits
- Responsive : le dashboard doit être utilisable sur mobile

**Technos :** React, NextAuth (useSession)

---

### 10. Tests E2E avec Playwright

**Actions :**
- Installer Playwright
- Configurer `playwright.config.ts` (base URL, browsers)
- Écrire les scénarios E2E prioritaires :
  - Parcours complet sans compte : upload → extraction → résultat → téléchargement .ics
  - Parcours avec compte : login → upload → extraction → document sauvegardé → visible dans le dashboard
  - Dashboard : affichage des documents, filtres par statut, indicateur de conformité
  - Rate limiting : atteindre la limite et vérifier le message de blocage
- Intégrer les tests E2E dans le pipeline CI (après les tests unitaires)

**Technos :** Playwright

> **Post LinkedIn :** tests E2E sur un flux utilisateur réel, confiance dans les déploiements.

---

### 11. CI/CD GitHub Actions — pipeline complet

**Actions :**
- Créer `.github/workflows/ci.yml`
- Pipeline en 3 étapes séquentielles :
  1. **Tests unitaires** (Jest + RTL) — bloque si échec
  2. **Tests E2E** (Playwright) — bloque si échec
  3. **Deploy** (Vercel) — seulement si tests passent
- Configurer les secrets GitHub : variables d'environnement nécessaires aux tests
- Ajouter badge CI dans le README

```yaml
name: CI/CD
on: [push, pull_request]
jobs:
  test-unit:
    runs-on: ubuntu-latest
    steps: [checkout, install, jest]
  test-e2e:
    needs: test-unit
    runs-on: ubuntu-latest
    steps: [checkout, install, playwright]
  deploy:
    needs: test-e2e
    if: github.ref == 'refs/heads/main'
    steps: [vercel deploy]
```

**Technos :** GitHub Actions, Vercel CLI

> **Post LinkedIn :** pipeline complet opérationnel, aucun déploiement sans tests verts.

---

### 12. Monitoring Sentry

**Actions :**
- Créer compte Sentry (gratuit)
- Installer `@sentry/nextjs`
- Configurer `sentry.client.config.ts` et `sentry.server.config.ts`
- Capturer les erreurs critiques : échec extraction Claude, échec envoi email, erreur BDD, cron qui ne tourne pas
- Configurer les alertes email sur les erreurs
- Variables env : `SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`

**Technos :** Sentry, Next.js

> **Post LinkedIn :** monitoring en production, capacité à détecter et corriger les régressions rapidement.

---

## Variables d'environnement ajoutées

```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://smartconform.com
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GMAIL_USER=noreply.smartconform@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
CRON_SECRET=...
CRONITOR_PING_URL=https://cronitor.link/p/...
SENTRY_DSN=https://...@sentry.io/...
SENTRY_ORG=...
SENTRY_PROJECT=smartconform
```

---

## Parcours utilisateur V2

1. Arrive sur la landing page
2. Peut utiliser sans compte (V1) ou se connecter
3. Si connecté : après extraction, le document est sauvegardé automatiquement
4. Accède au dashboard : indicateur de conformité, liste des documents, calendrier visuel
5. Reçoit des alertes email automatiques à J-90, J-30, J-15, J-7
6. Peut corriger ou supprimer un document
7. Limité à 10 documents en gratuit

---

## Tableau posts LinkedIn V2

| Étape | Angle du post | Signal recruteur |
|---|---|---|
| Auth NextAuth | Authentification sécurisée, provider OAuth | Intégration services tiers |
| Dashboard + calendrier | Produit qui évolue vers un vrai outil métier | Sens produit, vision |
| Alertes automatiques (cron) | Le cœur du produit : prévenir plutôt que guérir | Architecture, fiabilité |
| Tests E2E Playwright | Confiance dans les déploiements, parcours testés | Qualité end-to-end |
| CI/CD complet | Aucun déploiement sans tests verts | Pratiques pro |
| Sentry | Monitoring en production, détection proactive | Maturité DevOps |
