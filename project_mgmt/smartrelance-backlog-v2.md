# SmartRelance — Backlog V2 (compte gratuit)

## Résumé

Version avec inscription permettant de conserver un historique des factures envoyées. Limite : 3 factures/jour.

## Prérequis

- V1 fonctionnelle

---

## Stack technique ajoutée

- **Authentification** : NextAuth.js (ou Auth.js)
- **Base de données** : PostgreSQL (Supabase gratuit ou Neon)
- **ORM** : Prisma

---

## Étapes de développement

### 1. Setup base de données

**Actions :**
- Créer compte Supabase ou Neon (gratuit)
- Installer Prisma
- Configurer la connexion dans `.env`

**Technos :** Prisma, PostgreSQL

---

### 2. Modéliser les données

**Actions :**
- Créer le schéma Prisma avec 2 tables :

```prisma
model User {
  id        String    @id @default(cuid())
  email     String    @unique
  name      String?
  createdAt DateTime  @default(now())
  factures  Facture[]
}

model Facture {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  fichierUrl    String
  nomClient     String
  emailClient   String
  montant       Float
  dateEcheance  DateTime
  numeroFacture String
  typeEnvoi     String   // envoi | aimable | ferme | mise_en_demeure
  statut        String   // envoyé | erreur
  dateEnvoi     DateTime
  payee         Boolean  @default(false)
  createdAt     DateTime @default(now())
}
```

- Exécuter la migration

**Technos :** Prisma

---

### 3. Authentification

**Actions :**
- Installer NextAuth.js
- Configurer un provider (Google ou email magic link)
- Créer les routes `/api/auth/[...nextauth]/route.ts`
- Créer pages login/register ou utiliser les pages par défaut
- Lier l'utilisateur NextAuth à la table User Prisma

**Technos :** NextAuth.js

---

### 4. Adapter le flux existant

**Actions :**
- Si utilisateur connecté : sauvegarder la facture en BDD après envoi
- Si utilisateur non connecté : comportement V1 (pas de sauvegarde)
- Le rate limiting passe de IP à userId pour les connectés

**Technos :** Prisma, NextAuth

---

### 5. Créer le tableau de suivi

**Actions :**
- Créer page `/dashboard`
- Protéger la route (redirect si non connecté)
- Afficher la liste des factures de l'utilisateur avec colonnes :
  - Date d'envoi
  - Montant
  - Destinataire (email client)
  - Type d'action (envoi / relance + ton)
  - Case à cocher "Payée"
- Trier par date décroissante

**Technos :** React, Prisma

---

### 6. Marquer une facture comme payée

**Actions :**
- Créer API route `PATCH /api/factures/[id]`
- Mettre à jour le champ `payee` en BDD
- Rafraîchir l'affichage côté client

**Technos :** Next.js API Routes, Prisma

---

### 7. Navigation et UI

**Actions :**
- Ajouter header avec : logo, lien dashboard, bouton connexion/déconnexion
- Afficher le nom/email de l'utilisateur connecté
- Bouton "Nouvelle facture" dans le dashboard

**Technos :** React, NextAuth (useSession)

---

## Variables d'environnement ajoutées

```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=... (si provider Google)
GOOGLE_CLIENT_SECRET=...
```

---

## Parcours utilisateur V2

1. Arrive sur la landing page
2. Peut utiliser sans compte (V1) ou se connecter
3. Si connecté : après envoi, la facture est sauvegardée
4. Accède au dashboard pour voir l'historique
5. Peut cocher "Payée" sur une facture
6. Toujours limité à 3 factures/jour
