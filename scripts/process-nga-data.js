/**
 * Simple script to convert National Gallery of Art CSV data to JSON
 * 
 * This script:
 * 1. Reads CSV files from NGA Open Data
 * 2. Filters for Open Access artworks
 * 3. Converts to JSON format for the app
 * 
 * Usage: node scripts/process-nga-data.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// URLs to NGA Open Data CSV files (raw GitHub links)
const NGA_DATA_URLS = {
  objects: 'https://raw.githubusercontent.com/NationalGalleryOfArt/opendata/main/data/objects.csv',
  images: 'https://raw.githubusercontent.com/NationalGalleryOfArt/opendata/main/data/published_images.csv',
  constituents: 'https://raw.githubusercontent.com/NationalGalleryOfArt/opendata/main/data/constituents.csv',
  objects_constituents: 'https://raw.githubusercontent.com/NationalGalleryOfArt/opendata/main/data/objects_constituents.csv',
};

// Output file
const OUTPUT_FILE = path.join(__dirname, '../data/artworks.json');

/**
 * Download a file from URL
 */
function downloadFile(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        resolve(data);
      });
    }).on('error', reject);
  });
}

/**
 * Parse CSV line (handles quoted fields)
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

/**
 * Parse CSV data
 */
function parseCSV(csvText) {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];
  
  const headers = parseCSVLine(lines[0]);
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === headers.length) {
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      rows.push(row);
    }
  }
  
  return rows;
}

/**
 * Filter for Open Access artworks
 * NGA uses various fields to indicate open access - adjust based on actual CSV structure
 */
function isOpenAccess(artwork) {
  // Common fields that might indicate open access:
  // - copyright field might be empty or contain "Public Domain"
  // - rights field might indicate open access
  // - Check NGA documentation for exact field names
  
  const copyright = (artwork.copyright || artwork.copyright || '').toLowerCase();
  const rights = (artwork.rights || artwork.rights || '').toLowerCase();
  
  // Adjust these conditions based on actual NGA CSV structure
  return (
    copyright.includes('public domain') ||
    copyright.includes('cc0') ||
    rights.includes('open access') ||
    !copyright || // If no copyright restriction, assume open access
    copyright === ''
  );
}

/**
 * Build map: objectid -> artist displaydate (life dates) from objects_constituents + constituents
 */
function buildObjectToArtistDisplayDate(objectConstituentRows, constituentRows) {
  const constituentToDisplayDate = {};
  constituentRows.forEach(row => {
    const id = (row.constituentid || row.constituent_id || '').toString();
    const displaydate = (row.displaydate || '').trim();
    if (id && displaydate) constituentToDisplayDate[id] = displaydate;
  });

  const objectToArtistDisplayDate = {};
  const artistRoleMatch = (role) => (role || '').toLowerCase().includes('artist');
  objectConstituentRows.forEach(row => {
    const role = row.role || row.roletype || '';
    if (!artistRoleMatch(role)) return;
    const objectId = (row.objectid || row.object_id || '').toString();
    const constituentId = (row.constituentid || row.constituent_id || '').toString();
    if (!objectId || !constituentId) return;
    if (objectToArtistDisplayDate[objectId]) return;
    const displaydate = constituentToDisplayDate[constituentId];
    if (displaydate) objectToArtistDisplayDate[objectId] = displaydate;
  });
  return objectToArtistDisplayDate;
}

/**
 * Map NGA CSV row to app's Artwork format
 */
function mapToArtwork(row, imageMap, artistDisplayDateMap) {
  const objectId = row.objectid || row.id || row.object_id || '';
  const title = row.title || row.titles || '';
  const artist = row.attribution || row.attributioninverted || row.artist || row.artistname || row.displayname || 'Unknown Artist';
  const year = row.displaydate || row.dated || row.year || (row.beginyear ? String(row.beginyear) : '') || '';
  const medium = row.medium || '';
  const culture = row.culture || '';
  const period = row.period || '';
  const creditLine = row.creditline || row.credit || '';
  const source = row.repository || row.department || 'National Gallery of Art';
  const classification = (row.classification || '').trim();

  let imageUrl = '';
  let imageWidth = 0;
  let imageHeight = 0;
  let imageDescription = '';
  if (imageMap && objectId) {
    const imageData = imageMap[objectId.toString()];
    if (imageData && imageData.iiifurl) {
      imageUrl = `${imageData.iiifurl}/full/full/0/default.jpg`;
      imageWidth = imageData.width || 0;
      imageHeight = imageData.height || 0;
      imageDescription = imageData.assistivetext || '';
    }
  }

  const result = {
    id: `nga-${objectId.toString()}`,
    title: title || 'Untitled',
    artist: artist || 'Unknown Artist',
    year: year || 'Unknown',
    imageUrl: imageUrl,
    imageWidth: imageWidth,
    imageHeight: imageHeight,
    medium: medium || 'Unknown',
    culture: culture || 'Unknown',
    period: period || 'Unknown',
    creditLine: creditLine || 'National Gallery of Art',
    source: 'National Gallery of Art',
    classification: classification || 'Unknown',
  };
  if (imageDescription) result.imageDescription = imageDescription;
  if (artistDisplayDateMap && objectId && artistDisplayDateMap[objectId.toString()]) {
    result.artistDisplayDate = artistDisplayDateMap[objectId.toString()];
  }
  return result;
}

/**
 * Check if an artwork is figurative (depicts people).
 * Matches terms in title or imageDescription. Includes all image formats.
 */
function isFigurative(artwork) {
  const title = (artwork.title || '').toLowerCase();
  const desc = (artwork.imageDescription || '').toLowerCase();
  const text = `${title} ${desc}`;
  const terms = [
    'portrait', 'bust', 'figure', 'figures',
    'woman', 'man', 'child', 'children', 'person', 'people',
    'madonna', 'saint'
  ];
  return terms.some(term => text.includes(term));
}

/**
 * Build a map of object IDs to image data from published_images.csv
 */
function buildImageMap(imageRows) {
  const imageMap = {};
  imageRows.forEach(row => {
    const objectId = row.depictstmsobjectid || row.objectid || '';
    if (objectId && row.iiifurl) {
      // Store the first image for each object (primary view)
      if (!imageMap[objectId.toString()] || row.viewtype === 'primary') {
        imageMap[objectId.toString()] = {
          iiifurl: row.iiifurl,
          iiifthumburl: row.iiifthumburl || '',
          width: parseInt(row.width) || 0,
          height: parseInt(row.height) || 0,
          assistivetext: (row.assistivetext || '').trim(),
        };
      }
    }
  });
  return imageMap;
}

/**
 * Main processing function
 */
async function processNGAData() {
  console.log('🔄 Starting NGA data processing...');
  console.log('📥 Downloading data from National Gallery of Art...');
  
  try {
    // Download objects and images
    console.log('📥 Downloading objects.csv...');
    const objectsData = await downloadFile(NGA_DATA_URLS.objects);
    console.log('✅ Downloaded objects.csv');
    
    console.log('📥 Downloading published_images.csv...');
    const imagesData = await downloadFile(NGA_DATA_URLS.images);
    console.log('✅ Downloaded published_images.csv');
    
    console.log('📥 Downloading constituents.csv...');
    const constituentsData = await downloadFile(NGA_DATA_URLS.constituents);
    console.log('✅ Downloaded constituents.csv');
    
    console.log('📥 Downloading objects_constituents.csv...');
    const objectsConstituentsData = await downloadFile(NGA_DATA_URLS.objects_constituents);
    console.log('✅ Downloaded objects_constituents.csv');
    
    // Parse CSVs
    console.log('📊 Parsing objects CSV...');
    const objectRows = parseCSV(objectsData);
    console.log(`✅ Parsed ${objectRows.length} artworks`);
    
    console.log('📊 Parsing images CSV...');
    const imageRows = parseCSV(imagesData);
    console.log(`✅ Parsed ${imageRows.length} image records`);
    
    console.log('📊 Parsing constituents CSV...');
    const constituentRows = parseCSV(constituentsData);
    console.log(`✅ Parsed ${constituentRows.length} constituents`);
    
    console.log('📊 Parsing objects_constituents CSV...');
    const objectConstituentRows = parseCSV(objectsConstituentsData);
    console.log(`✅ Parsed ${objectConstituentRows.length} object-constituent links`);
    
    // Build image map
    console.log('🔗 Building image map...');
    const imageMap = buildImageMap(imageRows);
    console.log(`✅ Mapped ${Object.keys(imageMap).length} artworks with images`);
    
    // Build objectid -> artist displaydate map
    console.log('🔗 Building artist dates map...');
    const artistDisplayDateMap = buildObjectToArtistDisplayDate(objectConstituentRows, constituentRows);
    console.log(`✅ Mapped ${Object.keys(artistDisplayDateMap).length} objects with artist dates`);
    
    // Filter for open access
    console.log('🔍 Filtering for Open Access artworks...');
    const openAccessArtworks = objectRows.filter(isOpenAccess);
    console.log(`✅ Found ${openAccessArtworks.length} Open Access artworks`);
    
    // Map to app format
    console.log('🔄 Converting to app format...');
    const artworks = openAccessArtworks
      .map(row => mapToArtwork(row, imageMap, artistDisplayDateMap))
      .filter(artwork => artwork.id && artwork.title !== 'Untitled' && artwork.imageUrl) // Remove invalid entries and artworks without images
      .filter(isFigurative); // Figurative artworks (people) - all image formats included
    
    console.log(`✅ Processed ${artworks.length} valid figurative artworks with images`);
    
    // Ensure data directory exists
    const dataDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Write JSON file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(artworks, null, 2), 'utf8');
    console.log(`✅ Saved to ${OUTPUT_FILE}`);
    console.log(`\n🎉 Success! Processed ${artworks.length} artworks.`);
    console.log(`\n📝 Next steps:`);
    console.log(`   1. Review the generated ${OUTPUT_FILE} file`);
    console.log(`   2. Upload artworks.json to your server at https://yuhu.no/dailyarthistory/`);
    console.log(`   3. Make sure the file is accessible at https://yuhu.no/dailyarthistory/artworks.json`);
    
  } catch (error) {
    console.error('❌ Error processing data:', error.message);
    console.error('\n💡 Tips:');
    console.error('   - Check your internet connection');
    console.error('   - Verify the NGA GitHub URLs are correct');
    console.error('   - The CSV structure might have changed - check NGA documentation');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  processNGAData();
}

module.exports = { processNGAData };
