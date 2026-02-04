# SmartRelance — Backlog V1 (sans compte)

## Résumé

Version de démonstration permettant d'envoyer ou relancer une facture sans créer de compte. Limite : 3 factures/jour par IP.

---

## Stack technique V1

- **Framework** : Next.js (front + API routes)
- **Extraction PDF** : Claude API (lecture directe du PDF)
- **Envoi email** : Nodemailer + Gmail SMTP
- **Rate limiting** : Upstash Redis (gratuit)
- **Déploiement** : Vercel
- **Styling** : au choix (Tailwind recommandé)

---

## Étapes de développement

### 1. Initialisation projet

**Actions :**

- Créer projet Next.js avec App Router
- Configurer TypeScript
- Installer Tailwind CSS
- Créer structure de dossiers : `/app`, `/components`, `/lib`, `/templates`

**Technos :** Next.js, TypeScript, Tailwind CSS, pnpm

---

### 2. Landing page

**Actions :**

- Créer page d'accueil avec accroche claire
- Ajouter lien de téléchargement d'une facture démo (PDF statique dans `/public`)
- Intégrer zone de drag & drop pour upload PDF

**Technos :** React, react-dropzone (ou équivalent)

---

### 3. Upload et validation du PDF

**Actions :**

- Créer API route `/api/upload`
- Valider que le fichier est un PDF (vérifier MIME type + magic bytes)
- Limiter la taille (ex: 5 Mo max)
- Stocker temporairement le fichier (en mémoire ou `/tmp`)

**Technos :** Next.js API Routes, formidable ou busboy pour le parsing multipart

---

### 4. Extraction des données via Claude

**Actions :**

- Créer API route `/api/extract`
- Envoyer le PDF à Claude API avec prompt d'extraction
- Extraire : nom client, email client, montant TTC, date échéance, numéro facture
- Retourner les données au frontend

**Prompt exemple :**

```
Lis cette facture et renvoie uniquement un JSON avec : 
- nom_client
- email_client  
- montant_ttc
- date_echeance (format YYYY-MM-DD)
- numero_facture
```

**Technos :** Claude API (@anthropic-ai/sdk)

---

### 5. Détection des anomalies

**Actions :**

- Valider format email (regex)
- Vérifier cohérence montant (> 0, < seuil raisonnable)
- Vérifier que la date d'échéance est lisible
- Retourner les anomalies détectées au frontend

**Technos :** Logique JS/TS côté API

---

### 6. Affichage des données extraites

**Actions :**

- Créer composant d'affichage des infos extraites
- Afficher les anomalies en warning si présentes
- Permettre à l'utilisateur de valider avant de continuer

**Technos :** React

---

### 7. Choix de l'action (envoi ou relance)

**Actions :**

- Afficher 2 choix principaux : "Envoyer la facture" / "Relancer"
- Si "Relancer" : calculer le retard (date du jour - date échéance)
- Afficher les 3 tons avec celui recommandé en surbrillance :
  - < 7 jours : aimable (recommandé)
  - 7-30 jours : ferme (recommandé)
  - > 30 jours : mise en demeure (recommandé)
- L'utilisateur peut choisir un autre ton que celui suggéré

**Technos :** React

---

### 8. Génération de l'aperçu email

**Actions :**

- Créer 4 templates d'email (envoi initial + 3 tons de relance)
- Stocker les templates dans `/templates` (fichiers .ts ou .txt)
- Injecter les variables : nom, montant, numéro facture, date échéance
- Afficher l'aperçu complet à l'utilisateur
- Ajouter footer : "Envoyé via SmartRelance.com"

**Technos :** Template literals JS ou lib de templating simple

---

### 9. Rate limiting

**Actions :**

- Créer compte Upstash Redis (gratuit)
- Avant envoi : vérifier le compteur pour l'IP
- Si >= 3 aujourd'hui : bloquer + message "Limite atteinte, revenez demain"
- Si < 3 : incrémenter et continuer
- TTL du compteur : minuit (reset quotidien)

**Technos :** Upstash Redis (@upstash/redis)

---

### 10. Envoi de l'email

**Actions :**

- Créer API route `/api/send`
- Configurer Nodemailer avec Gmail SMTP
- Créer l'email :
  - Objet : "Facture n°XXX — [Nom entreprise]" ou "Relance facture n°XXX"
  - Corps : template choisi
  - PJ : le PDF original
  - Footer : signature SmartRelance
- Envoyer à l'adresse extraite

**Config Gmail requise :**

- Activer 2FA sur le compte Gmail
- Générer mot de passe d'application
- Variables env : `GMAIL_USER`, `GMAIL_APP_PASSWORD`

**Technos :** Nodemailer

---

### 11. Confirmation

**Actions :**

- Afficher message de succès : "Email envoyé à [adresse]"
- Proposer de traiter une nouvelle facture
- En cas d'erreur : afficher message explicite

**Technos :** React

---

### 12. Déploiement

**Actions :**

- Créer projet sur Vercel
- Configurer variables d'environnement :
  - `ANTHROPIC_API_KEY`
  - `GMAIL_USER`
  - `GMAIL_APP_PASSWORD`
  - `UPSTASH_REDIS_REST_URL`
  - `UPSTASH_REDIS_REST_TOKEN`
- Déployer et tester

**Technos :** Vercel

---

## Variables d'environnement

```env
ANTHROPIC_API_KEY=sk-ant-...
GMAIL_USER=noreply.smartrelance@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...
```

---

## Parcours utilisateur V1

1. Arrive sur la landing page
2. Télécharge la facture démo (optionnel) ou uploade sa propre facture
3. Voit les infos extraites + anomalies éventuelles
4. Choisit "Envoyer" ou "Relancer"
5. Si relance : voit le ton suggéré, peut en choisir un autre
6. Voit l'aperçu de l'email
7. Confirme l'envoi
8. Reçoit confirmation ou message de limite atteinte
