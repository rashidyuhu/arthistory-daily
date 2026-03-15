/**
 * Fetches artworks from The Art Institute of Chicago API.
 * https://api.artic.edu/docs/
 * CC0 for public domain works - No API key required.
 */

const https = require('https');

const ARTIC_API = 'https://api.artic.edu/api/v1/artworks';
const ARTIC_IIIF = 'https://www.artic.edu/iiif/2';
const SOURCE_NAME = 'The Art Institute of Chicago';

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

function isSuitable(artwork) {
  const text = `${artwork.title || ''} ${artwork.description || ''}`.toLowerCase();
  const exclude = ['abstract', 'geometric abstraction', 'color field'];
  return !exclude.some(term => text.includes(term));
}

function mapToArtwork(item) {
  const imageId = item.image_id;
  const imageUrl = imageId
    ? `${ARTIC_IIIF}/${imageId}/full/843,/0/default.jpg`
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
    classification: item.artwork_type_title || item.classification_title || 'Unknown',
    artistDisplayDate: item.artist_display || undefined,
    imageDescription: item.alt_text || item.description || undefined,
  };
}

async function fetchArticArtworks(maxCount = 800) {
  const results = [];
  let page = 1;
  const limit = 100;
  const fields = 'id,title,artist_display,artist_title,date_display,date_start,medium_display,credit_line,image_id,thumbnail,is_public_domain,description,alt_text,term_titles,artwork_type_title,classification_title';

  while (results.length < maxCount) {
    const url = `${ARTIC_API}?limit=${limit}&page=${page}&fields=${fields}`;
    const res = await fetchJson(url);
    const items = res.data || [];

    if (items.length === 0) break;

    for (const item of items) {
      if (!item.is_public_domain) continue;
      if (!item.image_id) continue;
      if (!isSuitable(item)) continue;
      if (!item.title) continue;

      results.push(mapToArtwork(item));
      if (results.length >= maxCount) break;
    }

    page++;
    if (items.length < limit) break;
    if (page % 5 === 0) {
      console.log(`  Art Institute: fetched ${results.length} so far...`);
    }
  }

  return results;
}

module.exports = { fetchArticArtworks, SOURCE_NAME };
