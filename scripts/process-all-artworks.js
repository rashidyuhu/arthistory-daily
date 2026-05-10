/**
 * Fetches and merges portrait paintings from multiple museum APIs:
 * - National Gallery of Art (NGA)
 * - The Metropolitan Museum of Art (Met)
 * - The Cleveland Museum of Art
 * - The Art Institute of Chicago
 *
 * All sources are capped and shuffled so no single museum dominates the pool.
 *
 * Usage: node scripts/process-all-artworks.js
 */

const fs = require('fs');
const path = require('path');
const { processNGAData } = require('./process-nga-data');
const { fetchMetArtworks } = require('./fetch-met');
const { fetchClevelandArtworks } = require('./fetch-cleveland');
const { fetchArticArtworks } = require('./fetch-artic');

const OUTPUT_FILE = path.join(__dirname, '../data/artworks.json');
const MAX_PER_SOURCE = 400;
const MET_MAX = 150;
const MET_TIMEOUT_MS = 8 * 60 * 1000;

/** Shuffle array in-place (Fisher-Yates) */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Interleave artworks from multiple sources so days cycle through
 * all museums rather than running through one source at a time.
 */
function interleave(groups) {
  const result = [];
  const queues = groups.map(g => [...g]);
  while (queues.some(q => q.length > 0)) {
    for (const q of queues) {
      if (q.length > 0) result.push(q.shift());
    }
  }
  return result;
}

async function main() {
  console.log('🔄 Processing portrait paintings from all sources...\n');

  const sourceGroups = [];

  // 1. National Gallery of Art
  console.log('📥 1/4 National Gallery of Art (portraits only)...');
  await processNGAData();
  const ngaData = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
  const ngaShuffled = shuffle(ngaData).slice(0, MAX_PER_SOURCE);
  sourceGroups.push(ngaShuffled);
  console.log(`   ✅ ${ngaData.length} found, using ${ngaShuffled.length}\n`);

  // 2. The Metropolitan Museum of Art
  console.log('📥 2/4 The Metropolitan Museum of Art (portraits only)...');
  try {
    const metArtworks = await fetchMetArtworks(MET_MAX, MET_TIMEOUT_MS);
    sourceGroups.push(shuffle(metArtworks));
    console.log(`   ✅ ${metArtworks.length} artworks\n`);
  } catch (err) {
    console.error('   ⚠️ Met API error:', err.message);
    console.error('   💡 Met API is often blocked from some regions. Try GitHub Actions.\n');
  }

  // 3. The Cleveland Museum of Art
  console.log('📥 3/4 The Cleveland Museum of Art (portrait paintings only)...');
  try {
    const clevelandArtworks = await fetchClevelandArtworks(MAX_PER_SOURCE);
    sourceGroups.push(shuffle(clevelandArtworks));
    console.log(`   ✅ ${clevelandArtworks.length} artworks\n`);
  } catch (err) {
    console.error('   ⚠️ Cleveland API error:', err.message, '\n');
  }

  // 4. The Art Institute of Chicago
  console.log('📥 4/4 The Art Institute of Chicago (portrait paintings only)...');
  try {
    const articArtworks = await fetchArticArtworks(MAX_PER_SOURCE);
    sourceGroups.push(shuffle(articArtworks));
    console.log(`   ✅ ${articArtworks.length} artworks\n`);
  } catch (err) {
    console.error('   ⚠️ Art Institute API error:', err.message, '\n');
  }

  // Interleave sources so the daily rotation visits all museums
  const allArtworks = interleave(sourceGroups);

  const bySource = allArtworks.reduce((acc, a) => {
    acc[a.source] = (acc[a.source] || 0) + 1;
    return acc;
  }, {});
  console.log('📊 Source breakdown:');
  Object.entries(bySource).forEach(([src, n]) => console.log(`   ${src}: ${n}`));

  const dataDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allArtworks, null, 2), 'utf8');

  console.log('\n🎉 Done!');
  console.log(`   Total: ${allArtworks.length} portrait paintings`);
  console.log(`   Saved to ${OUTPUT_FILE}`);
  console.log('\n📝 Next steps:');
  console.log('   1. Upload artworks.json to https://yuhu.no/dailyarthistory/');
  console.log('   2. Ensure https://yuhu.no/dailyarthistory/artworks.json is accessible');
}

main().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
