# Quick Start: Smart City Expo 2025

Get started scraping the Smart City Expo Barcelona 2025 exhibitors in 5 minutes!

## 🚀 Fast Track (5 Minutes)

### 1. Install Dependencies (1 minute)

```bash
npm install
```

### 2. Find Selectors (2 minutes)

Run the inspector tool:

```bash
npm run inspect
```

This will:
- Open the Smart City Expo website in a browser
- Analyze the page structure
- Suggest potential CSS selectors

**Keep the browser window open** and use Chrome DevTools:
1. Right-click on any exhibitor card
2. Click "Inspect"
3. Identify the class names for:
   - Container (the main div for each exhibitor)
   - Logo (the img tag)
   - Company name (usually h2 or h3)
   - Website link (a tag)
   - Stand/booth position
   - Category/sector

### 3. Update Config (1 minute)

Edit `config.smartcity.js` and update the `selectors` section with what you found:

```javascript
selectors: {
  waitFor: '.exhibitor-card',      // Replace with actual class
  container: '.exhibitor-card',    // Replace with actual class
  logo: 'img.company-logo',        // Replace with actual selector
  name: '.company-name',           // Replace with actual class
  link: 'a.website',               // Replace with actual selector
  position: '.stand-location',     // Replace with actual class
  category: '.sector-tag',         // Replace with actual class
}
```

### 4. Test Run (1 minute)

Run a quick test (scrapes ~50-100 exhibitors):

```bash
npm run smartcity:test
```

This runs with limited scrolling to verify your selectors work.

### 5. Check Output

Open the files:
- `output/participants.json` - All data in JSON
- `output/participants.xlsx` - Excel file with sheets by category

If the data looks good, proceed to full scrape! If not, adjust selectors and retry.

## 🏆 Full Scrape

Once you've verified the selectors work:

```bash
npm run smartcity
```

This will:
- Scrape all 1000+ exhibitors
- Take 5-15 minutes depending on internet speed
- Show progress in the terminal
- Save results to `output/` folder

### Run in Headless Mode (Faster)

```bash
npm run smartcity:headless
```

## 📊 Understanding the Output

### JSON File Structure

```json
{
  "metadata": {
    "totalParticipants": 1234,
    "categories": 15,
    "scrapedAt": "2025-10-23T...",
    "url": "https://..."
  },
  "byCategory": {
    "Smart Mobility": [...],
    "Urban Infrastructure": [...],
    ...
  },
  "allParticipants": [...]
}
```

### Excel File Sheets

1. **All Participants** - Complete list of everyone
2. **Summary** - Count by category
3. **[Category Name]** - One sheet per category with filtered exhibitors

## 🔧 Troubleshooting

### "No participants extracted"

**Cause**: Selectors are wrong

**Fix**:
1. Run `npm run inspect` again
2. Double-check the selectors in DevTools
3. Update `config.smartcity.js`
4. Try test run again

### "Only got 100 exhibitors instead of 1000+"

**Cause**: Not scrolling enough

**Fix**: Edit `config.smartcity.js`:

```javascript
scrolling: {
  maxScrolls: 500,  // Increase this number
  waitAfterScroll: 5000,  // Increase wait time
}
```

### "Browser won't open"

**Cause**: Missing dependencies

**Fix** (Linux):
```bash
sudo apt-get install -y chromium-browser
```

**Fix** (All platforms):
```bash
npm install
```

### "Website looks different / no exhibitors showing"

**Cause**: Wrong URL or filters

**Fix**:
1. Open the website manually
2. Apply filters to show exhibitors
3. Copy the correct URL from browser
4. Update `targetUrl` in `config.smartcity.js`

## 🎯 Common Selector Patterns

Here are examples of what selectors might look like:

```javascript
// Example 1: Class-based
container: '.exhibitor-item'
name: '.exhibitor-name'
logo: '.exhibitor-logo'

// Example 2: Nested
container: '.company-card'
name: '.company-card h3'
logo: '.company-card img'

// Example 3: Attribute-based
container: '[data-exhibitor-id]'
name: '[data-exhibitor-name]'

// Example 4: Complex
container: 'article.exhibitor'
name: 'article.exhibitor .info h2'
link: 'article.exhibitor .actions a.website'
```

## 📋 Complete Workflow Example

```bash
# 1. Install
npm install

# 2. Inspect website to find selectors
npm run inspect
# (Browser opens, take notes of class names)

# 3. Edit config.smartcity.js
# Update all selectors in the 'selectors' object

# 4. Test with limited data
npm run smartcity:test

# 5. Check output
cat output/participants.json | head -50
# or open output/participants.xlsx

# 6. If good, run full scrape
npm run smartcity

# 7. Wait 5-15 minutes

# 8. Open Excel file
open output/participants.xlsx  # macOS
xdg-open output/participants.xlsx  # Linux
start output/participants.xlsx  # Windows
```

## 💡 Pro Tips

1. **Run during off-peak hours** - Faster and more respectful to the server

2. **Keep backups** - The output folder gets overwritten. Save successful scrapes:
   ```bash
   cp output/participants.xlsx "smartcity_$(date +%Y%m%d).xlsx"
   ```

3. **Scrape by category** - If you only need specific sectors, filter the URL first

4. **Verify data** - Check a few random entries manually to ensure accuracy

5. **Respect rate limits** - Don't run multiple times in quick succession

## 🆘 Need More Help?

See the detailed guide: [SETUP_GUIDE.md](SETUP_GUIDE.md)

## ⚖️ Legal & Ethical

- Only scrape publicly available data
- Don't overload the server (respect delays in config)
- Check the website's Terms of Service
- Use the data responsibly

## 🎉 Success Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] Selectors identified (using inspect tool)
- [ ] Config updated (`config.smartcity.js`)
- [ ] Test run successful (`npm run smartcity:test`)
- [ ] Output files created and look correct
- [ ] Full scrape completed
- [ ] Excel file has multiple category sheets
- [ ] Participant count matches expectations (~1000+)

Good luck! 🚀
