# Git og GitHub – oppsett

**GitHub brukes for kode (rashidyuhu). Expo/EAS brukes for build (huskmelk) – ingen endring der.**

## Steg 1: Opprett GitHub-repo

1. Gå til [github.com](https://github.com) og logg inn som **rashidyuhu**
2. Klikk **+** → **New repository**
3. Navn: f.eks. `arthistory-daily`
4. Velg **Private** eller **Public**
5. Ikke kryss av for "Add a README" (du har allerede kode)
6. Klikk **Create repository**

## Steg 2: Koble prosjektet til GitHub

Åpne Terminal og kjør (erstatt `DITT-BRUKERNAVN` og `REPO-NAVN` med dine verdier):

```bash
cd /Users/rashidakrim/Documents/arthistory

# Legg til GitHub som remote
git remote add origin https://github.com/DITT-BRUKERNAVN/REPO-NAVN.git
```

Eksempel: `git remote add origin https://github.com/rashidyuhu/arthistory-daily.git`

## Steg 3: Legg til filer, commit og push

```bash
# Legg til alle endringer
git add .

# Commit med melding
git commit -m "Legg til multi-museum support og GitHub Actions"

# Push til GitHub (første gang)
git push -u origin main
```

Hvis du får feil om `main` vs `master`, prøv:

```bash
git branch -M main
git push -u origin main
```

## Steg 4: Kjør GitHub Actions (hent Met-kunstverk)

1. Gå til repoet på GitHub
2. Klikk **Actions**
3. Velg **Fetch artworks** i venstremenyen
4. Klikk **Run workflow** → **Run workflow**
5. Vent til jobben er ferdig (grønn ✓)
6. Klikk på den ferdige jobben → **artworks** under Artifacts
7. Last ned `artworks.zip`, pakk ut og erstatt `data/artworks.json`

## Merk: Expo/EAS

Bygg og App Store bruker fortsatt **huskmelk**-kontoen. Du trenger ikke endre noe i app.json eller eas.json. GitHub (rashidyuhu) er kun for kodeversjonering.

## Nyttige Git-kommandoer

| Kommando | Beskrivelse |
|----------|-------------|
| `git status` | Se hva som er endret |
| `git add .` | Legg til alle endringer |
| `git commit -m "melding"` | Lagre med melding |
| `git push` | Send til GitHub |
| `git pull` | Hent endringer fra GitHub |
