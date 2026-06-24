# SmartConform — Backlog V4 (brique Python + IA avancée)

## Résumé

Extension de SmartConform avec un microservice Python intégrant de l'IA avancée : extraction renforcée (pdfplumber + Claude), base de connaissance réglementaire par secteur d'activité (RAG), et vérificateur de conformité de contenu pour détecter les incohérences et non-conformités dans les documents extraits. Transforme SmartConform en projet hybride JS/Python, aligné avec les compétences les plus recherchées en 2026-2027.

**Timing :** après la V3 fonctionnelle et les fondamentaux Python maîtrisés. Le scope exact est à affiner selon les retours d'usage de la V3 et les apprentissages Python acquis.

## Prérequis

- V3 fonctionnelle
- Fondamentaux Python maîtrisés (syntaxe, virtualenv, pip, async, types)

---

## Pourquoi Python

100% des offres d'emploi IA en France exigent Python. JavaScript/TypeScript n'apparaît dans aucune offre IA. Ce n'est pas une option, c'est un passage obligé pour quiconque veut travailler sur des projets IA.

Intégrer Python directement dans SmartConform permet de démontrer la capacité à travailler avec les deux écosystèmes sur un projet à valeur métier réelle — pas sur un tutoriel déconnecté.

---

## Stack technique ajoutée

- **Langage** : Python 3.12+
- **Framework API** : FastAPI
- **Extraction PDF Python** : pdfplumber (ou pymupdf)
- **LLM** : Claude API (SDK Python `anthropic`)
- **RAG** : ChromaDB (local) + sentence-transformers pour les embeddings
- **Déploiement microservice** : Railway ou conteneur Docker sur Render
- **Communication** : API REST appelée par le frontend Next.js

---

## Fonctionnalités V4

### Option A — Extraction avancée (microservice Python)

Remplace ou complète l'extraction Claude directe du frontend Next.js par un pipeline Python dédié.

**Valeur ajoutée vs V1 :**
- `pdfplumber` extrait le texte structuré du PDF avant d'envoyer à Claude → meilleure qualité sur les documents scannés, multi-colonnes, ou avec tableaux
- Pipeline de validation plus riche côté Python (SIRET, dates complexes, cross-check entre champs)
- Possibilité d'enrichissement via API publique (API SIRENE pour vérifier l'existence de l'organisme émetteur)

```
Architecture du pipeline :
POST /extract
1. Reçoit le PDF en base64
2. pdfplumber extrait le texte brut structuré
3. Claude API (Python SDK) structure les données
4. Validation Python (dates, types, cohérence)
5. Enrichissement optionnel (API SIRENE)
6. Retourne le JSON enrichi au frontend Next.js
```

---

### Option B — RAG réglementaire par secteur d'activité

Ajoute une couche de connaissance sectorielle pour identifier les obligations manquantes.

**Comment ça fonctionne :**
- L'utilisateur renseigne son code NAF (ou son SIRET, et on le récupère via API SIRENE)
- Le système croise le code NAF avec une base de connaissance des obligations réglementaires par secteur
- Il identifie les documents que l'utilisateur devrait avoir mais n'a pas encore uploadés
- Il génère un rapport de "gap analysis" : "Votre entreprise est dans le BTP (code NAF 4120A). Il vous manque : attestation décennale, carte BTP, document unique d'évaluation des risques."

**Base de connaissance :**
- Fichiers Markdown ou JSON statiques organisés par code NAF
- Sources : service-public.fr, légifrance, CCI, chambres des métiers
- Exemples de contenu :
  - BTP : décennale obligatoire, carte BTP, habilitations électriques, CACES, document unique
  - Restauration : licence, formation HACCP, ERP, assurance
  - Conseil/Formation : Qualiopi (si financement public), RC Pro, attestation URSSAF
  - Santé : diplômes, assurance RCP, inscription ordre, DPC

**Stack RAG :**
- Embeddings : `sentence-transformers` (modèle `all-MiniLM-L6-v2`)
- Base vectorielle : ChromaDB (local, simple, pas de service externe)
- Recherche : similarity search sur le code NAF + description activité → obligations applicables

---

### Option C — Vérificateur de conformité de contenu

C'est l'enrichissement issu de la dernière idée soumise. Plutôt que de simplement extraire les données, le système analyse le contenu des documents pour détecter des anomalies et des non-conformités.

**Exemples de détections :**
- **Incohérence de dates** : date d'émission postérieure à la date d'expiration, durée de validité anormale pour le type de document (une RC Pro valable 5 ans = suspect)
- **Clauses manquantes dans un bail** : absence de clause résolutoire, absence de mention des charges récupérables, non-conformité loi ALUR
- **Montants incohérents** : loyer hors fourchette pour la zone géographique (si données disponibles)
- **Documents potentiellement falsifiés** : métadonnées PDF incohérentes (date de création ≠ date affichée), résolution anormalement basse (document scanné puis modifié)
- **Mentions obligatoires manquantes** : pour une attestation d'assurance, vérifier la présence du numéro de police, des garanties couvertes, de la zone géographique

**Comment ça fonctionne :**
- Après l'extraction des données (Option A), un second prompt Claude analyse le contenu brut pour détecter des anomalies
- Le résultat est un tableau d'alertes avec un niveau de sévérité : info / warning / critical
- Les alertes sont affichées dans le dashboard à côté du document concerné
- En V4+, le RAG (Option B) enrichit l'analyse : "Pour un document de type [X] dans le secteur [Y], les mentions obligatoires sont [Z] — mention manquante détectée"

```
Architecture complète V4 :

  Frontend Next.js
        │
        ├── /api/extract (existant, Next.js)
        │         └── → Appelle microservice Python si disponible
        │                   sinon → fallback Claude API direct (V1)
        │
        ├── /api/analyze (nouveau)
        │         └── → Microservice FastAPI Python
        │                   ├── Extraction avancée (pdfplumber + Claude)
        │                   ├── Vérification conformité contenu
        │                   └── Gap analysis (RAG sectoriel)
        │
        └── /api/obligations/[codeNaf] (nouveau)
                  └── → Microservice FastAPI Python
                            └── RAG : obligations par secteur
```

Le microservice Python est **optionnel et en fallback** : si indisponible, le frontend utilise l'extraction directe V1. Zéro régression sur le parcours utilisateur existant.

---

## Étapes de développement

### 1. Setup environnement Python

**Actions :**
- Créer un dossier `/services/python` dans le mono-repo (ou repo séparé `smartconform-py`)
- Configurer `pyproject.toml` (uv ou poetry)
- Installer : FastAPI, uvicorn, pdfplumber, anthropic, chromadb, sentence-transformers, pytest
- Créer `Dockerfile` pour le déploiement
- Créer `Makefile` avec commandes : `dev`, `test`, `build`, `lint`

**Technos :** Python 3.12+, FastAPI, Docker

---

### 2. Implémenter le microservice FastAPI — extraction avancée

**Actions :**
- Route `POST /extract` : reçoit PDF en base64, retourne JSON structuré
  1. pdfplumber extrait le texte brut
  2. Claude API (Python SDK) structure les données
  3. Validation Python (dates, types, cohérence)
  4. Retourne le JSON enrichi
- Route `GET /health` : healthcheck pour le monitoring
- Authentification par header `X-API-Key` (clé partagée avec Next.js)
- Tests unitaires Python avec pytest : fixtures PDF, mocks Claude

**Technos :** FastAPI, pdfplumber, anthropic (Python SDK), pytest

---

### 3. Implémenter le vérificateur de conformité

**Actions :**
- Route `POST /verify` : reçoit les données extraites + le texte brut du document
- Analyse via Claude avec un prompt spécialisé :
  ```
  Tu es un expert en conformité documentaire française. Analyse ce document et identifie :
  1. Les incohérences de dates ou de montants
  2. Les mentions obligatoires manquantes pour ce type de document
  3. Les signaux de falsification potentielle (métadonnées incohérentes)
  4. Les clauses manquantes si c'est un bail

  Pour chaque anomalie, retourne :
  - description (texte)
  - severite (info / warning / critical)
  - champ_concerne (quel champ du document)
  - recommandation (que faire)

  Retourne un JSON array.
  ```
- Intégrer les résultats dans la réponse de `/extract` (champ `anomalies[]`)
- Afficher les anomalies dans le dashboard avec des badges de sévérité

**Technos :** FastAPI, Claude API Python, logique de validation

---

### 4. Constituer la base de connaissance réglementaire

**Actions :**
- Créer le dossier `/data/obligations/` avec un fichier par secteur
- Structurer chaque fichier en JSON :

```json
{
  "codeNaf": "4120A",
  "secteur": "Construction de bâtiments résidentiels",
  "obligations": [
    {
      "type": "assurance",
      "nom": "Assurance décennale",
      "obligatoire": true,
      "duree_validite_mois": 12,
      "consequence_absence": "Interdiction d'exercer, amende jusqu'à 75 000€ et 6 mois d'emprisonnement",
      "source": "Article L241-1 du Code des assurances"
    },
    {
      "type": "habilitation",
      "nom": "Carte BTP",
      "obligatoire": true,
      "duree_validite_mois": null,
      "consequence_absence": "Amende de 4 000€ par salarié",
      "source": "Loi n° 2015-990 du 6 août 2015"
    }
  ]
}
```

- Couvrir au minimum 5 secteurs courants : BTP, restauration, conseil/formation, santé, transport
- Documenter les sources pour chaque obligation

**Technos :** JSON, recherche juridique

---

### 5. Implémenter le RAG sectoriel

**Actions :**
- Charger les fichiers d'obligations dans ChromaDB avec embeddings sentence-transformers
- Route `GET /obligations/{code_naf}` : retourne la liste des obligations pour un code NAF
- Route `POST /gap-analysis` : reçoit la liste des documents uploadés + le code NAF, retourne les documents manquants
- Logique de matching : pour chaque obligation du secteur, vérifier s'il existe un document uploadé du type correspondant et non expiré
- Retourner un rapport structuré :

```json
{
  "codeNaf": "4120A",
  "secteur": "Construction de bâtiments résidentiels",
  "conformite": 60,
  "documents_presents": ["assurance_decennale", "rc_pro"],
  "documents_manquants": [
    {
      "nom": "Carte BTP",
      "obligatoire": true,
      "consequence": "Amende de 4 000€ par salarié",
      "recommandation": "Demander auprès de la CIBTP de votre région"
    }
  ]
}
```

**Technos :** ChromaDB, sentence-transformers, FastAPI

---

### 6. Déployer le microservice

**Actions :**
- Déployer via Docker sur Railway (simple, Dockerfile existant)
- Configurer les variables d'environnement côté Railway
- Tester le healthcheck depuis le frontend
- Configurer le monitoring (healthcheck toutes les 5 minutes)

**Technos :** Railway, Docker

---

### 7. Connecter Next.js au microservice

**Actions :**
- Modifier `/api/extract` dans Next.js pour appeler le microservice Python en priorité
- Implémenter le fallback : si le microservice est indisponible (timeout 5s, erreur 5xx), utiliser l'extraction directe Claude API (V1)
- Variable d'environnement : `PYTHON_SERVICE_URL`
- Ajouter les anomalies détectées dans l'affichage du DocumentResult
- Ajouter la section "Obligations sectorielles" dans le dashboard (si code NAF renseigné)
- Afficher le rapport de gap analysis : documents manquants avec recommandations

**Technos :** Next.js, fetch, logique de fallback

---

### 8. Tests d'intégration

**Actions :**
- Tests E2E Playwright couvrant le parcours avec le microservice Python actif
- Tests de fallback (microservice down → extraction directe fonctionne toujours)
- Tests pytest côté Python : fixtures PDF réels (anonymisés), mocks Claude, tests de validation
- Test du RAG : vérifier que le gap analysis retourne les bons résultats pour un code NAF donné

**Technos :** Playwright, pytest

---

## Variables d'environnement ajoutées

```env
# Côté Next.js
PYTHON_SERVICE_URL=https://smartconform-py.up.railway.app
PYTHON_SERVICE_API_KEY=...
```

```env
# Côté microservice Python
ANTHROPIC_API_KEY=sk-ant-...
SERVICE_API_KEY=...
CHROMA_PERSIST_DIR=./data/chroma
```

---

## Parcours utilisateur V4

1. L'utilisateur uploade un document (flux identique V1-V3)
2. Le microservice Python extrait les données avec une meilleure qualité (pdfplumber pré-traite le PDF)
3. Le vérificateur de conformité analyse le contenu et détecte les anomalies
4. Les anomalies sont affichées dans le dashboard avec un niveau de sévérité (info / warning / critical)
5. L'utilisateur renseigne son code NAF (ou SIRET)
6. Le système identifie les obligations réglementaires de son secteur
7. Le rapport de gap analysis affiche les documents manquants avec les conséquences et les démarches de renouvellement
8. Si le microservice Python est indisponible, tout fonctionne normalement via le fallback V1

---

## Valeur portfolio de la V4

À l'issue de la V4, SmartConform démontre :

| Compétence | Démonstration concrète |
|---|---|
| Full Stack JS | Next.js App Router, TypeScript, API routes, auth, BDD |
| Python | FastAPI, traitement PDF, pipeline IA |
| IA appliquée | Claude API (JS + Python), RAG sectoriel, vérification de conformité |
| Cloud | Vercel (frontend) + Railway (microservice Python) |
| Qualité | Jest, RTL, Playwright, pytest, CI/CD GitHub Actions, Sentry |
| Domaine métier | 20 ans d'opérations B2B + audit & risques → outil qui résout un vrai problème |

Ce n'est pas "un projet qui montre que je sais coder". C'est "un outil B2B en production, construit par quelqu'un qui maîtrise la conformité et l'audit, avec une stack complète JS + Python + IA + Cloud".

---

## Tableau posts LinkedIn V4

| Étape | Angle du post | Signal recruteur |
|---|---|---|
| Microservice Python | Architecture hybride JS/Python sur un projet réel | Polyvalence, architecture |
| Extraction avancée | Pipeline IA multi-étapes (pdfplumber + Claude) | IA appliquée, pas du wrapping |
| Vérificateur conformité | L'IA ne se contente pas d'extraire, elle analyse et alerte | IA à valeur métier |
| RAG sectoriel | Base de connaissance juridique + gap analysis | IA avancée, RAG, embeddings |
| Fallback zéro régression | Si le microservice tombe, l'app continue de fonctionner | Résilience, architecture défensive |
