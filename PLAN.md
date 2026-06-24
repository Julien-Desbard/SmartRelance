# SmartConforme — Plan MVP (revue recruteur)

> Objectif : version minimale **cliquable et fonctionnelle** pour démontrer le projet à un recruteur.
> Flow cible : landing propre → upload `facture_demo.pdf` → données extraites par Claude affichées → téléchargement `.ics`.
> Durée flow utilisateur visée : < 2 min.

## Scope

**Inclus (V1 minimale) :**
- Extraction PDF réelle via Claude API
- Affichage des données extraites à l'écran
- Génération calendrier `.ics`
- Landing page enrichie (sections explicatives)
- Déploiement Vercel (URL live)

**Exclu volontairement (V2+) :**
- Rate limiting Upstash (bloque souvent le deploy — non essentiel pour une démo)
- Auth / comptes utilisateurs
- Dashboard multi-documents
- Microservice Python (V4)

---

## État de départ (snapshot 2026-06-01)

| Élément | État |
|---|---|
| Landing hero + DropZone drag & drop | ✅ fonctionnel |
| `/api/upload` (validation MIME + magic bytes, 5 Mo) | ✅ fonctionnel |
| `/api/extract` (appel Claude) | ⚠️ existe mais reçoit du texte libre, **pas** le PDF — inutilisable en l'état |
| Affichage du résultat d'extraction | ❌ absent (juste un toast "PDF uploadé") |
| Composant `DocumentResult` | ❌ absent |
| Génération `.ics` / bouton calendrier | ❌ absent |
| Sections landing "Comment ça marche" + "Documents gérés" | ❌ absentes |
| Déploiement Vercel | ❌ pas fait |

Fichiers clés :
- Landing : `front/src/components/home/Hero.tsx`
- Upload UI : `front/src/components/features/DropeZone.tsx`
- API upload : `front/src/app/api/upload/route.ts`
- API extract : `front/src/app/api/extract/route.ts`
- Design tokens : `front/src/app/globals.css`
- PDF démo : `front/public/facture_demo.pdf`

---

## Étapes

### Étape 1 — Route `/api/analyze` : extraction PDF réelle
**But :** une seule route qui reçoit le PDF et retourne le JSON structuré.

- Créer `front/src/app/api/analyze/route.ts` (remplace l'usage de `/api/extract`)
- Reçoit le PDF en FormData
- Re-valide (magic bytes `%PDF-`, taille 5 Mo) — réutiliser la logique de `/api/upload`
- Convertit le PDF en base64, l'envoie à Claude via le bloc `document` du SDK
- Prompt few-shot du backlog V1 (type / emetteur / date_emission / date_expiration / conditions_renouvellement / confidence)
- Parse la réponse JSON de Claude
- Modèle : `claude-haiku-4-5-20251001`

**Verify :** `curl -F file=@public/facture_demo.pdf localhost:3000/api/analyze` retourne un JSON avec les champs attendus.

### Étape 2 — Validation + calcul statut (`/lib/validation.ts`)
**But :** transformer la sortie brute Claude en données affichables.

- `front/src/lib/validation.ts`
- Vérifier cohérence dates (expiration > émission)
- Calculer `statut` : `actif` / `expire_bientot` (< 90j) / `expire`
- Calculer `joursRestants`
- Flag warning si `confidence < 0.8`
- Appelé dans `/api/analyze` avant de retourner la réponse

**Verify :** test unitaire Vitest sur les 3 cas de statut + date incohérente.

### Étape 3 — Composant `DocumentResult`
**But :** afficher le résultat à l'écran (remplace le toast succès).

- `front/src/components/features/DocumentResult.tsx`
- Badge statut coloré (vert/orange/rouge — tokens sémantiques de `globals.css`)
- Dates en Geist Mono (`var(--font-mono)`)
- Score confidence + warning si < 0.8
- Champs éditables (inputs contrôlés) avant génération calendrier
- `DropeZone` passe le résultat au `Hero` (étendre le flux `onResult` ou lever l'état)

**Verify :** upload `facture_demo.pdf` → la carte résultat s'affiche avec dates et badge.

### Étape 4 — Génération calendrier `.ics` (`/lib/calendar.ts`)
**But :** bouton "Ajouter au calendrier".

- `front/src/lib/calendar.ts` — génère iCal (RFC 5545)
- 4 événements rappel : J-90, J-30, J-15, J-7 avant expiration
- Titre : `[SmartConforme] Expiration [type] - [emetteur]`
- Bouton "Télécharger .ics" (blob download) dans `DocumentResult`
- Bonus : lien "Ajouter à Google Calendar" pré-rempli

**Verify :** le `.ics` téléchargé s'importe sans erreur dans Google/Apple Calendar, 4 événements présents.

### Étape 5 — Enrichir la landing page
**But :** crédibilité visuelle pour le recruteur.

- Sous la DropZone dans `Hero.tsx` :
  - Section "Comment ça marche" (3 étapes : Upload → Extraction IA → Alertes)
  - Section "Documents gérés" (RC Pro, attestation URSSAF, Qualiopi, KBIS, habilitations, DPE)
- Respecter le design system (Satoshi titres, espacement comfortable, palette restrained)
- Ton : éviter "projet perso", "apprentissage", "junior" (cf. backlog V1)

**Verify :** page complète, cohérente, scroll fluide, responsive correct.

### Étape 6 — Déploiement Vercel
**But :** URL live partageable.

- Projet Vercel sur le repo
- Var d'env : `ANTHROPIC_API_KEY`
- Test end-to-end avec `facture_demo.pdf` en prod
- README à jour : démo live + stack + positionnement métier

**⚠️ Vercel : déployer uniquement sur demande explicite de Julien.**

**Verify :** URL prod → upload démo → résultat → `.ics`. Flow complet OK.

---

## Notes techniques

- Claude SDK : envoi PDF via bloc `{ type: "document", source: { type: "base64", media_type: "application/pdf", data: ... } }`
- `pnpm` exclusivement
- Code verbeux + commenté (FR pour les commentaires UI existants, suivre le style en place)
- Tests : Vitest (pas Jest — malgré la mention Jest dans les vieux backlogs)
