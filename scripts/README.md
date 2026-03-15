# Scripts

## setup-node.sh (install Node.js / npm)

If you get `command not found: npm`, Node.js is not installed. From the **project root** run:

```bash
bash scripts/setup-node.sh
```

Then load Node in your terminal. Use **one** of:

- `source ~/.nvm/nvm.sh`  
- or, if you have a `.zshrc`: `source ~/.zshrc`

Then in the project: `npm install && npm start`.

---

## process-nga-data.js

This script downloads artwork data from the National Gallery of Art Open Data repository and converts it to JSON format for the app.

### What it does:

1. Downloads CSV files from National Gallery of Art GitHub
2. Parses the CSV data
3. Filters for Open Access (public domain) artworks only
4. Converts to JSON format matching the app's structure
5. Saves to `data/artworks.json`

### How to use:

```bash
npm run process-data
```

Or directly:

```bash
node scripts/process-nga-data.js
```

### Output:

The script creates `data/artworks.json` with artwork data in this format:

```json
[
  {
    "id": "12345",
    "title": "Artwork Title",
    "artist": "Artist Name",
    "year": "1900",
    "imageUrl": "https://...",
    "medium": "Oil on canvas",
    "culture": "American",
    "period": "20th Century",
    "creditLine": "National Gallery of Art",
    "source": "National Gallery of Art"
  }
]
```

### Troubleshooting:

**Error: "Failed to download"**
- Check your internet connection
- Verify the NGA GitHub URLs are still valid
- The CSV structure might have changed

**Error: "No open access artworks found"**
- The filtering logic might need adjustment
- Check the actual CSV field names from NGA
- Some artworks might not have the expected copyright fields

**Note:** You may need to adjust the field mapping in the script based on the actual CSV structure from National Gallery of Art. Check their documentation for the exact field names.

---

## process-all-artworks.js (all sources)

Fetches artworks from NGA, Met, Cleveland, and Art Institute of Chicago, then merges into `data/artworks.json`.

```bash
npm run process-data:all
```

### Met Museum API blocking

The Met API sometimes returns HTML instead of JSON when called from certain regions (Incapsula bot protection). If Met fails:

1. **GitHub Actions** (recommended): Push the repo to GitHub, go to Actions → "Fetch artworks" → Run workflow. The workflow runs on US-based servers where the Met API usually works. Download `artworks.json` from the workflow artifacts.
2. **VPN**: Connect to a US VPN, then run `npm run process-data:all` locally.
