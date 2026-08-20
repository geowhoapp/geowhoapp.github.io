# GeoWho public site (GitHub Pages)

Minimal landing + Privacy + Support + Credits for App Store / RevenueCat URLs.

**Entscheidung 2026-08-19:** Keine Extra-Domain. Pflicht-URLs über eine **GitHub-Organisation** (nicht über User `snottorr`).

## URL (kostenlos, ohne Domainkauf)

| Setup | Beispiel-URL | GitHub-User sichtbar? |
|-------|--------------|------------------------|
| User-Pages | `https://snottorr.github.io/…` | **Ja — nicht nutzen** |
| **Org-Pages (gewählt)** | `https://geowhoapp.github.io/` | Nein, nur Org-Name |
| Cloudflare `*.pages.dev` | Fallback, falls Org nicht geht | Nein |

Ziel-URLs (Host live 2026-08-19):

- Privacy: `https://geowhoapp.github.io/privacy.html`
- Impressum: `https://geowhoapp.github.io/impressum.html`
- Support: `https://geowhoapp.github.io/support.html`
- Credits: `https://geowhoapp.github.io/credits.html`
- Start: `https://geowhoapp.github.io/`

Eintragen: RC-Paywall Privacy · ASC App-Informationen Support/Marketing · ASC Listing Privacy. SoT: [`docs/gtm/ECKDATEN.md`](../docs/gtm/ECKDATEN.md). Legal: [`docs/legal/SITE_RECHTSSICHERHEIT.md`](../docs/legal/SITE_RECHTSSICHERHEIT.md) · Abschluss: [`docs/plans/2026-08-19-003-legal-site-portrait-rights-complete.md`](../docs/plans/2026-08-19-003-legal-site-portrait-rights-complete.md).

Apple braucht nur HTTPS + öffentlich erreichbar. `github.io` einer **Org** reicht; Gist / `raw.githubusercontent.com` nicht.

Das Spiel-Repo `snottorr/GeoWho` bleibt **privat**. Nur der Ordner `site/` kommt in ein **öffentliches** Org-Repo (kein App-Code, keine Keys).

## Einmal einrichten

1. GitHub → **New organization** → Name **`geowhoapp`** (404 am 2026-08-19, also frei; `geowho` ist ein fremder User).
2. Öffentliches Repo **`geowhoapp.github.io`** (genau so heißen, dann ist die Root-URL die Org-Site).
3. Inhalt von `site/` (dieses Workspace) als Root pushen.
4. Settings → Pages → Deploy from branch `main` / `(root)`.
5. Nach ~1 Min prüfen: `privacy.html` und `support.html` im Inkognito-Fenster.
6. Dieselben URLs in ASC (Support + Privacy Policy) und RevenueCat-Paywall.

## Lokal ansehen

```bash
cd site && python3 -m http.server 8080
# http://localhost:8080
```

## Was vor Live noch in den HTML-Dateien

- [x] E-Mail / Kontakt: nur via `js/contact-guard.js` (kein Klartext in HTML/README) — SoT intern [`docs/gtm/ECKDATEN.md`](../docs/gtm/ECKDATEN.md)
- [x] Impressum: Pflichtangaben § 5 DDG + § 36 VSBG (`impressum.html`)
- [x] Privacy auf Art.-13-Niveau (`privacy.html`)
- [x] Kontakt anti-harvest: `js/contact-guard.js` (kein Klartext-Mail/Tel im HTML-Source)
- [x] Footer-Link **„Impressum“** auf allen Seiten
- [ ] App-Store-Button-Link wenn die App live ist
- [x] Org-Pages live (`https://geowhoapp.github.io/`, 2026-08-19)
- [x] Nach HTML-Änderung: Inhalt von `site/` nach `geowhoapp/geowhoapp.github.io` pushen (2026-08-19)
- [ ] Credits gegen [`docs/legal/ATTRIBUTION.md`](../docs/legal/ATTRIBUTION.md)

**Deploy-Hinweis:** Öffentliches Pages-Repo darf **keine** Klartext-Mail/Tel/Anschrift in README enthalten (Scraping). Kontakt nur Impressum/Privacy nach JS-Reveal.
