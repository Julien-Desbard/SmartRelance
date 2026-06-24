# SmartConform — Backlog V3 (compte premium)

## Résumé

Version payante sans limite de documents, avec upload multiple, génération de documents de renouvellement, multi-utilisateurs par organisation, export PDF du dossier de conformité, et module d'extraction de baux immobiliers.

## Prérequis

- V2 fonctionnelle avec base d'utilisateurs active

---

## Stack technique ajoutée

- **Paiement** : Stripe (Checkout + Webhooks + Customer Portal)
- **Stockage fichiers** : Cloudflare R2 (compatible S3, gratuit jusqu'à 10 Go)
- **Génération PDF** : react-pdf ou puppeteer (côté serveur)

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
  id               String     @id @default(cuid())
  email            String     @unique
  name             String?
  isPremium        Boolean    @default(false)
  stripeCustomerId String?
  premiumUntil     DateTime?
  organizationId   String?
  organization     Organization? @relation(fields: [organizationId], references: [id])
  createdAt        DateTime   @default(now())
  documents        Document[]
}

model Organization {
  id        String   @id @default(cuid())
  name      String
  siret     String?
  codeNaf   String?
  users     User[]
  createdAt DateTime @default(now())
}
```

- Migrer la BDD

**Technos :** Prisma

---

### 3. Créer le tunnel de paiement

**Actions :**
- Créer API route `POST /api/checkout` qui génère une session Stripe Checkout
- Rediriger l'utilisateur vers Stripe
- Créer page `/pricing` avec comparatif gratuit / premium clair :
  - Gratuit : 10 documents, alertes email, calendrier
  - Premium : documents illimités, upload multiple, génération de documents, multi-utilisateurs, export PDF, module baux

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
- Modifier la logique de rate limiting / compteur de documents :
  - Si `isPremium` → pas de limite
  - Sinon → limite 10 documents (V2 inchangé)

**Technos :** Prisma, logique existante

---

### 6. Upload multiple

**Actions :**
- Modifier la DropZone : accepter jusqu'à 20 fichiers simultanément
- Adapter le flux pour traiter plusieurs fichiers en séquence
- Afficher la progression (1/5, 2/5, etc.) avec barre de progression globale
- Chaque document est extrait et sauvegardé individuellement
- Si un document échoue, les autres continuent (pas de fail global)
- Résumé final : X documents extraits avec succès, Y en erreur

**Technos :** React

---

### 7. Stockage persistant des PDFs

**Actions :**
- Créer compte Cloudflare R2
- Installer `@aws-sdk/client-s3` (compatible R2)
- Modifier l'upload : stocker le PDF sur R2 après extraction réussie
- Sauvegarder l'URL R2 dans `fichierUrl` du Document
- Le PDF reste disponible pour consultation ultérieure et pour le rapport de conformité

**Technos :** Cloudflare R2, AWS SDK

---

### 8. Génération de documents de renouvellement

**Actions :**
- Créer des templates pour les documents courants :
  - Lettre de demande de renouvellement d'attestation URSSAF
  - Lettre de demande de renouvellement d'assurance RC Pro
  - Demande de rendez-vous pour renouvellement d'habilitation
  - Demande de KBIS actualisé
- Injecter les variables depuis les données du Document : type, émetteur, dates, conditions
- Aperçu avant téléchargement
- Export en PDF

**Technos :** react-pdf ou puppeteer, template literals TS

---

### 9. Module extraction de baux

Le bail immobilier est un document à échéance comme les autres — il intègre naturellement le calendrier de conformité.

**Actions :**
- Étendre le prompt Claude avec des exemples de baux (commercial, habitation)
- Extraire les champs spécifiques aux baux :
  - Type de bail (commercial 3/6/9, habitation, professionnel)
  - Montant du loyer
  - Indice d'indexation (IRL, ILC, ILAT)
  - Date de début, durée, date de fin
  - Clause de renouvellement / résiliation
  - Préavis requis
- Calculer automatiquement les échéances : prochaine révision de loyer, fin de période triennale, date de préavis
- Ajouter ces échéances au calendrier de conformité au même titre que les certifications
- Calcul automatique de la révision de loyer selon l'indice applicable

**Technos :** Claude API (prompt étendu), logique TS

> **Post LinkedIn :** extraction IA de baux immobiliers — dates clés, révisions de loyer, préavis, le tout intégré au calendrier de conformité.

---

### 10. Multi-utilisateurs par organisation

**Actions :**
- Créer le modèle `Organization` (voir schéma étape 2)
- Page `/organization` pour créer / gérer son organisation
- Invitation de collaborateurs par email (envoi d'un lien d'invitation)
- Les documents sont partagés au niveau de l'organisation
- Rôles : admin (invite, supprime) et membre (ajoute, consulte)
- Le dashboard affiche les documents de toute l'organisation

**Technos :** Prisma, Nodemailer, React

---

### 11. Export PDF du dossier de conformité

**Actions :**
- Créer API route `GET /api/export/conformite`
- Générer un PDF contenant :
  - En-tête avec nom de l'organisation, date de génération
  - Indicateur de conformité global (% à jour)
  - Liste de tous les documents avec leurs statuts
  - Timeline des prochaines échéances
  - Documents manquants identifiés (si module V4 RAG activé)
- Ce PDF est utilisable pour les appels d'offres, les audits clients, les demandes de marché public

**Technos :** react-pdf ou puppeteer

> **Post LinkedIn :** dossier de conformité exportable en PDF — utile pour les appels d'offres et les audits.

---

### 12. UI Dashboard premium

**Actions :**
- Badge "Premium" sur le profil
- Compteur de documents sans limite
- Section "Organisation" dans le menu (si multi-utilisateurs)
- Bouton "Exporter le dossier de conformité" dans le dashboard
- Bouton "Ajouter plusieurs documents" (upload multiple)
- Colonne "Dernière action" dans le tableau (date du dernier upload / modification)

**Technos :** React, Prisma

---

### 13. Page de gestion d'abonnement

**Actions :**
- Créer page `/account`
- Afficher : statut premium, date de renouvellement
- Bouton "Gérer mon abonnement" → Stripe Customer Portal
- API route pour générer le lien du portal

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
R2_BUCKET_NAME=smartconform-docs
```

---

## Parcours utilisateur V3

1. Utilisateur gratuit voit "Passer Premium" dans le dashboard
2. Clique → page /pricing → Stripe Checkout → Paiement
3. Retour sur l'app, statut premium activé
4. Peut uploader plusieurs documents à la fois
5. Chaque document extrait est sauvegardé avec son PDF original sur R2
6. Peut générer des lettres de renouvellement pré-remplies
7. Peut créer une organisation et inviter des collaborateurs
8. Peut exporter un dossier de conformité PDF complet
9. Les baux immobiliers sont gérés comme des documents à échéance (révisions de loyer, préavis, renouvellements)
10. Gère son abonnement via le portal Stripe

---

## Tableau posts LinkedIn V3

| Étape | Angle du post | Signal recruteur |
|---|---|---|
| Stripe intégré | Paiement en production sur un outil réel | Intégration API complexe |
| Upload multiple | Traitement batch, gestion d'erreurs partielles | Architecture robuste |
| Module baux | Extension du domaine métier — un bail est un document à échéance | Vision produit |
| Multi-utilisateurs | Gestion de rôles, invitations, données partagées | Architecture multi-tenant |
| Export PDF conformité | Génération de document côté serveur, utile pour les appels d'offres | Feature à valeur métier |
| R2 + stockage | Architecture de stockage objet, persistance à l'échelle | Cloud, architecture |
