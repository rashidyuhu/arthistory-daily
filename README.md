# ArtHistory Daily

A production-ready Expo (TypeScript) iOS app that displays one artwork per day from Open Access / Public Domain sources.

## Features

- **One artwork per day**: The same artwork is shown to all users globally
- **3D flip card animation**: Tap to reveal artwork details
- **Read-only**: No login, uploads, favorites, or streaks
- **Open Access**: All artworks from National Gallery of Art Open Data
- **Accessibility**: Explicit buttons and proper labels
- **Production-ready**: Error handling, loading states, and caching

## Setup

1. Install dependencies:
```bash
npm install
```

2. Update the artworks endpoint in `src/services/useArtworks.ts`:
   - Replace `https://YOUR_DOMAIN/artworks.json` with your actual endpoint

3. Run the app:
```bash
npm start
```

Then press `i` for iOS simulator or scan the QR code with Expo Go.

## Project Structure

```
/app
  /index.tsx          # Main app screen
  /_layout.tsx        # Expo Router layout
/src
  /components
    ArtworkFlipCard.tsx  # Flip card component with 3D animation
  /services
    useArtworks.ts       # React Query hook for fetching artworks
    getDailyArtwork.ts   # Daily artwork selection logic
  types.ts               # TypeScript types
  theme.ts               # Design system (colors, spacing, typography)
```

## Daily Artwork Logic

The app uses a deterministic algorithm to select the artwork of the day:

- **Epoch date**: January 1, 2024, 00:00:00 UTC
- **Day index**: `floor((nowUTC - epochUTC) / 86400)`
- **Artwork selection**: `artworks[dayIndex % artworks.length]`

This ensures all users see the same artwork on the same day, globally.

## Data Format

The app expects a JSON array from the endpoint:

```json
[
  {
    "id": "string",
    "title": "string",
    "artist": "string",
    "year": "string",
    "imageUrl": "string",
    "medium": "string",
    "culture": "string",
    "period": "string",
    "creditLine": "string",
    "source": "string"
  }
]
```

## Credits

Artworks provided by the National Gallery of Art (USA), Open Access.

## License

This app is read-only and does not store or upload any user data.
