# Setup Guide for Smart City Expo 2025

This guide will help you configure the scraper specifically for the Smart City Expo website:
https://ecatalogue.firabarcelona.com/smartcityexpo2025/home?filter=ONLY_EXHIBITORS&lang=en_GB

## Step-by-Step Setup

### Step 1: Install Dependencies

```bash
npm install
```

This will install Puppeteer, XLSX, and other required packages.

### Step 2: Find the Correct CSS Selectors

You need to inspect the website to find the correct selectors. Here's how:

1. **Open the website** in Google Chrome or Firefox:
   ```
   https://ecatalogue.firabarcelona.com/smartcityexpo2025/home?filter=ONLY_EXHIBITORS&lang=en_GB
   ```

2. **Open Developer Tools**: Press `F12` or right-click and select "Inspect"

3. **Inspect the exhibitor cards**:
   - Right-click on any exhibitor/company card
   - Select "Inspect" or "Inspect Element"
   - This will show you the HTML structure

4. **Identify the selectors** for each data point:

#### Finding the Container Selector

Look for the repeating element that wraps each exhibitor. It might look like:

```html
<div class="exhibitor-card">
  <!-- Company info here -->
</div>
```

Or:

```html
<article class="company-item">
  <!-- Company info here -->
</article>
```

**The selector is the class name:** `.exhibitor-card` or `.company-item`

#### Finding Individual Element Selectors

Within each container, find:

**Logo:**
```html
<img src="logo.jpg" class="company-logo" />
<!-- Selector: .company-logo or img.company-logo -->
```

**Company Name:**
```html
<h3 class="company-name">ABC Corp</h3>
<!-- Selector: .company-name or h3.company-name -->
```

**Website Link:**
```html
<a href="https://example.com" class="web-link">Website</a>
<!-- Selector: .web-link or a.web-link -->
```

**Stand/Booth Position:**
```html
<span class="stand-info">Hall 3, Stand A42</span>
<!-- Selector: .stand-info -->
```

**Category/Sector:**
```html
<div class="category-tag">Smart Mobility</div>
<!-- Selector: .category-tag -->
```

### Step 3: Update the Configuration File

Open `config.smartcity.js` and update the selectors section:

```javascript
selectors: {
  waitFor: '.YOUR-CONTAINER-CLASS',  // e.g., '.exhibitor-card'
  container: '.YOUR-CONTAINER-CLASS',
  logo: 'img.YOUR-LOGO-CLASS',       // e.g., 'img.company-logo'
  name: '.YOUR-NAME-CLASS',          // e.g., '.company-name'
  link: 'a.YOUR-LINK-CLASS',         // e.g., 'a.website-link'
  position: '.YOUR-POSITION-CLASS',  // e.g., '.stand-number'
  category: '.YOUR-CATEGORY-CLASS',  // e.g., '.sector'
}
```

### Step 4: Test with Small Sample

Before scraping all exhibitors, test with limited scrolling:

1. Open `config.smartcity.js`
2. Set `scrolling.maxScrolls: 10` (this will load ~50-100 exhibitors)
3. Keep `headless: false` so you can see what's happening

### Step 5: Run the Scraper

Run with the Smart City config:

```bash
node scraper.js
```

Or create a custom run script. Create `scrape-smartcity.js`:

```javascript
const FairScraper = require('./scraper');
const config = require('./config.smartcity');

const scraper = new FairScraper(config);

scraper.scrape()
  .then(() => {
    console.log('✅ Smart City Expo scraping complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
```

Then run:

```bash
node scrape-smartcity.js
```

### Step 6: Check the Output

The scraper will create files in the `./output` directory:

- `participants.json` - JSON with all data
- `participants.xlsx` - Excel with multiple sheets by category

### Step 7: Adjust Settings if Needed

If you're not getting all exhibitors:

1. **Increase scroll limit**:
   ```javascript
   scrolling: {
     maxScrolls: 500,  // Increase this
   }
   ```

2. **Slow down scrolling** (if content loads slowly):
   ```javascript
   scrolling: {
     delay: 500,  // Increase delay between scrolls
     waitAfterScroll: 5000,  // Wait longer after scrolling
   }
   ```

3. **Check for "Load More" button**:
   - If the site has a "Load More" button instead of infinite scroll
   - Set `selectors.buttonToClick: '.load-more-btn'` (use actual class)

## Troubleshooting

### No data extracted

**Problem**: Empty output files

**Solutions**:
1. Check that selectors are correct (inspect the HTML again)
2. Increase `timeout` to 120000 (2 minutes)
3. Increase `scrolling.waitAfterScroll` to 5000

### Missing exhibitors

**Problem**: Only getting 100-200 exhibitors instead of 1000+

**Solutions**:
1. Increase `scrolling.maxScrolls` to 500 or higher
2. Check if there's a "Show All" filter on the website
3. Look for pagination buttons and update URL

### Missing fields (e.g., no logos)

**Problem**: Some data fields are empty

**Solutions**:
1. Verify the selector is correct
2. Check if data loads after button click (set `buttonToClick`)
3. Some fields might use `data-src` instead of `src` for images

### Website blocks the scraper

**Problem**: Page won't load or shows captcha

**Solutions**:
1. Increase delays: `scrolling.delay: 1000`
2. Add random delays in the code
3. Try running at off-peak hours

## Example Workflow

Here's a typical workflow:

```bash
# 1. Install dependencies
npm install

# 2. Inspect website in browser and find selectors
# (Use Chrome DevTools)

# 3. Update config.smartcity.js with correct selectors

# 4. Test with small sample (maxScrolls: 10)
node scrape-smartcity.js

# 5. Check output/participants.json to verify data

# 6. If data looks good, increase maxScrolls to 500

# 7. Run full scrape
node scrape-smartcity.js

# 8. Open output/participants.xlsx in Excel
```

## Tips for Fair Websites

1. **Categories**: Fair websites often have category filters. You might want to:
   - Check if filtering by category gives better results
   - Scrape each category separately
   - Merge the results

2. **Multi-language**: The URL has `lang=en_GB`. You might want to scrape in different languages if needed.

3. **Respect the server**:
   - Don't run the scraper multiple times quickly
   - Add delays between requests
   - Run during off-peak hours if possible

4. **Data quality**:
   - Some exhibitors might not have all fields (logo, website, etc.)
   - The scraper handles missing data gracefully
   - Check the Excel file's "Summary" sheet for statistics

## Need Help?

If you're stuck:

1. Run with `headless: false` to see what the browser is doing
2. Add `console.log()` statements in `scraper.js` to debug
3. Check the browser console for errors
4. Take a screenshot of the website structure and the HTML inspector

## Advanced: Handling Specific Scenarios

### If exhibitors are behind detail pages

If clicking on an exhibitor opens a detail page with more info:

1. Set `selectors.buttonToClick` to the button/link that opens details
2. The scraper will click each one and wait for content to load
3. Adjust `clickDelay` if needed

### If the site uses AJAX/infinite scroll

This is already handled by the auto-scroll feature. Just make sure:
- `enableAutoScroll: true`
- `scrolling.maxScrolls` is high enough
- `scrolling.waitAfterScroll` is long enough for content to load

### If you need to login first

Add login logic before scraping:

```javascript
// In scraper.js, before navigateToPage():
async login(username, password) {
  await this.page.goto('https://login-url.com');
  await this.page.type('#username', username);
  await this.page.type('#password', password);
  await this.page.click('#login-button');
  await this.page.waitForNavigation();
}
```
