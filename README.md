# Fair Participants Web Scraper

A powerful Node.js web scraper designed to extract participant data from fair/exhibition websites with support for dynamic content, auto-scrolling, and automated button clicking.

## Features

- **Auto-scrolling**: Automatically scrolls through pages to load all dynamically-loaded content
- **Button clicking**: Can automatically click buttons to reveal additional information
- **Data extraction**: Extracts logos, names, website links, positions, and categories
- **Multiple exports**: Outputs data in both JSON and Excel formats
- **Category grouping**: Organizes participants by category
- **Headless mode**: Can run with or without visible browser window
- **Error handling**: Robust error handling and logging
- **Configurable**: Easy to customize via config file

## Extracted Data

For each participant, the scraper extracts:

- **Logo**: Participant logo image URL
- **Name**: Company/participant name
- **Website**: Link to participant's website
- **Position**: Fair booth/stand position
- **Category**: Participant category/industry

## Installation

1. **Clone the repository** (or download the files)

```bash
git clone <your-repo-url>
cd your-template
```

2. **Install dependencies**

```bash
npm install
```

This will install:
- `puppeteer`: Headless browser automation
- `xlsx`: Excel file generation
- `p-limit`: Rate limiting

## Configuration

Before running the scraper, you need to customize the `config.js` file for your target website.

### Step 1: Find CSS Selectors

Open your target website in a browser and use Developer Tools (F12) to inspect the HTML structure:

1. Right-click on a participant card and select "Inspect"
2. Identify the CSS selectors for:
   - Participant container (the main div/element for each participant)
   - Logo image
   - Name text
   - Website link
   - Position/booth number
   - Category/industry

### Step 2: Update config.js

Edit `config.js` with your findings:

```javascript
module.exports = {
  // Target URL
  targetUrl: 'https://your-fair-website.com/participants',

  // Browser settings
  headless: false, // Set to true to hide browser window

  // CSS Selectors - CUSTOMIZE THESE!
  selectors: {
    waitFor: '.participant-card', // Element to wait for before starting
    container: '.participant-card', // Main container for each participant
    logo: 'img.logo', // Logo image selector
    name: '.company-name', // Name selector
    link: 'a.website-link', // Website link selector
    position: '.booth-number', // Position/booth selector
    category: '.category-badge', // Category selector
    buttonToClick: '.expand-button', // Optional: button to click for details
  },

  // Auto-scrolling settings
  scrolling: {
    distance: 300, // Pixels per scroll
    delay: 200, // Delay between scrolls (ms)
    maxScrolls: 200, // Maximum scrolls (safety limit)
  },
};
```

### Example: Finding Selectors

If the HTML looks like this:

```html
<div class="exhibitor-card">
  <img src="logo.png" class="exhibitor-logo" />
  <h3 class="exhibitor-name">Company ABC</h3>
  <a href="https://example.com" class="website-btn">Website</a>
  <span class="hall-location">Hall 3, Stand A42</span>
  <span class="industry-tag">Technology</span>
</div>
```

Your selectors would be:

```javascript
selectors: {
  container: '.exhibitor-card',
  logo: '.exhibitor-logo',
  name: '.exhibitor-name',
  link: '.website-btn',
  position: '.hall-location',
  category: '.industry-tag',
}
```

## Usage

### Basic Usage

```bash
npm start
```

This will:
1. Launch a browser
2. Navigate to the target URL
3. Auto-scroll to load all content
4. Extract participant data
5. Export to JSON and Excel
6. Save files in the `./output` directory

### Output Files

The scraper generates two files in the `./output` directory:

1. **participants.json**: JSON file with complete data structure
   - Metadata (total count, categories, timestamp)
   - Participants grouped by category
   - All participants in a flat array

2. **participants.xlsx**: Excel workbook with multiple sheets
   - "All Participants": Complete list
   - One sheet per category
   - "Summary": Category counts

## Advanced Usage

### Programmatic Usage

You can also use the scraper as a module:

```javascript
const FairScraper = require('./scraper');

const scraper = new FairScraper({
  targetUrl: 'https://your-custom-url.com',
  headless: true,
  exportJSON: true,
  exportExcel: true,
});

scraper.scrape()
  .then(() => console.log('Done!'))
  .catch(err => console.error('Error:', err));
```

### Custom Selectors

Override selectors at runtime:

```javascript
const scraper = new FairScraper({
  selectors: {
    container: '.custom-card',
    name: '.custom-name',
    // ... other selectors
  }
});
```

### Disable Auto-scroll

If the page doesn't require scrolling:

```javascript
const scraper = new FairScraper({
  enableAutoScroll: false,
});
```

## Troubleshooting

### No data extracted

1. **Check selectors**: Use browser Developer Tools to verify CSS selectors
2. **Wait time**: Increase `scrolling.waitAfterScroll` in config.js
3. **Check console**: Look for error messages indicating what's wrong

### Incomplete data

1. **Increase scroll**: Adjust `scrolling.maxScrolls` for longer pages
2. **Slow down**: Increase `scrolling.delay` for slower connections
3. **Button clicks**: Set `selectors.buttonToClick` if details are hidden

### Browser won't start

1. **Missing dependencies**: Run `npm install` again
2. **Linux users**: May need additional packages:
   ```bash
   sudo apt-get install -y gconf-service libasound2 libatk1.0-0 libcups2 libdbus-1-3
   ```

### Website blocks scraper

1. **Slow down**: Increase delays in config
2. **User agent**: Try different user agents in config.js
3. **Headless mode**: Try setting `headless: false`

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `targetUrl` | string | - | Target website URL |
| `headless` | boolean | `false` | Run browser in headless mode |
| `timeout` | number | `60000` | Page load timeout (ms) |
| `enableAutoScroll` | boolean | `true` | Enable auto-scrolling |
| `scrolling.distance` | number | `300` | Pixels to scroll per step |
| `scrolling.delay` | number | `200` | Delay between scrolls (ms) |
| `scrolling.maxScrolls` | number | `200` | Maximum scroll operations |
| `clickDelay` | number | `500` | Delay between button clicks (ms) |
| `exportJSON` | boolean | `true` | Export to JSON |
| `exportExcel` | boolean | `true` | Export to Excel |
| `outputDir` | string | `'./output'` | Output directory |

## Best Practices

1. **Be respectful**: Don't overload servers with too many requests
2. **Check robots.txt**: Respect the website's scraping policies
3. **Test first**: Run with `headless: false` initially to verify it works
4. **Start small**: Test with a small subset before scraping thousands of records
5. **Error handling**: Check output for any warnings or errors

## Legal Considerations

- Only scrape publicly available data
- Respect the website's Terms of Service
- Check and respect robots.txt
- Don't scrape personal or sensitive information without permission
- Add delays between requests to avoid overloading servers

## License

MIT

## Support

If you encounter issues:

1. Check the configuration file
2. Verify CSS selectors match the target website
3. Check console output for error messages
4. Try running with `headless: false` to see what's happening

## Example Output Structure

### JSON Output

```json
{
  "metadata": {
    "totalParticipants": 1250,
    "categories": 15,
    "scrapedAt": "2025-10-23T12:00:00.000Z",
    "url": "https://example-fair.com/participants"
  },
  "byCategory": {
    "Technology": [
      {
        "id": 1,
        "name": "Tech Corp",
        "logo": "https://example.com/logo.png",
        "website": "https://techcorp.com",
        "position": "Hall 3, A42",
        "category": "Technology"
      }
    ]
  },
  "allParticipants": [...]
}
```

### Excel Output

Multiple sheets:
- **All Participants**: Complete dataset
- **Technology**: Filtered by category
- **Healthcare**: Filtered by category
- **Summary**: Category statistics
