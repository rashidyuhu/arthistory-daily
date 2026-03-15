# App-tilkoblinger og konfigurasjon

## Oversikt

| Tilkobling | Hvor | Konto |
|------------|------|-------|
| Kunstverk-data | `https://yuhu.no/dailyarthistory/artworks.json` | ✅ Fungerer |
| Lokal fallback | `data/artworks.json` (bundlet i appen) | ✅ Brukes ved nettverksfeil |
| Kunstverk-bilder | NGA, Cleveland, Met, Artic (eksterne CDN-er) | ✅ Lastes per kunstverk |
| **Expo/EAS** | projectId i app.json | **huskmelk** – brukes for build og App Store |
| **GitHub** | remote origin | **rashidyuhu** – brukes for kodeversjonering |

## Konto-oppsett

- **GitHub (rashidyuhu)**: Kode, versjonering, GitHub Actions
- **Expo/EAS (huskmelk)**: Build, iOS-sertifikater, App Store-innsending

Ingen endringer i app.json eller eas.json nødvendig.

## Endre kunstverk-URL

Rediger `src/services/useArtworks.ts`:

```typescript
const ARTWORKS_ENDPOINT = 'https://din-domene.no/artworks.json';
```

Last opp `data/artworks.json` til den nye URL-en.
