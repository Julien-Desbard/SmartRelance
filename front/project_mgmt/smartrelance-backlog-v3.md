# SmartRelance — Backlog V3 (compte premium)

## Résumé

Version payante sans limite de volume, avec relances automatiques programmées et upload multiple.

## Prérequis

- V2 fonctionnelle

---

## Stack technique ajoutée

- **Paiement** : Stripe (Checkout + Webhooks)
- **Cron jobs** : Vercel Cron ou Upstash QStash
- **Stockage fichiers** : Cloudflare R2 ou AWS S3 (pour conserver les PDFs)

---

## Étapes de développement

### 1. Setup Stripe

**Actions :**
- Créer compte Stripe
- Créer un produit "Premium" avec prix mensuel
- Installer `stripe` package
- Configurer les clés API dans `.env`

**Technos :** Stripe

---

### 2. Ajouter le statut premium au User

**Actions :**
- Modifier le schéma Prisma :

```prisma
model User {
  id              String    @id @default(cuid())
  email           String    @unique
  name            String?
  isPremium       Boolean   @default(false)
  stripeCustomerId String?
  premiumUntil    DateTime?
  createdAt       DateTime  @default(now())
  factures        Facture[]
}
```

- Migrer la BDD

**Technos :** Prisma

---

### 3. Créer le tunnel de paiement

**Actions :**
- Créer API route `POST /api/checkout` qui génère une session Stripe Checkout
- Rediriger l'utilisateur vers Stripe
- Créer page `/pricing` avec bouton "Passer Premium"

**Technos :** Stripe Checkout

---

### 4. Gérer les webhooks Stripe

**Actions :**
- Créer API route `POST /api/webhooks/stripe`
- Écouter les événements :
  - `checkout.session.completed` → activer premium
  - `invoice.paid` → renouveler premium
  - `customer.subscription.deleted` → désactiver premium
- Mettre à jour `isPremium` et `premiumUntil` en BDD

**Technos :** Stripe Webhooks, Prisma

---

### 5. Supprimer la limite pour les premium

**Actions :**
- Modifier la logique de rate limiting :
  - Si `isPremium` → pas de limite
  - Sinon → limite 3/jour

**Technos :** Prisma, logique existante

---

### 6. Ajouter les champs de relance auto

**Actions :**
- Modifier le schéma Prisma :

```prisma
model Facture {
  // ... champs existants
  relanceAuto     Boolean   @default(false)
  prochaineRelance DateTime?
  relancesEnvoyees Int      @default(0) // 0, 1, 2, 3
}
```

- Migrer la BDD

**Technos :** Prisma

---

### 7. Activer la relance auto à l'envoi

**Actions :**
- Si utilisateur premium et facture non payée :
  - `relanceAuto = true`
  - `prochaineRelance = dateEnvoi + 7 jours`
- Option pour désactiver la relance auto par facture

**Technos :** Prisma

---

### 8. Créer le cron job de relance

**Actions :**
- Créer API route `POST /api/cron/relances`
- Sécuriser avec un secret (header `Authorization`)
- Logique :
  - Récupérer les factures où `relanceAuto = true` ET `payee = false` ET `prochaineRelance <= now()`
  - Pour chaque facture :
    - Déterminer le ton selon `relancesEnvoyees` (0→aimable à J+7, 1→ferme à J+14, 2→mise en demeure à J+31)
    - Envoyer l'email
    - Incrémenter `relancesEnvoyees`
    - Calculer `prochaineRelance` suivante (ou null si 3 relances faites)
- Configurer le cron dans `vercel.json` :

```json
{
  "crons": [
    {
      "path": "/api/cron/relances",
      "schedule": "0 9 * * *"
    }
  ]
}
```

**Technos :** Vercel Cron, Nodemailer, Prisma

---

### 9. Stockage persistant des PDFs

**Actions :**
- Créer compte Cloudflare R2 (gratuit jusqu'à 10 Go)
- Installer `@aws-sdk/client-s3` (compatible R2)
- Modifier l'upload : stocker le PDF sur R2 au lieu de `/tmp`
- Sauvegarder l'URL dans `fichierUrl`
- Le PDF reste disponible pour les relances futures

**Technos :** Cloudflare R2, AWS SDK

---

### 10. Upload multiple

**Actions :**
- Modifier DropZone : `maxFiles: 10` (ou autre limite)
- Adapter le flux pour traiter plusieurs fichiers en séquence
- Afficher la progression (1/5, 2/5, etc.)
- Sauvegarder chaque facture individuellement

**Technos :** react-dropzone, React

---

### 11. UI Dashboard premium

**Actions :**
- Afficher un badge "Premium" sur le profil
- Ajouter colonne "Relance auto" dans le tableau (on/off toggle)
- Ajouter colonne "Prochaine relance" avec la date
- Permettre de désactiver la relance auto manuellement

**Technos :** React, Prisma

---

### 12. Page de gestion d'abonnement

**Actions :**
- Créer page `/account`
- Afficher : statut premium, date de renouvellement
- Bouton "Gérer mon abonnement" → Stripe Customer Portal
- Créer API route pour générer le lien du portal

**Technos :** Stripe Customer Portal

---

## Variables d'environnement ajoutées

```env
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=smartrelance-pdfs
CRON_SECRET=... (pour sécuriser le cron)
```

---

## Parcours utilisateur V3

1. Utilisateur gratuit voit "Passer Premium" dans le dashboard
2. Clique → Stripe Checkout → Paiement
3. Retour sur l'app, statut premium activé
4. Peut uploader plusieurs factures à la fois
5. Chaque facture envoyée déclenche le cycle de relance auto :
   - J+7 : relance aimable
   - J+14 : relance ferme  
   - J+31 : mise en demeure
6. Peut désactiver la relance auto par facture
7. Peut marquer comme payée → stoppe les relances
8. Gère son abonnement via le portal Stripe
