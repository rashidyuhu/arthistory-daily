/**
 * Fetches figurative artworks from The Metropolitan Museum of Art API.
 * https://metmuseum.github.io/
 * CC0 - No API key required.
 */

const MET_OBJECTS_URL = 'https://collectionapi.metmuseum.org/public/collection/v1/objects';
const SOURCE_NAME = 'The Metropolitan Museum of Art';

// Browser-like headers to avoid Incapsula/bot blocking
const FETCH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://www.metmuseum.org/',
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Fetch JSON from URL with retries
 */
async function fetchJson(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, { headers: FETCH_HEADERS });
    const text = await res.text();
    if (!res.ok) {
      if (i < retries - 1) {
        await sleep(2000 * (i + 1));
        continue;
      }
      throw new Error(`HTTP ${res.status}: ${text.slice(0, 100)}`);
    }
    try {
      return JSON.parse(text);
    } catch (e) {
      if (text.startsWith('<') || text.startsWith('{')) {
        throw new Error(`Invalid JSON (got HTML?): ${text.slice(0, 80)}...`);
      }
      throw e;
    }
  }
}

/**
 * Exclude clearly abstract/non-figurative works
 */
function isSuitable(obj) {
  const text = `${obj.title || ''} ${obj.objectName || ''} ${(obj.tags || []).map(t => t.term || '').join(' ')}`.toLowerCase();
  const exclude = ['abstract', 'geometric abstraction', 'color field', 'minimalist'];
  return !exclude.some(term => text.includes(term));
}

/**
 * Map Met object to app Artwork format
 */
function mapToArtwork(obj) {
  return {
    id: `met-${obj.objectID}`,
    title: obj.title || 'Untitled',
    artist: obj.artistDisplayName || obj.artistAlphaSort || 'Unknown Artist',
    year: obj.objectDate || obj.objectEndDate?.toString() || 'Unknown',
    imageUrl: obj.primaryImage || '',
    imageWidth: obj.measurements?.[0]?.elementMeasurements?.Width,
    imageHeight: obj.measurements?.[0]?.elementMeasurements?.Height,
    medium: obj.medium || 'Unknown',
    culture: obj.culture || 'Unknown',
    period: obj.period || 'Unknown',
    creditLine: obj.creditLine || SOURCE_NAME,
    source: SOURCE_NAME,
    classification: obj.classification || obj.objectName || 'Unknown',
    artistDisplayDate: obj.artistDisplayBio || undefined,
    imageDescription: obj.tags?.map(t => t.term).join(', ') || undefined,
  };
}

/**
 * Fetch up to maxCount public domain artworks with images from the Met.
 * @param {number} maxCount - Max artworks to fetch
 * @param {number} timeoutMs - Stop after this many ms (return partial results)
 */
async function fetchMetArtworks(maxCount = 100, timeoutMs = 8 * 60 * 1000) {
  const startTime = Date.now();
  let objectIDs = [];
  try {
    // Prefer search with hasImages for higher hit rate
    const searchUrl = 'https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=painting';
    const ids = await fetchJson(searchUrl);
    objectIDs = ids.objectIDs || [];
    if (objectIDs.length < 500) {
      const portraitIds = await fetchJson('https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=portrait');
      objectIDs = [...new Set([...objectIDs, ...(portraitIds.objectIDs || [])])];
    }
  } catch (e) {
    console.warn('  Met search failed, using objects list:', e.message);
    const ids = await fetchJson(MET_OBJECTS_URL);
    objectIDs = ids.objectIDs || [];
  }
  const results = [];
  const batchSize = 20; // Smaller batches to avoid triggering bot protection

  for (let i = 0; i < objectIDs.length && results.length < maxCount; i += batchSize) {
    if (Date.now() - startTime > timeoutMs) {
      console.log(`  Met: timeout – returning ${results.length} artworks`);
      break;
    }

    const batch = objectIDs.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((id) => fetchJson(`${MET_OBJECTS_URL}/${id}`).catch(() => null))
    );

    for (const obj of batchResults) {
      if (!obj || !obj.isPublicDomain || !obj.primaryImage) continue;
      if (!isSuitable(obj)) continue;
      if (!obj.title || obj.title === '') continue;

      results.push(mapToArtwork(obj));
      if (results.length >= maxCount) break;
    }

    if (results.length > 0 && results.length % 50 === 0) {
      console.log(`  Met: fetched ${results.length} so far...`);
    }

    await sleep(200);
  }

  return results;
}

module.exports = { fetchMetArtworks, SOURCE_NAME };
