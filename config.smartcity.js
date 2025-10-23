/**
 * Configuration for Smart City Expo 2025
 * https://ecatalogue.firabarcelona.com/smartcityexpo2025/home?filter=ONLY_EXHIBITORS&lang=en_GB
 *
 * IMPORTANT: You need to verify and update the selectors below by inspecting the website
 * Follow the instructions in SETUP_GUIDE.md
 */

module.exports = {
  // Target website URL
  targetUrl: 'https://ecatalogue.firabarcelona.com/smartcityexpo2025/home?filter=ONLY_EXHIBITORS&lang=en_GB',

  // Login configuration
  login: {
    required: true, // Set to false if no login needed
    loginUrl: 'https://ecatalogue.firabarcelona.com/smartcityexpo2025/login', // UPDATE THIS
    username: '', // Fill in your username/email
    password: '', // Fill in your password
    email: '', // If email is separate from username
    usernameSelector: '#username', // UPDATE: CSS selector for username field
    passwordSelector: '#password', // UPDATE: CSS selector for password field
    emailSelector: null, // UPDATE if email field exists separately
    submitSelector: 'button[type="submit"]', // UPDATE: CSS selector for login button
    waitAfterLogin: 3000, // Wait 3 seconds after login
  },

  // Browser settings
  headless: false, // Keep false initially to see what's happening
  timeout: 90000, // 90 seconds (fair websites can be slow)
  waitUntil: 'networkidle2',

  // Viewport settings
  viewport: {
    width: 1920,
    height: 1080,
  },

  // User agent
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',

  // Auto-scrolling settings (important for loading all exhibitors)
  enableAutoScroll: true,
  scrolling: {
    distance: 400, // Scroll more per step for faster loading
    delay: 300, // Wait 300ms between scrolls
    maxScrolls: 300, // Increase for large fair (1000+ exhibitors)
    waitAfterScroll: 3000, // Wait 3 seconds after scrolling for content to load
  },

  // Delay between button clicks (milliseconds)
  clickDelay: 500,

  // CSS Selectors - UPDATE THESE AFTER INSPECTING THE WEBSITE
  selectors: {
    // Wait for this element before starting
    // Common possibilities: '.exhibitor-card', '.company-item', '.participant-card', '[class*="exhibitor"]'
    waitFor: '.exhibitor-item', // UPDATE THIS

    // Main container for each exhibitor
    // Look for repeating div elements that contain each company
    container: '.exhibitor-item', // UPDATE THIS

    // Button to click to show more details (if needed)
    // Some fair websites hide details behind "Show more" or "Details" buttons
    // Set to null if not needed
    buttonToClick: null, // UPDATE THIS if there's an expand button

    // Logo image
    // Usually: 'img.logo', '.company-logo img', '[class*="logo"] img'
    logo: 'img.exhibitor-logo', // UPDATE THIS

    // Company/Exhibitor name
    // Usually: '.company-name', 'h2', 'h3', '.exhibitor-name', '[class*="name"]'
    name: '.exhibitor-name', // UPDATE THIS

    // Website link
    // Usually: 'a[href*="http"]', '.website-link', 'a.company-website'
    link: 'a.website-link', // UPDATE THIS

    // Booth/Stand position
    // Usually: '.stand', '.booth', '.hall-position', '[class*="stand"]'
    position: '.stand-number', // UPDATE THIS

    // Category/Sector
    // Usually: '.category', '.sector', '.industry', '[class*="category"]'
    category: '.exhibitor-category', // UPDATE THIS
  },

  // Export settings
  exportJSON: true,
  exportExcel: true,
  outputDir: './output',

  // Rate limiting (be respectful to the server)
  requestDelay: 1000,
};
