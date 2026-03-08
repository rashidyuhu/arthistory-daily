const fs = require('fs');
const path = require('path');

// Create a simple 1x1 transparent PNG (minimal valid PNG)
// This is a minimal valid PNG file (1x1 transparent pixel)
const minimalPNG = Buffer.from([
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
  0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
  0x49, 0x48, 0x44, 0x52, // IHDR
  0x00, 0x00, 0x00, 0x01, // width: 1
  0x00, 0x00, 0x00, 0x01, // height: 1
  0x08, 0x06, 0x00, 0x00, 0x00, // bit depth, color type, compression, filter, interlace
  0x1F, 0x15, 0xC4, 0x89, // CRC
  0x00, 0x00, 0x00, 0x0A, // IDAT chunk length
  0x49, 0x44, 0x41, 0x54, // IDAT
  0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01, // compressed data
  0x0D, 0x0A, 0x2D, 0xB4, // CRC
  0x00, 0x00, 0x00, 0x00, // IEND chunk length
  0x49, 0x45, 0x4E, 0x44, // IEND
  0xAE, 0x42, 0x60, 0x82  // CRC
]);

// For larger images, we'll create a simple colored square
// This creates a 1024x1024 PNG with a solid color
function createColoredPNG(width, height, color = [100, 150, 200, 255]) {
  // This is a simplified approach - for a proper implementation,
  // you'd want to use a library like sharp or canvas
  // For now, we'll create a minimal valid PNG and let the user replace it
  return minimalPNG;
}

const assetsDir = path.join(__dirname, '..', 'assets');

// Create assets directory if it doesn't exist
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Generate placeholder images
const assets = [
  { name: 'icon.png', size: 1024 },
  { name: 'splash.png', size: 2048 },
  { name: 'adaptive-icon.png', size: 1024 },
  { name: 'favicon.png', size: 32 }
];

console.log('Generating placeholder assets...');

assets.forEach(asset => {
  const filePath = path.join(assetsDir, asset.name);
  // For now, create a minimal PNG - user should replace with actual images
  fs.writeFileSync(filePath, minimalPNG);
  console.log(`Created ${asset.name} (placeholder - replace with actual ${asset.size}x${asset.size} image)`);
});

console.log('\n✅ Placeholder assets created!');
console.log('⚠️  IMPORTANT: Replace these with actual images:');
console.log('   - icon.png: 1024x1024px');
console.log('   - splash.png: Recommended 2048x2048px or larger');
console.log('   - adaptive-icon.png: 1024x1024px (Android)');
console.log('   - favicon.png: 32x32px or 48x48px (Web)');
