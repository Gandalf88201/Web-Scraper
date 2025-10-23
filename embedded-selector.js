const puppeteer = require('puppeteer');
const express = require('express');

/**
 * Embedded Visual Selector - Returns authenticated page content
 */
class EmbeddedSelector {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  /**
   * Get page content with authentication
   */
  async getAuthenticatedPage(url, loginConfig = null) {
    console.log('🔐 Getting authenticated page content...');

    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      this.page = await this.browser.newPage();

      // Set a reasonable default viewport
      await this.page.setViewport({ width: 1920, height: 1080 });

      // Handle login if required
      if (loginConfig && loginConfig.required) {
        await this.login(loginConfig);
      }

      // Navigate to target page
      console.log(`🌐 Loading ${url}...`);
      await this.page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 90000,
      });

      // Wait for content to settle
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Get page HTML, cookies, and URL BEFORE closing browser
      const html = await this.page.content();
      const cookies = await this.page.cookies();
      const pageUrl = this.page.url(); // Get URL before closing

      console.log('✅ Page content retrieved');
      console.log(`   URL: ${pageUrl}`);
      console.log(`   HTML size: ${(html.length / 1024).toFixed(2)} KB`);

      return {
        html,
        cookies,
        url: pageUrl, // Actual URL (after redirects)
      };
    } catch (error) {
      console.error('❌ Error getting authenticated page:', error.message);
      throw error;
    } finally {
      // Always close browser, even if error occurred
      if (this.browser) {
        await this.browser.close();
        console.log('🔒 Browser closed');
      }
    }
  }

  /**
   * Login to website
   */
  async login(loginConfig) {
    console.log('🔐 Logging in...');
    console.log(`   Login URL: ${loginConfig.loginUrl}`);

    try {
      await this.page.goto(loginConfig.loginUrl, {
        waitUntil: 'networkidle2',
        timeout: 90000,
      });

      // Wait for page to settle
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (loginConfig.usernameSelector && loginConfig.username) {
        console.log(`   Waiting for username field: ${loginConfig.usernameSelector}`);
        await this.page.waitForSelector(loginConfig.usernameSelector, { timeout: 10000 });
        await this.page.type(loginConfig.usernameSelector, loginConfig.username);
        console.log('   ✓ Username entered');
      }

      if (loginConfig.passwordSelector && loginConfig.password) {
        console.log(`   Typing password into: ${loginConfig.passwordSelector}`);
        await this.page.type(loginConfig.passwordSelector, loginConfig.password);
        console.log('   ✓ Password entered');
      }

      if (loginConfig.submitSelector) {
        console.log(`   Clicking submit button: ${loginConfig.submitSelector}`);
        await this.page.click(loginConfig.submitSelector);
        console.log('   ✓ Submit button clicked');

        // Wait for navigation after login
        await this.page.waitForNavigation({
          waitUntil: 'networkidle2',
          timeout: 30000
        }).catch(() => {
          console.log('   ⚠️  No navigation after login (might be normal)');
        });

        // Wait for configured time after login
        const waitTime = loginConfig.waitAfterLogin || 2000;
        console.log(`   Waiting ${waitTime}ms after login...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }

      console.log('✅ Login complete');
    } catch (error) {
      console.error('❌ Login failed:', error.message);
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  /**
   * Create proxy middleware for serving authenticated content
   */
  static createProxyMiddleware() {
    return async (req, res, next) => {
      // This will be handled by the server
      next();
    };
  }
}

module.exports = EmbeddedSelector;
