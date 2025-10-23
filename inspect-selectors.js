#!/usr/bin/env node

/**
 * Selector Inspector Tool
 *
 * This tool helps you find the correct CSS selectors for the website
 * It opens the website and tries to identify common patterns
 *
 * Usage: node inspect-selectors.js
 */

const puppeteer = require('puppeteer');

const TARGET_URL = 'https://ecatalogue.firabarcelona.com/smartcityexpo2025/home?filter=ONLY_EXHIBITORS&lang=en_GB';

async function inspectSelectors() {
  console.log('🔍 Selector Inspector Tool');
  console.log('=' .repeat(60));
  console.log(`Target: ${TARGET_URL}`);
  console.log('=' .repeat(60));
  console.log('');

  let browser;
  try {
    console.log('🚀 Launching browser...');
    browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    console.log('🌐 Loading website...');
    await page.goto(TARGET_URL, {
      waitUntil: 'networkidle2',
      timeout: 90000,
    });

    console.log('✅ Page loaded');
    console.log('');
    console.log('⏳ Waiting 5 seconds for dynamic content to load...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Scroll down a bit to load more content
    console.log('📜 Scrolling to load content...');
    await page.evaluate(() => {
      window.scrollBy(0, 1000);
    });
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('');
    console.log('🔎 Analyzing page structure...');
    console.log('=' .repeat(60));

    // Try to find potential selectors
    const analysis = await page.evaluate(() => {
      const results = {
        potentialContainers: [],
        potentialLogos: [],
        potentialNames: [],
        potentialLinks: [],
        potentialPositions: [],
        potentialCategories: [],
      };

      // Common container patterns
      const containerPatterns = [
        '[class*="exhibitor"]',
        '[class*="company"]',
        '[class*="participant"]',
        '[class*="card"]',
        '[class*="item"]',
        'article',
        '[class*="list"] > div',
      ];

      containerPatterns.forEach(pattern => {
        const elements = document.querySelectorAll(pattern);
        if (elements.length > 10 && elements.length < 5000) {
          // Likely a repeating container
          results.potentialContainers.push({
            selector: pattern,
            count: elements.length,
            sample: elements[0]?.className || elements[0]?.tagName,
          });
        }
      });

      // Find images (logos)
      const images = document.querySelectorAll('img');
      const imageClasses = new Set();
      images.forEach(img => {
        if (img.className) imageClasses.add(`.${img.className.split(' ')[0]}`);
      });
      results.potentialLogos = Array.from(imageClasses).slice(0, 10);

      // Find headings (names)
      const headings = ['h1', 'h2', 'h3', 'h4'];
      headings.forEach(tag => {
        const elements = document.querySelectorAll(tag);
        if (elements.length > 10 && elements.length < 5000) {
          const firstClass = elements[0]?.className?.split(' ')[0];
          if (firstClass) {
            results.potentialNames.push(`.${firstClass}`);
          } else {
            results.potentialNames.push(tag);
          }
        }
      });

      // Find links
      const links = document.querySelectorAll('a[href]');
      const linkClasses = new Set();
      links.forEach(link => {
        if (link.className) linkClasses.add(`.${link.className.split(' ')[0]}`);
      });
      results.potentialLinks = Array.from(linkClasses).slice(0, 10);

      // Find elements with text containing typical position keywords
      const allElements = document.querySelectorAll('*');
      const positionKeywords = ['hall', 'stand', 'booth', 'pavilion', 'position'];
      allElements.forEach(el => {
        if (el.children.length === 0) { // Text nodes only
          const text = el.textContent?.toLowerCase() || '';
          positionKeywords.forEach(keyword => {
            if (text.includes(keyword) && el.className) {
              results.potentialPositions.push(`.${el.className.split(' ')[0]}`);
            }
          });
        }
      });
      results.potentialPositions = [...new Set(results.potentialPositions)].slice(0, 5);

      // Find potential category elements
      const categoryKeywords = ['category', 'sector', 'industry', 'tag', 'type'];
      categoryKeywords.forEach(keyword => {
        const elements = document.querySelectorAll(`[class*="${keyword}"]`);
        if (elements.length > 0) {
          results.potentialCategories.push(`[class*="${keyword}"]`);
        }
      });

      return results;
    });

    console.log('');
    console.log('📊 ANALYSIS RESULTS');
    console.log('=' .repeat(60));
    console.log('');

    console.log('🎯 POTENTIAL CONTAINER SELECTORS (main exhibitor card):');
    if (analysis.potentialContainers.length > 0) {
      analysis.potentialContainers.forEach(container => {
        console.log(`   ${container.selector}`);
        console.log(`      └─ Found ${container.count} elements`);
      });
    } else {
      console.log('   ⚠️  No obvious containers found. Check manually.');
    }
    console.log('');

    console.log('🖼️  POTENTIAL LOGO SELECTORS:');
    if (analysis.potentialLogos.length > 0) {
      analysis.potentialLogos.forEach(selector => {
        console.log(`   ${selector}`);
      });
    } else {
      console.log('   Try: img, .logo, [class*="logo"]');
    }
    console.log('');

    console.log('📝 POTENTIAL NAME SELECTORS:');
    if (analysis.potentialNames.length > 0) {
      analysis.potentialNames.forEach(selector => {
        console.log(`   ${selector}`);
      });
    } else {
      console.log('   Try: h2, h3, .name, [class*="name"]');
    }
    console.log('');

    console.log('🔗 POTENTIAL LINK SELECTORS:');
    if (analysis.potentialLinks.length > 0) {
      analysis.potentialLinks.slice(0, 5).forEach(selector => {
        console.log(`   ${selector}`);
      });
    } else {
      console.log('   Try: a[href], .website, [class*="link"]');
    }
    console.log('');

    console.log('📍 POTENTIAL POSITION SELECTORS:');
    if (analysis.potentialPositions.length > 0) {
      analysis.potentialPositions.forEach(selector => {
        console.log(`   ${selector}`);
      });
    } else {
      console.log('   Try: [class*="stand"], [class*="hall"], [class*="booth"]');
    }
    console.log('');

    console.log('🏷️  POTENTIAL CATEGORY SELECTORS:');
    if (analysis.potentialCategories.length > 0) {
      analysis.potentialCategories.forEach(selector => {
        console.log(`   ${selector}`);
      });
    } else {
      console.log('   Try: [class*="category"], [class*="sector"], [class*="tag"]');
    }
    console.log('');

    console.log('=' .repeat(60));
    console.log('');
    console.log('📋 NEXT STEPS:');
    console.log('');
    console.log('1. Keep the browser window open');
    console.log('2. Right-click on an exhibitor card and select "Inspect"');
    console.log('3. Use the suggestions above to find the correct selectors');
    console.log('4. Update config.smartcity.js with the correct selectors');
    console.log('5. Run: node scrape-smartcity.js --test');
    console.log('');
    console.log('Press Ctrl+C in this terminal to close the browser when done.');
    console.log('=' .repeat(60));

    // Keep browser open for inspection
    await new Promise(() => {}); // Keep running until user closes

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (browser) await browser.close();
    process.exit(1);
  }
}

inspectSelectors();
