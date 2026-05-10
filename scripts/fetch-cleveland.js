/**
 * Fetches artworks from The Cleveland Museum of Art Open Access API.
 * https://openaccess-api.clevelandart.org/
 * CC0 - No API key required.
 */

const https = require('https');

const CLEVELAND_API = 'https://openaccess-api.clevelandart.org/api/artworks';
const SOURCE_NAME = 'The Cleveland Museum of Art';

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

const PORTRAIT_TERMS = [
  'portrait', 'bust', 'woman', 'man', 'child', 'person', 'people',
  'madonna', 'saint', 'face', 'figure', 'gentleman', 'lady', 'self-portrait',
];

function isPortraitPainting(item) {
  if ((item.type || '').toLowerCase() !== 'painting') return false;
  const text = `${item.title || ''} ${item.description || ''}`.toLowerCase();
  return PORTRAIT_TERMS.some(term => text.includes(term));
}

function mapToArtwork(item) {
  const img = item.images?.print || item.images?.web;
  const imageUrl = img?.url || '';
  return {
    id: `cleveland-${item.id}`,
    title: item.title || 'Untitled',
    artist: item.creators?.[0]?.description?.split('(')[0]?.trim() || 'Unknown Artist',
    year: item.creation_date || item.date_text || 'Unknown',
    imageUrl,
    imageWidth: img ? parseInt(img.width) : undefined,
    imageHeight: img ? parseInt(img.height) : undefined,
    medium: item.technique || item.type || 'Unknown',
    culture: Array.isArray(item.culture) ? item.culture.join(', ') : (item.culture || 'Unknown'),
    period: 'Unknown',
    creditLine: item.creditline || SOURCE_NAME,
    source: SOURCE_NAME,
    classification: item.type || 'Unknown',
    artistDisplayDate: item.creators?.[0]?.description || undefined,
    imageDescription: item.description || undefined,
  };
}

async function fetchClevelandArtworks(maxCount = 400) {
  const results = [];
  let skip = 0;
  const limit = 100;

  while (results.length < maxCount) {
    // type=Painting narrows results server-side; has_image=1 ensures images exist
    const url = `${CLEVELAND_API}/?limit=${limit}&skip=${skip}&type=Painting&has_image=1&cc0=1`;
    const res = await fetchJson(url);
    const items = res.data || [];

    if (items.length === 0) break;

    for (const item of items) {
      if (item.share_license_status !== 'CC0') continue;
      const img = item.images?.print || item.images?.web;
      if (!img?.url) continue;
      if (!item.title) continue;
      if (!isPortraitPainting(item)) continue;

      results.push(mapToArtwork(item));
      if (results.length >= maxCount) break;
    }

    skip += limit;
    if (items.length < limit) break;
    if (skip % 500 === 0 && skip > 0) {
      console.log(`  Cleveland: fetched ${results.length} so far...`);
    }
  }

  return results;
}

module.exports = { fetchClevelandArtworks, SOURCE_NAME };
