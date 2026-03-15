/**
 * Fetches and merges artworks from multiple museum APIs:
 * - National Gallery of Art (NGA)
 * - The Metropolitan Museum of Art (Met)
 * - The Cleveland Museum of Art
 * - The Art Institute of Chicago
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
const MAX_PER_SOURCE = 400; // Limit per API to keep total size manageable
const MET_MAX = 100; // Lower target – Met API is slow, many objects filtered out
const MET_TIMEOUT_MS = 8 * 60 * 1000; // 8 min max – avoid GitHub Actions timeout

async function main() {
  console.log('🔄 Processing artworks from all sources...\n');

  let allArtworks = [];

  // 1. National Gallery of Art (existing script)
  console.log('📥 1/4 National Gallery of Art...');
  await processNGAData();
  const ngaData = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
  allArtworks = ngaData;
  console.log(`   ✅ ${ngaData.length} artworks\n`);

  // 2. The Metropolitan Museum of Art (8 min timeout – returns partial if slow)
  console.log('📥 2/4 The Metropolitan Museum of Art...');
  try {
    const metArtworks = await fetchMetArtworks(MET_MAX, MET_TIMEOUT_MS);
    allArtworks = allArtworks.concat(metArtworks);
    console.log(`   ✅ ${metArtworks.length} artworks (total: ${allArtworks.length})\n`);
  } catch (err) {
    console.error('   ⚠️ Met API error:', err.message);
    console.error('   💡 Met API is often blocked from some regions. Try:');
    console.error('      • Run .github/workflows/fetch-artworks.yml in GitHub Actions');
    console.error('      • Or use a VPN to a US IP, then run: npm run process-data:all\n');
  }

  // 3. The Cleveland Museum of Art
  console.log('📥 3/4 The Cleveland Museum of Art...');
  try {
    const clevelandArtworks = await fetchClevelandArtworks(MAX_PER_SOURCE);
    allArtworks = allArtworks.concat(clevelandArtworks);
    console.log(`   ✅ ${clevelandArtworks.length} artworks (total: ${allArtworks.length})\n`);
  } catch (err) {
    console.error('   ⚠️ Cleveland API error:', err.message, '\n');
  }

  // 4. The Art Institute of Chicago
  console.log('📥 4/4 The Art Institute of Chicago...');
  try {
    const articArtworks = await fetchArticArtworks(MAX_PER_SOURCE);
    allArtworks = allArtworks.concat(articArtworks);
    console.log(`   ✅ ${articArtworks.length} artworks (total: ${allArtworks.length})\n`);
  } catch (err) {
    console.error('   ⚠️ Art Institute API error:', err.message, '\n');
  }

  // Ensure data directory exists
  const dataDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Write merged file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allArtworks, null, 2), 'utf8');

  console.log('🎉 Done!');
  console.log(`   Total: ${allArtworks.length} artworks`);
  console.log(`   Saved to ${OUTPUT_FILE}`);
  console.log('\n📝 Next steps:');
  console.log('   1. Upload artworks.json to https://yuhu.no/dailyarthistory/');
  console.log('   2. Ensure https://yuhu.no/dailyarthistory/artworks.json is accessible');
}

main().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
