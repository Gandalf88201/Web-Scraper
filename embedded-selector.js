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

    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    this.page = await this.browser.newPage();

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

    // Wait for content
    await this.page.waitForTimeout(2000);

    // Get page HTML and cookies
    const html = await this.page.content();
    const cookies = await this.page.cookies();

    await this.browser.close();

    console.log('✅ Page content retrieved');

    return {
      html,
      cookies,
      url: this.page.url(), // Actual URL (after redirects)
    };
  }

  /**
   * Login to website
   */
  async login(loginConfig) {
    console.log('🔐 Logging in...');

    await this.page.goto(loginConfig.loginUrl, {
      waitUntil: 'networkidle2',
      timeout: 90000,
    });

    await this.page.waitForTimeout(1000);

    if (loginConfig.usernameSelector && loginConfig.username) {
      await this.page.waitForSelector(loginConfig.usernameSelector);
      await this.page.type(loginConfig.usernameSelector, loginConfig.username);
    }

    if (loginConfig.passwordSelector && loginConfig.password) {
      await this.page.type(loginConfig.passwordSelector, loginConfig.password);
    }

    if (loginConfig.submitSelector) {
      await this.page.click(loginConfig.submitSelector);
      await this.page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
      await this.page.waitForTimeout(loginConfig.waitAfterLogin || 2000);
    }

    console.log('✅ Login complete');
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
