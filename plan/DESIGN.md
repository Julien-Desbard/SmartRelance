# Design System — SmartConform

## Product Context
- **What this is:** Outil de suivi de conformité documentaire par IA — upload de documents réglementaires, extraction automatique des dates de validité, calendrier d'échéances avec alertes graduées.
- **Who it's for:** Dirigeants TPE/PME, responsables qualité, cabinets comptables (France).
- **Space/industry:** Compliance / Regtech — segment TPE/PME françaises.
- **Project type:** Web app (landing page + dashboard) — aussi projet portfolio.

## Aesthetic Direction
- **Direction:** Industrial/Utilitarian — function-first, propreté Linear/Vercel, pas de decoration superflue.
- **Decoration level:** Minimal — la typographie et l'espacement font tout le travail. Les seuls éléments visuels sont les indicateurs de statut (vert/orange/rouge) et les icônes fonctionnelles.
- **Mood:** Un outil d'ingénieur bien construit. Précis, fiable, pas de bullshit. Inspire confiance sans être intimidant. L'anti-thèse des sites compliance US qui abusent des gradients violet.
- **Reference sites:** Linear (linear.app), Vercel (vercel.com). À éviter : Vanta, Drata (trop enterprise, trop violet).

## Typography
- **Display/Hero:** Satoshi 700–900 — Géométrique, moderne, distinctif sans être flashy. Évoque la précision.
- **Body:** Instrument Sans 400–700 — Excellente lisibilité en petit, propre, neutre. Se marie avec Satoshi sans compétition.
- **UI/Labels:** Instrument Sans (same as body)
- **Data/Tables:** Geist Mono (tabular-nums) — Pour dates, compteurs, statuts. Le mono renforce le côté "outil précis".
- **Code:** Geist Mono
- **Loading:** Google Fonts CDN — `https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap` + Fontshare pour Satoshi
- **Scale:** 12px / 14px / 16px (base) / 20px / 24px / 32px / 48px / 56px

## Color
- **Approach:** Restrained — 1 accent + neutrals. La couleur est rare et signifiante (statut, pas décoration).
- **Primary:** `#2563EB` — Bleu vif (pas violet). Actions, liens, boutons primaires. Fiabilité sans cliché compliance.
- **Primary hover:** `#1D4ED8`
- **Primary subtle:** `#EFF6FF`
- **Neutrals (cool Zinc):** `#FAFAFA` (surface) → `#F4F4F5` (background) → `#E4E4E7` (border) → `#A1A1AA` (text muted) → `#71717A` → `#3F3F46` (text secondary) → `#27272A` → `#18181B` (headings) → `#09090B` (darkest)
- **Semantic:**
  - Success: `#16A34A` / bg `#F0FDF4` — Document à jour
  - Warning: `#F59E0B` / bg `#FFFBEB` — Expiration proche (< 90j)
  - Error: `#DC2626` / bg `#FEF2F2` — Document expiré
  - Info: `#2563EB` / bg `#EFF6FF` — Extraction en cours, information
- **Dark mode:**
  - Surfaces: `#09090B` → `#18181B` → `#27272A`
  - Text: `#FAFAFA` (primary), `#D4D4D8` (secondary), `#71717A` (muted)
  - Primary: `#3B82F6` (slightly brighter for contrast)
  - Semantic: saturation réduite de ~15%

## Spacing
- **Base unit:** 4px
- **Density:** Comfortable
- **Scale:** 2xs(2px) xs(4px) sm(8px) md(16px) lg(24px) xl(32px) 2xl(48px) 3xl(64px)

## Layout
- **Approach:** Grid-disciplined — alignement strict, colonnes prévisibles.
- **Grid:** Landing page 12 colonnes, Dashboard sidebar (240px fixe) + contenu principal.
- **Max content width:** 1200px
- **Border radius:** sm: 4px, md: 8px, lg: 12px, full: 9999px (badges, pills)

## Motion
- **Approach:** Minimal-functional — uniquement transitions qui aident à comprendre (upload progress, changement de statut, apparition d'alerte). Pas d'animations d'entrée ni de scroll effects.
- **Easing:** enter(ease-out / cubic-bezier(0.16, 1, 0.3, 1)) exit(ease-in) move(ease-in-out)
- **Duration:** micro(100ms) short(200ms) medium(300ms)

## Component Patterns
- **Status badges:** Pill shape (border-radius full), mono font, dot indicator + texte. Colors = semantic only.
- **Cards:** Surface bg, 1px border, radius-lg, hover = border darkens. Pas de shadow.
- **Buttons:** Primary (filled blue), Secondary (outlined), Ghost (text only), Danger (filled red).
- **Alerts:** Full-width, left-aligned icon + text, semantic bg + border. Pas de shadow.
- **Tables:** Header in mono uppercase, data rows with mono dates (tabular-nums), badge statut in last column.
- **Inputs:** 1px border, radius-md, focus = primary border + subtle ring (3px primary-subtle).
- **Conformity meter:** Track (border color) + fill (gradient success→warning), mono labels.

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-17 | Initial design system created | Industrial/Utilitarian direction, inspired by Linear/Vercel. Research showed compliance SaaS space dominated by violet/gradient enterprise aesthetics — SmartConform differentiates with restrained, precise, function-first design. |
| 2026-03-17 | Satoshi chosen over Inter/Geist for display | Distinctive geometric sans-serif. Not overused like Inter. Pairs well with Instrument Sans for body. |
| 2026-03-17 | Blue primary over violet/teal | Violet = Vanta/Drata territory. Teal = Secureframe. Blue is neutral-trustworthy without being derivative. |
| 2026-03-17 | Dark mode included from day 1 | Target audience includes tech-savvy dirigeants. Portfolio signal for recruteurs. CSS variables make it trivial. |
| 2026-03-17 | Geist Mono for data | tabular-nums support essential for date alignment in tables and cards. Reinforces "precision tool" positioning. |
