# SmartConform — Backlog V1 (sans compte)

## Résumé

Version de démonstration permettant d'uploader un document réglementaire, d'en extraire les dates de validité par IA, et de générer un rappel calendrier. Limite : 5 documents/jour par IP.

**Positionnement :** SmartConform n'est pas un projet d'apprentissage. C'est un outil B2B construit par quelqu'un qui a 20 ans d'expérience en opérations, audit et gestion des risques. Les TPE/PME perdent des marchés et prennent des amendes parce qu'un certificat a expiré sans que personne ne s'en rende compte. SmartConform résout ça. Chaque texte visible — README, landing page, posts LinkedIn — doit refléter ce positionnement.

---

## Stack technique V1

- **Framework** : Next.js (App Router, front + API routes)
- **Extraction PDF** : Claude API (`claude-haiku-3-5`, lecture directe du PDF)
- **Rate limiting** : Upstash Redis (gratuit)
- **Déploiement** : Vercel
- **Styling** : Tailwind CSS
- **Design system** : Satoshi (display), Instrument Sans (body), Geist Mono (data)

---

## Étapes de développement

### 1. Initialisation projet

**Actions :**
- Créer projet Next.js avec App Router
- Configurer TypeScript
- Installer Tailwind CSS
- Créer structure de dossiers : `/app`, `/components`, `/lib`, `/templates`
- Installer les fonts (Satoshi via Fontshare, Instrument Sans et Geist Mono via Google Fonts)
- Configurer les CSS variables du design system (voir DESIGN.md)
- Rédiger le README avec le positionnement expert métier : l'outil est construit par quelqu'un qui connaît l'audit et la conformité de l'intérieur, pas par un junior qui apprend

**Technos :** Next.js, TypeScript, Tailwind CSS, pnpm

> **Post LinkedIn :** lancement du projet en public, angle "ancien directeur audit qui construit l'outil qu'il aurait voulu avoir".

---

### 2. Landing page + positionnement portfolio

C'est l'étape la plus importante visuellement. Cette page est vue par les prospects et les recruteurs.

**Actions :**
- Accroche orientée problème métier, pas technologie : "Vos documents réglementaires expirent. SmartConform vous prévient avant qu'il ne soit trop tard."
- Section "Comment ça marche" en 3 étapes visuelles :
  1. Uploadez votre document (attestation, certificat, assurance)
  2. L'IA extrait les dates de validité
  3. Recevez des alertes avant chaque expiration
- Lien de téléchargement d'un document démo (attestation RC Pro fictive, PDF statique dans `/public`)
- Zone de drag & drop pour upload PDF
- Section "Exemples de documents gérés" : RC Pro, attestation URSSAF, Qualiopi, KBIS, habilitations, DPE
- Footer : "Conçu et développé par [Julien Desbard](lien LinkedIn) — Développeur Full Stack JS, expert en opérations et conformité B2B"
- Respecter le design system : palette restrained, Satoshi pour les titres, espacement comfortable

**Ton à éviter :** "projet personnel", "en cours d'apprentissage", "junior". Aucun de ces termes ne doit apparaître.

**Technos :** React, Tailwind CSS

> **Post LinkedIn :** choix UX orientés sur le problème métier (amendes, perte de marchés, documents expirés), pas sur les technos.

---

### 3. Upload et validation du PDF

**Actions :**
- Créer API route `/api/upload`
- Valider que le fichier est un PDF (MIME type + magic bytes)
- Limiter la taille (5 Mo max)
- Stocker temporairement en mémoire ou `/tmp`
- Toast notifications pour feedback utilisateur (succès / erreur)
- Nettoyer `/tmp` après chaque extraction

**Technos :** Next.js API Routes

> **Post LinkedIn :** validation sécurité côté serveur (magic bytes, pas seulement le MIME type déclaré par le client), approche qualité.

---

### 4. Tests unitaires du composant upload

À faire immédiatement après l'étape 3, avant de continuer.

**Actions :**
- Mettre en place Jest + React Testing Library
- Couvrir les états UI principaux : idle, drag-over, uploading, success, error
- Tester la validation fichier : PDF valide, mauvais type, fichier trop lourd
- Configurer les scripts de test dans `package.json`
- Ajouter badge de couverture dans le README

**Technos :** Jest, React Testing Library

> **Post LinkedIn :** approche qualité, tests comportementaux (RTL), signal fort pour les recruteurs.

---

### 5. Extraction des données via Claude API

**Actions :**
- Créer API route `/api/extract`
- Envoyer le PDF à Claude API avec prompt d'extraction few-shot
- Extraire : type de document, émetteur, date d'émission, date d'expiration, conditions de renouvellement
- Retourner un JSON structuré au frontend avec un score de confidence (0-1)
- Implémenter retry avec backoff exponentiel sur erreur 429/timeout (1 retry max)
- Si Claude échoue après retry : retourner une réponse partielle avec flag `fallbackManual: true`

**Prompt (few-shot) :**
```
Tu es un assistant spécialisé dans l'extraction de données depuis des documents réglementaires français. Lis ce document et renvoie uniquement un JSON avec :
- type (parmi : assurance, attestation_urssaf, certification, habilitation, bail, controle_technique, visite_medicale, autre)
- emetteur (nom de l'organisme)
- date_emission (format YYYY-MM-DD)
- date_expiration (format YYYY-MM-DD)
- conditions_renouvellement (texte libre, ce qu'il faut faire pour renouveler)
- confidence (nombre entre 0 et 1, ta confiance dans l'extraction)

Exemples :
- Une attestation URSSAF → type: "attestation_urssaf", emetteur: "URSSAF Franche-Comté"
- Une assurance RC Pro Axa → type: "assurance", emetteur: "Axa Entreprises"
- Un certificat Qualiopi → type: "certification", emetteur: "Bureau Veritas"

Ne renvoie rien d'autre que le JSON. Si tu ne trouves pas une information, mets null.
```

**Pourquoi Claude API plutôt qu'un parser rule-based :** les documents réglementaires ont des formats extrêmement variés. Chaque assureur, chaque organisme certificateur, chaque administration génère un PDF différent. L'interprétation sémantique est la seule approche fiable. C'est un choix d'architecture justifié par l'expérience du domaine.

**Technos :** `@anthropic-ai/sdk`

---

### 6. Validation des données extraites

**Actions :**
- Valider la cohérence des dates (expiration > émission, expiration pas dans un passé lointain)
- Vérifier que le type est reconnu (enum)
- Calculer le statut : "actif" / "expire_bientot" (< 90j) / "expire"
- Calculer le nombre de jours restants
- Si confidence < 0.8 : ajouter un warning "Vérifiez cette information"
- Retourner les anomalies détectées au frontend

**Technos :** logique TS côté API (`/lib/validation.ts`)

---

### 7. Affichage des données extraites

**Actions :**
- Composant `DocumentResult` d'affichage des infos extraites
- Badge de statut coloré (vert "À jour" / orange "Expire dans Xj" / rouge "Expiré")
- Afficher le score de confidence avec warning si < 0.8
- Afficher les anomalies en warning si présentes
- Formulaire de correction : chaque champ est éditable par l'utilisateur avant de continuer
- Affichage en font mono (Geist Mono) pour les dates et le décompte de jours

**Technos :** React

---

### 8. Génération du rappel calendrier

**Actions :**
- Créer `/lib/calendar.ts` pour la génération de fichiers iCal (.ics)
- Générer 4 événements de rappel : J-90, J-30, J-15, J-7 avant la date d'expiration
- Chaque événement inclut : titre "[SmartConform] Expiration [type] - [émetteur]", description avec les conditions de renouvellement
- Bouton "Ajouter au calendrier" qui télécharge le fichier .ics
- Bouton "Ajouter à Google Calendar" qui ouvre un lien Google Calendar pré-rempli

**Technos :** format iCalendar (RFC 5545), logique TS

---

### 9. Rate limiting

**Actions :**
- Vérifier le compteur pour l'IP avant extraction via Upstash Redis
- Si >= 5 aujourd'hui : bloquer + message "Limite atteinte, créez un compte gratuit pour continuer" (prépare la V2)
- Si < 5 : incrémenter et continuer
- TTL du compteur : minuit (reset quotidien)

> **Fallback :** si l'intégration Upstash Redis bloque le déploiement, implémenter un compteur en mémoire pour la V1. Objectif prioritaire : avoir une URL en production.

**Technos :** Upstash Redis (`@upstash/redis`) ou fallback en mémoire

---

### 10. Page de confirmation + encart acquisition

**Actions :**
- Afficher message de succès : "Document analysé. 4 rappels ajoutés à votre calendrier."
- Résumé : type de document, émetteur, date d'expiration, statut
- Afficher le compteur restant pour la journée
- Ajouter encart discret : "Vous gérez plusieurs documents ? Créez un compte gratuit pour un tableau de bord complet. → [lien V2]"
- Ajouter encart portfolio : "Vous avez besoin d'un outil sur-mesure pour votre activité ? → [lien vers profil LinkedIn ou formulaire contact]"
- En cas d'erreur : message explicite avec suggestion d'action (retry ou saisie manuelle)

**Technos :** React

---

### 11. Déploiement

**Actions :**
- Créer projet sur Vercel
- Configurer les variables d'environnement
- Déployer et tester de bout en bout avec le document démo
- Ajouter le lien à la section "Réalisations" du profil LinkedIn et Malt
- Mettre à jour le README : démo live, stack, positionnement métier

> **Post LinkedIn :** mise en production, lien vers l'outil en live. C'est le post le plus important de la V1.

**Technos :** Vercel

---

### 12. Docker

**Actions :**
- Créer `Dockerfile` (Node.js 22, pnpm, port 3000)
- Créer `.dockerignore`
- Tester le build et le run en local
- Documenter dans le README

**Technos :** Docker

---

## Variables d'environnement

```env
ANTHROPIC_API_KEY=sk-ant-...
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...
```

---

## Parcours utilisateur V1

1. Arrive sur la landing page
2. Télécharge le document démo (optionnel) ou uploade son propre document
3. Voit les infos extraites : type, émetteur, dates, statut, confidence
4. Corrige si nécessaire (champs éditables)
5. Clique "Ajouter au calendrier"
6. Télécharge le fichier .ics avec les 4 rappels
7. Page de confirmation avec résumé et encart acquisition

---

## Tableau posts LinkedIn V1

| Étape | Angle du post | Signal recruteur |
|---|---|---|
| Init + README | Expert audit qui construit l'outil qu'il connaît | Positionnement hybride |
| Landing page | UX orientée problème métier (amendes, conformité) | Sens du produit |
| Upload + validation | Sécurité côté serveur, magic bytes | Rigueur |
| Tests unitaires | Approche qualité, couverture comportementale | Maintenabilité |
| Extraction IA | Choix d'architecture justifié par le domaine | Intelligence technique |
| Déploiement | Outil en production avec URL live | Capacité à livrer |
