/**
 * Configuration file for Fair Participants Scraper
 *
 * Customize these settings based on the target website structure
 */

module.exports = {
  // Target website URL
  targetUrl: 'https://example-fair.com/participants',

  // Browser settings
  headless: false, // Set to true to run without GUI (faster)
  timeout: 60000, // 60 seconds
  waitUntil: 'networkidle2', // Wait until network is mostly idle

  // Viewport settings
  viewport: {
    width: 1920,
    height: 1080,
  },

  // User agent to avoid detection
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',

  // Auto-scrolling settings
  enableAutoScroll: true,
  scrolling: {
    distance: 300, // Pixels to scroll each step
    delay: 200, // Milliseconds between scrolls
    maxScrolls: 200, // Maximum number of scroll operations (safety limit)
    waitAfterScroll: 2000, // Wait after scrolling complete (for lazy loading)
  },

  // "See more" / "Load more" button settings
  // Enable this if the website uses a button to load more participants
  loadMoreButton: {
    enabled: false, // Set to true to enable
    selector: null, // e.g., 'button.load-more', '.see-more-btn', '[data-action="load-more"]'
    maxClicks: 50, // Maximum number of times to click (safety limit)
    waitAfterClick: 2000, // Wait after each click for content to load (milliseconds)
    scrollToButton: true, // Scroll to button before clicking
  },

  // Delay between button clicks (milliseconds)
  clickDelay: 500,

  // Detail view settings - Click on cards to open detail modal/page
  // Enable this if website URLs are only visible after clicking on a company card
  detailView: {
    enabled: false, // Set to true to enable clicking on cards
    clickSelector: null, // Optional: specific element to click within card (e.g., '.details-btn'). If null, clicks the entire card
    websiteSelector: null, // Selector for website link in the detail view (e.g., 'a.company-website', '.detail-link')
    closeSelector: null, // Optional: selector to close the detail view (e.g., '.close-btn', '.modal-close'). If null, uses Escape key
    waitAfterClick: 1000, // Wait time after clicking to open detail (milliseconds)
  },

  // Download logo images locally (optional)
  downloadLogos: {
    enabled: false, // Set to true to download actual logo images
    // Images will be saved to ./output/logos/ directory
    // Filenames format: {id}_{company_name}.{ext}
  },

  // CSS Selectors for data extraction
  // IMPORTANT: Customize these selectors based on your target website
  selectors: {
    // Wait for this element before starting extraction
    waitFor: '.participant-card', // Change this to match your website

    // Container element that holds each participant
    container: '.participant-card', // Change this

    // Button to click to expand/open participant details (optional)
    buttonToClick: null, // e.g., '.expand-button' or '.show-details'

    // Individual data fields within each container
    logo: 'img.participant-logo', // Change this
    name: '.participant-name', // Change this
    link: 'a.participant-website', // Change this
    position: '.booth-position', // Change this
    category: '.participant-category', // Change this
  },

  // Export settings
  exportJSON: true,
  exportExcel: true,
  outputDir: './output',

  // Rate limiting (be respectful to the server)
  requestDelay: 1000, // Milliseconds between requests
};
