#!/usr/bin/env node

/**
 * Smart City Expo 2025 Scraper
 *
 * This script scrapes exhibitor data from the Smart City Expo Barcelona 2025 fair
 *
 * Usage:
 *   node scrape-smartcity.js
 *
 * Before running:
 *   1. npm install
 *   2. Update selectors in config.smartcity.js (see SETUP_GUIDE.md)
 */

const FairScraper = require('./scraper');
const config = require('./config.smartcity');

console.log('🏙️  Smart City Expo 2025 Scraper');
console.log('=' .repeat(50));
console.log(`Target URL: ${config.targetUrl}`);
console.log(`Headless mode: ${config.headless ? 'Yes' : 'No (visible browser)'}`);
console.log(`Max scrolls: ${config.scrolling.maxScrolls}`);
console.log(`Output directory: ${config.outputDir}`);
console.log('=' .repeat(50));
console.log('');

// Optional: Override config via command line arguments
// Example: node scrape-smartcity.js --headless --maxScrolls=500
const args = process.argv.slice(2);
args.forEach(arg => {
  if (arg === '--headless') {
    config.headless = true;
    console.log('✓ Headless mode enabled via CLI');
  }
  if (arg.startsWith('--maxScrolls=')) {
    config.scrolling.maxScrolls = parseInt(arg.split('=')[1]);
    console.log(`✓ Max scrolls set to ${config.scrolling.maxScrolls} via CLI`);
  }
  if (arg === '--test') {
    config.scrolling.maxScrolls = 10;
    console.log('✓ Test mode: Limited to 10 scrolls');
  }
});

const scraper = new FairScraper(config);

console.log('Starting scraper...\n');

scraper.scrape()
  .then(() => {
    console.log('');
    console.log('=' .repeat(50));
    console.log('✅ Smart City Expo scraping complete!');
    console.log('=' .repeat(50));
    console.log('');
    console.log('Check the output directory for results:');
    console.log(`  - ${config.outputDir}/participants.json`);
    console.log(`  - ${config.outputDir}/participants.xlsx`);
    console.log('');
    process.exit(0);
  })
  .catch((error) => {
    console.error('');
    console.error('=' .repeat(50));
    console.error('❌ Scraping failed!');
    console.error('=' .repeat(50));
    console.error('');
    console.error('Error details:', error.message);
    console.error('');
    console.error('Troubleshooting tips:');
    console.error('  1. Check that selectors in config.smartcity.js are correct');
    console.error('  2. Increase timeout in config');
    console.error('  3. Run with headless: false to see what\'s happening');
    console.error('  4. See SETUP_GUIDE.md for more help');
    console.error('');
    process.exit(1);
  });
