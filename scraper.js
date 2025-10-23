const puppeteer = require('puppeteer');
const XLSX = require('xlsx');
const fs = require('fs').promises;
const path = require('path');
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
      await this.page.waitForTimeout(this.config.login.waitAfterLogin || 2000);

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
    await this.page.waitForTimeout(this.config.scrolling.waitAfterScroll);
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
          await this.page.waitForTimeout(this.config.clickDelay);

          // Click the button
          await buttons[i].click();
          await this.page.waitForTimeout(this.config.clickDelay);

        } catch (error) {
          console.warn(`⚠️  Failed to click button ${i + 1}: ${error.message}`);
        }
      }
    } catch (error) {
      console.warn(`⚠️  Button clicking error: ${error.message}`);
    }
  }

  /**
   * Extract participant data from the page
   */
  async extractParticipants(selectors) {
    console.log('📊 Extracting participant data...');

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
    console.log(`✅ Extracted ${participants.length} participants`);

    return participants;
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
