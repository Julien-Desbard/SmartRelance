# SmartConforme — Progress

> Suivi d'avancement du MVP recruteur. Voir `PLAN.md` pour le détail des étapes.
> Mettre à jour à la fin de chaque session.

**Dernière mise à jour :** 2026-06-01
**Statut global :** 🟡 En cours — landing + upload OK, extraction non connectée

---

## Checklist

### Étape 1 — `/api/analyze` extraction PDF réelle
- [ ] Créer `front/src/app/api/analyze/route.ts`
- [ ] Réception FormData + re-validation (magic bytes, 5 Mo)
- [ ] PDF → base64 → Claude (bloc `document`)
- [ ] Prompt few-shot V1
- [ ] Parse JSON réponse Claude
- [ ] Verify : `curl` retourne le JSON attendu

### Étape 2 — Validation + statut
- [ ] `front/src/lib/validation.ts`
- [ ] Cohérence dates + calcul `statut` + `joursRestants`
- [ ] Flag warning confidence < 0.8
- [ ] Test Vitest (3 statuts + date incohérente)

### Étape 3 — `DocumentResult`
- [ ] `front/src/components/features/DocumentResult.tsx`
- [ ] Badge statut coloré
- [ ] Dates en Geist Mono
- [ ] Champs éditables
- [ ] Câblage DropZone → Hero
- [ ] Verify : carte résultat s'affiche après upload

### Étape 4 — Calendrier `.ics`
- [ ] `front/src/lib/calendar.ts`
- [ ] 4 rappels (J-90/30/15/7)
- [ ] Bouton téléchargement `.ics`
- [ ] (bonus) lien Google Calendar
- [ ] Verify : import calendrier sans erreur

### Étape 5 — Landing enrichie
- [ ] Section "Comment ça marche"
- [ ] Section "Documents gérés"
- [ ] Verify : page cohérente + responsive

### Étape 6 — Déploiement Vercel ⚠️ sur demande explicite
- [ ] Projet Vercel + var d'env `ANTHROPIC_API_KEY`
- [ ] Test end-to-end en prod
- [ ] README à jour
- [ ] Verify : flow complet en prod

---

## Déjà fait (avant ce plan)

- ✅ Landing hero + DropZone drag & drop fonctionnels
- ✅ `/api/upload` : validation MIME + magic bytes + taille
- ✅ Design system complet (tokens CSS, polices Satoshi/Instrument/Geist Mono)
- ✅ Footer + lien LinkedIn
- ✅ Toasts feedback (succès/warning/erreur)
- ✅ Test DropZone (`DropeZone.test.tsx`)

## Dette / à nettoyer (non bloquant)

- `/api/extract/route.ts` : route obsolète (reçoit du texte, pas un PDF) → sera remplacée par `/api/analyze`, à supprimer ensuite
- Typo nom de fichier : `DropeZone.tsx` (devrait être `DropZone.tsx`) — laisser tel quel, non prioritaire
- `front/public/facture_demo.pdf` : c'est une facture, pas un document réglementaire. Vérifier qu'il convient pour la démo extraction (idéalement une attestation/certificat avec dates de validité)

---

## Journal de session

### 2026-06-01
- Revue complète du projet + plan
- Création `PLAN.md` + `PROGRESS.md`
- Décision scope MVP : extraction réelle → affichage → `.ics` → landing → deploy. Exclu : rate limiting, auth, dashboard, Python.
