/**
 * Fetches portrait paintings from The Art Institute of Chicago API.
 * https://api.artic.edu/docs/
 * CC0 for public domain works - No API key required.
 */

const https = require('https');

const ARTIC_SEARCH = 'https://api.artic.edu/api/v1/artworks/search';
const ARTIC_IIIF = 'https://www.artic.edu/iiif/2';
const SOURCE_NAME = 'The Art Institute of Chicago';

const FIELDS = 'id,title,artist_display,artist_title,date_display,date_start,medium_display,credit_line,image_id,thumbnail,is_public_domain,alt_text,artwork_type_title';

// Searches to run — results are merged and deduplicated
const PORTRAIT_QUERIES = ['portrait', 'figure painting', 'bust painting'];

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function isPainting(item) {
  const type = (item.artwork_type_title || '').toLowerCase();
  return type === 'painting';
}

function mapToArtwork(item) {
  const imageId = item.image_id;
  // Use full resolution via IIIF
  const imageUrl = imageId
    ? `${ARTIC_IIIF}/${imageId}/full/full/0/default.jpg`
    : '';
  const thumb = item.thumbnail;
  return {
    id: `artic-${item.id}`,
    title: item.title || 'Untitled',
    artist: item.artist_display || item.artist_title || 'Unknown Artist',
    year: item.date_display || item.date_start?.toString() || 'Unknown',
    imageUrl,
    imageWidth: thumb?.width,
    imageHeight: thumb?.height,
    medium: item.medium_display || 'Unknown',
    culture: 'Unknown',
    period: 'Unknown',
    creditLine: item.credit_line || SOURCE_NAME,
    source: SOURCE_NAME,
    classification: item.artwork_type_title || 'Painting',
    artistDisplayDate: item.artist_display || undefined,
    imageDescription: item.alt_text || undefined,
  };
}

async function fetchArticArtworks(maxCount = 400) {
  const seen = new Set();
  const results = [];
  const limit = 100;

  for (const query of PORTRAIT_QUERIES) {
    if (results.length >= maxCount) break;
    let page = 1;

    while (results.length < maxCount) {
      const url = `${ARTIC_SEARCH}?q=${encodeURIComponent(query)}&limit=${limit}&page=${page}&fields=${FIELDS}`;
      let res;
      try {
        res = await fetchJson(url);
      } catch (e) {
        console.warn(`  Art Institute: search failed for "${query}":`, e.message);
        break;
      }
      const items = res.data || [];
      if (items.length === 0) break;

      for (const item of items) {
        if (!item.is_public_domain) continue;
        if (!item.image_id) continue;
        if (!item.title) continue;
        if (!isPainting(item)) continue;
        if (seen.has(item.id)) continue;

        seen.add(item.id);
        results.push(mapToArtwork(item));
        if (results.length >= maxCount) break;
      }

      page++;
      if (items.length < limit) break;
    }

    if (results.length > 0 && results.length % 100 === 0) {
      console.log(`  Art Institute: fetched ${results.length} so far...`);
    }
  }

  return results;
}

module.exports = { fetchArticArtworks, SOURCE_NAME };
