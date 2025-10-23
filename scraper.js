const puppeteer = require('puppeteer');
const XLSX = require('xlsx');
const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const http = require('http');
const config = require('./config');

/**
 * Fair Participants Web Scraper
 * Extracts participant data with autoscrolling and dynamic content support
 */
class FairScraper {
  constructor(options = {}) {
    this.browser = null;
    this.page = null;
    this.participants = [];
    this.config = { ...config, ...options };
  }

  /**
   * Initialize browser and page
   */
  async initialize() {
    console.log('🚀 Launching browser...');
    this.browser = await puppeteer.launch({
      headless: this.config.headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    this.page = await this.browser.newPage();

    // Set viewport for consistent rendering
    await this.page.setViewport({
      width: this.config.viewport.width,
      height: this.config.viewport.height,
    });

    // Set user agent to avoid detection
    await this.page.setUserAgent(this.config.userAgent);

    console.log('✅ Browser ready');
  }

  /**
   * Login to the website if credentials are provided
   */
  async login() {
    if (!this.config.login || !this.config.login.required) {
      console.log('ℹ️  No login required');
      return;
    }

    console.log('🔐 Logging in...');

    try {
      // Navigate to login page
      await this.page.goto(this.config.login.loginUrl, {
        waitUntil: this.config.waitUntil,
        timeout: this.config.timeout,
      });

      // Wait for login form to load
      if (this.config.login.usernameSelector) {
        await this.page.waitForSelector(this.config.login.usernameSelector, {
          timeout: this.config.timeout,
        });
      }

      // Fill in username
      if (this.config.login.usernameSelector && this.config.login.username) {
        await this.page.type(this.config.login.usernameSelector, this.config.login.username);
        console.log('   ✓ Username entered');
      }

      // Fill in password
      if (this.config.login.passwordSelector && this.config.login.password) {
        await this.page.type(this.config.login.passwordSelector, this.config.login.password);
        console.log('   ✓ Password entered');
      }

      // Fill in any additional fields (e.g., email)
      if (this.config.login.emailSelector && this.config.login.email) {
        await this.page.type(this.config.login.emailSelector, this.config.login.email);
        console.log('   ✓ Email entered');
      }

      // Click submit button
      if (this.config.login.submitSelector) {
        await this.page.click(this.config.login.submitSelector);
        console.log('   ✓ Login button clicked');
      }

      // Wait for navigation after login
      await this.page.waitForNavigation({
        waitUntil: this.config.waitUntil,
        timeout: this.config.timeout,
      }).catch(() => {
        // Sometimes login doesn't navigate, just continue
      });

      // Additional wait for login to complete
      await new Promise(resolve => setTimeout(resolve, this.config.login.waitAfterLogin || 2000));

      console.log('✅ Login successful');

    } catch (error) {
      console.error('❌ Login failed:', error.message);
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  /**
   * Navigate to the target URL
   */
  async navigateToPage(url) {
    console.log(`🌐 Navigating to ${url}...`);
    await this.page.goto(url, {
      waitUntil: this.config.waitUntil,
      timeout: this.config.timeout,
    });
    console.log('✅ Page loaded');
  }

  /**
   * Auto-scroll to load all dynamic content
   */
  async autoScroll() {
    console.log('📜 Auto-scrolling to load all content...');

    await this.page.evaluate(async (scrollConfig) => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = scrollConfig.distance;
        const maxScrolls = scrollConfig.maxScrolls;
        let scrollCount = 0;

        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;
          scrollCount++;

          // Stop if reached bottom or max scrolls
          if (totalHeight >= scrollHeight || scrollCount >= maxScrolls) {
            clearInterval(timer);
            resolve();
          }
        }, scrollConfig.delay);
      });
    }, this.config.scrolling);

    console.log('✅ Scrolling complete');

    // Wait for any lazy-loaded content
    await new Promise(resolve => setTimeout(resolve, this.config.scrolling.waitAfterScroll));
  }

  /**
   * Click "Load more" or "See more" button repeatedly to load all content
   */
  async clickLoadMoreButton() {
    if (!this.config.loadMoreButton || !this.config.loadMoreButton.enabled) {
      return;
    }

    const { selector, maxClicks, waitAfterClick, scrollToButton } = this.config.loadMoreButton;

    if (!selector) {
      console.log('ℹ️  Load more button selector not configured, skipping...');
      return;
    }

    console.log('🔄 Looking for "Load more" button...');
    console.log(`   Selector: ${selector}`);
    console.log(`   Max clicks: ${maxClicks}`);

    let clickCount = 0;

    while (clickCount < maxClicks) {
      try {
        // Check if button exists and is visible
        const button = await this.page.$(selector);

        if (!button) {
          console.log('✅ No more "Load more" button found - all content loaded!');
          break;
        }

        // Check if button is visible
        const isVisible = await button.evaluate(el => {
          const style = window.getComputedStyle(el);
          return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
        });

        if (!isVisible) {
          console.log('✅ "Load more" button no longer visible - all content loaded!');
          break;
        }

        // Scroll to button if enabled
        if (scrollToButton) {
          await button.evaluate(el => {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          });
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Click the button
        clickCount++;
        console.log(`🔘 Clicking "Load more" button (${clickCount}/${maxClicks})...`);

        await button.click();

        // Wait for new content to load
        console.log(`   ⏳ Waiting ${waitAfterClick}ms for new content to load...`);
        await new Promise(resolve => setTimeout(resolve, waitAfterClick));

        // Optional: Scroll down a bit to trigger any lazy loading
        await this.page.evaluate(() => {
          window.scrollBy(0, 500);
        });
        await new Promise(resolve => setTimeout(resolve, 300));

      } catch (error) {
        console.log(`ℹ️  Could not click "Load more" button: ${error.message}`);
        break;
      }
    }

    if (clickCount === maxClicks) {
      console.log(`⚠️  Reached maximum click limit (${maxClicks}). Some content may not be loaded.`);
    } else {
      console.log(`✅ Finished clicking "Load more" button (${clickCount} times)`);
    }
  }

  /**
   * Find and click buttons to open detail pages
   */
  async clickButtons(buttonSelector) {
    console.log(`🔘 Looking for buttons: ${buttonSelector}`);

    try {
      const buttons = await this.page.$$(buttonSelector);
      console.log(`Found ${buttons.length} buttons`);

      for (let i = 0; i < buttons.length; i++) {
        try {
          console.log(`Clicking button ${i + 1}/${buttons.length}...`);

          // Scroll element into view
          await buttons[i].evaluate(el => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
          await new Promise(resolve => setTimeout(resolve, this.config.clickDelay));

          // Click the button
          await buttons[i].click();
          await new Promise(resolve => setTimeout(resolve, this.config.clickDelay));

        } catch (error) {
          console.warn(`⚠️  Failed to click button ${i + 1}: ${error.message}`);
        }
      }
    } catch (error) {
      console.warn(`⚠️  Button clicking error: ${error.message}`);
    }
  }

  /**
   * Download an image from URL and save it locally
   */
  async downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;

      protocol.get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
          return;
        }

        const fileStream = require('fs').createWriteStream(filepath);
        response.pipe(fileStream);

        fileStream.on('finish', () => {
          fileStream.close();
          resolve(filepath);
        });

        fileStream.on('error', (err) => {
          require('fs').unlink(filepath, () => {});
          reject(err);
        });
      }).on('error', reject);
    });
  }

  /**
   * Extract participant data from the page
   */
  async extractParticipants(selectors) {
    console.log('📊 Extracting participant data...');

    // Check if we need to click cards to open detail views
    const needsDetailClick = this.config.detailView && this.config.detailView.enabled;

    if (needsDetailClick) {
      await this.extractWithDetailView(selectors);
    } else {
      await this.extractDirect(selectors);
    }

    // Download logos if enabled
    if (this.config.downloadLogos && this.config.downloadLogos.enabled) {
      await this.downloadAllLogos();
    }

    console.log(`✅ Extracted ${this.participants.length} participants`);
    return this.participants;
  }

  /**
   * Direct extraction (current method - no clicking needed)
   */
  async extractDirect(selectors) {
    const participants = await this.page.evaluate((sel) => {
      const results = [];

      // Find all participant containers
      const containers = document.querySelectorAll(sel.container);

      containers.forEach((container, index) => {
        try {
          // Extract logo
          const logoEl = container.querySelector(sel.logo);
          const logo = logoEl ? (logoEl.src || logoEl.getAttribute('data-src') || '') : '';

          // Extract name
          const nameEl = container.querySelector(sel.name);
          const name = nameEl ? nameEl.textContent.trim() : '';

          // Extract website link
          const linkEl = container.querySelector(sel.link);
          const website = linkEl ? (linkEl.href || linkEl.getAttribute('data-url') || '') : '';

          // Extract position
          const positionEl = container.querySelector(sel.position);
          const position = positionEl ? positionEl.textContent.trim() : '';

          // Extract category
          const categoryEl = container.querySelector(sel.category);
          const category = categoryEl ? categoryEl.textContent.trim() : '';

          // Only add if we have at least a name
          if (name) {
            results.push({
              id: index + 1,
              name,
              logo,
              website,
              position,
              category,
              scrapedAt: new Date().toISOString(),
            });
          }
        } catch (error) {
          console.error(`Error extracting participant ${index}:`, error);
        }
      });

      return results;
    }, selectors);

    this.participants = participants;
  }

  /**
   * Extract with detail view - click on each card to open detail modal/page
   */
  async extractWithDetailView(selectors) {
    console.log('🔍 Extracting data with detail view (clicking on each item)...');

    const containerCount = await this.page.$$eval(selectors.container, els => els.length);
    console.log(`   Found ${containerCount} items to process`);

    const detailConfig = this.config.detailView;
    const participants = [];

    for (let i = 0; i < containerCount; i++) {
      try {
        console.log(`   Processing item ${i + 1}/${containerCount}...`);

        // Get the container element
        const containers = await this.page.$$(selectors.container);
        const container = containers[i];

        if (!container) {
          console.warn(`   ⚠️  Container ${i + 1} not found, skipping...`);
          continue;
        }

        // Scroll into view
        await container.evaluate(el => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
        await new Promise(resolve => setTimeout(resolve, 300));

        // Extract basic data from the card (name, logo, position, category)
        const basicData = await container.evaluate((el, sel) => {
          const logoEl = el.querySelector(sel.logo);
          const nameEl = el.querySelector(sel.name);
          const positionEl = el.querySelector(sel.position);
          const categoryEl = el.querySelector(sel.category);

          return {
            logo: logoEl ? (logoEl.src || logoEl.getAttribute('data-src') || '') : '',
            name: nameEl ? nameEl.textContent.trim() : '',
            position: positionEl ? positionEl.textContent.trim() : '',
            category: categoryEl ? categoryEl.textContent.trim() : '',
          };
        }, selectors);

        // Find and click the detail trigger
        const clickTarget = detailConfig.clickSelector
          ? await container.$(detailConfig.clickSelector)
          : container;

        if (!clickTarget) {
          console.warn(`   ⚠️  Click target not found for item ${i + 1}, skipping...`);
          participants.push({
            id: i + 1,
            ...basicData,
            website: '',
            scrapedAt: new Date().toISOString(),
          });
          continue;
        }

        // Click to open detail view
        await clickTarget.click();
        await new Promise(resolve => setTimeout(resolve, detailConfig.waitAfterClick || 1000));

        // Extract website from detail view
        let website = '';
        try {
          if (detailConfig.websiteSelector) {
            website = await this.page.evaluate((sel) => {
              const linkEl = document.querySelector(sel);
              return linkEl ? (linkEl.href || linkEl.getAttribute('data-url') || linkEl.textContent.trim()) : '';
            }, detailConfig.websiteSelector);
          }
        } catch (error) {
          console.warn(`   ⚠️  Could not extract website from detail view: ${error.message}`);
        }

        // Close detail view if needed
        if (detailConfig.closeSelector) {
          try {
            await this.page.click(detailConfig.closeSelector);
            await new Promise(resolve => setTimeout(resolve, 500));
          } catch (error) {
            console.warn(`   ⚠️  Could not close detail view: ${error.message}`);
            // Try pressing Escape as fallback
            await this.page.keyboard.press('Escape');
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }

        // Add participant with website from detail view
        if (basicData.name) {
          participants.push({
            id: i + 1,
            ...basicData,
            website,
            scrapedAt: new Date().toISOString(),
          });
        }

      } catch (error) {
        console.error(`   ❌ Error processing item ${i + 1}:`, error.message);
      }
    }

    this.participants = participants;
  }

  /**
   * Download all logo images to local directory
   */
  async downloadAllLogos() {
    if (!this.participants || this.participants.length === 0) {
      console.log('ℹ️  No participants to download logos for');
      return;
    }

    console.log('🖼️  Downloading logo images...');

    const logoConfig = this.config.downloadLogos;
    const outputDir = path.join(this.config.outputDir, 'logos');

    // Create logos directory
    await fs.mkdir(outputDir, { recursive: true });

    let downloadedCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < this.participants.length; i++) {
      const participant = this.participants[i];

      if (!participant.logo) {
        skippedCount++;
        continue;
      }

      try {
        // Generate safe filename
        const ext = path.extname(new URL(participant.logo).pathname) || '.jpg';
        const safeName = participant.name
          .replace(/[^a-z0-9]/gi, '_')
          .toLowerCase()
          .substring(0, 50);
        const filename = `${participant.id}_${safeName}${ext}`;
        const filepath = path.join(outputDir, filename);

        // Download image
        await this.downloadImage(participant.logo, filepath);

        // Update participant with local path
        participant.logoFile = filename;
        participant.logoPath = filepath;

        downloadedCount++;

        if (downloadedCount % 10 === 0) {
          console.log(`   Downloaded ${downloadedCount}/${this.participants.length} logos...`);
        }

      } catch (error) {
        console.warn(`   ⚠️  Failed to download logo for "${participant.name}": ${error.message}`);
        skippedCount++;
      }
    }

    console.log(`✅ Downloaded ${downloadedCount} logos (${skippedCount} skipped/failed)`);
    console.log(`   Saved to: ${outputDir}`);
  }

  /**
   * Group participants by category
   */
  groupByCategory() {
    const grouped = {};

    this.participants.forEach(participant => {
      const category = participant.category || 'Uncategorized';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(participant);
    });

    return grouped;
  }

  /**
   * Export data to JSON
   */
  async exportToJSON(filename = 'participants.json') {
    console.log(`💾 Exporting to JSON: ${filename}`);

    const outputDir = this.config.outputDir;
    await fs.mkdir(outputDir, { recursive: true });

    const filepath = path.join(outputDir, filename);
    const grouped = this.groupByCategory();

    const output = {
      metadata: {
        totalParticipants: this.participants.length,
        categories: Object.keys(grouped).length,
        scrapedAt: new Date().toISOString(),
        url: this.config.targetUrl,
      },
      byCategory: grouped,
      allParticipants: this.participants,
    };

    await fs.writeFile(filepath, JSON.stringify(output, null, 2), 'utf-8');
    console.log(`✅ JSON exported to ${filepath}`);

    return filepath;
  }

  /**
   * Export data to Excel
   */
  async exportToExcel(filename = 'participants.xlsx') {
    console.log(`📊 Exporting to Excel: ${filename}`);

    const outputDir = this.config.outputDir;
    await fs.mkdir(outputDir, { recursive: true });

    const filepath = path.join(outputDir, filename);
    const grouped = this.groupByCategory();

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Add "All Participants" sheet
    const allSheet = XLSX.utils.json_to_sheet(this.participants);
    XLSX.utils.book_append_sheet(workbook, allSheet, 'All Participants');

    // Add a sheet for each category
    Object.keys(grouped).forEach(category => {
      const sheetName = category.substring(0, 31); // Excel sheet name limit
      const sheet = XLSX.utils.json_to_sheet(grouped[category]);
      XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
    });

    // Add summary sheet
    const summary = Object.keys(grouped).map(category => ({
      Category: category,
      Count: grouped[category].length,
    }));
    const summarySheet = XLSX.utils.json_to_sheet(summary);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Write file
    XLSX.writeFile(workbook, filepath);
    console.log(`✅ Excel exported to ${filepath}`);

    return filepath;
  }

  /**
   * Main scraping workflow
   */
  async scrape() {
    try {
      await this.initialize();

      // Login if required
      await this.login();

      await this.navigateToPage(this.config.targetUrl);

      // Optional: Wait for specific element
      if (this.config.selectors.waitFor) {
        console.log(`⏳ Waiting for element: ${this.config.selectors.waitFor}`);
        await this.page.waitForSelector(this.config.selectors.waitFor, {
          timeout: this.config.timeout,
        });
      }

      // Auto-scroll to load all content
      if (this.config.enableAutoScroll) {
        await this.autoScroll();
      }

      // Click "Load more" button to load all exhibitors
      await this.clickLoadMoreButton();

      // Click buttons if selector provided
      if (this.config.selectors.buttonToClick) {
        await this.clickButtons(this.config.selectors.buttonToClick);
      }

      // Extract participant data
      await this.extractParticipants(this.config.selectors);

      // Export to JSON
      if (this.config.exportJSON) {
        await this.exportToJSON();
      }

      // Export to Excel
      if (this.config.exportExcel) {
        await this.exportToExcel();
      }

      console.log('✨ Scraping complete!');
      console.log(`📊 Total participants extracted: ${this.participants.length}`);

      const grouped = this.groupByCategory();
      console.log(`📁 Categories found: ${Object.keys(grouped).length}`);
      Object.keys(grouped).forEach(category => {
        console.log(`   - ${category}: ${grouped[category].length} participants`);
      });

    } catch (error) {
      console.error('❌ Scraping error:', error);
      throw error;
    } finally {
      await this.close();
    }
  }

  /**
   * Close browser
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log('🔒 Browser closed');
    }
  }
}

// Run scraper if executed directly
if (require.main === module) {
  const scraper = new FairScraper();

  scraper.scrape()
    .then(() => {
      console.log('✅ Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Fatal error:', error);
      process.exit(1);
    });
}

module.exports = FairScraper;
