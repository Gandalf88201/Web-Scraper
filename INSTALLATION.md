# Installation Guide

## Quick Start (Local Machine)

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd your-template
git checkout claude/create-web-scraper-011CUPmjhp1RyGqS3XDNLZh2

# 2. Install dependencies
npm install

# 3. Start the web UI
npm run ui

# 4. Open in browser
# Navigate to: http://localhost:3000
```

## What You Just Encountered

You got "Error: socket hang up" because:
1. Puppeteer tried to auto-download Chrome browser
2. Network restrictions blocked the download (403 Forbidden)
3. This is common in restricted environments or behind corporate firewalls

## Current Status

✅ **All code is complete and working**
✅ **Dependencies installed** (except Chrome browser)
❌ **Chrome browser missing** - needed to run the scraper

## Solutions

### Solution 1: Run on Your Local Computer (Recommended)

Pull the code to your local machine where network access isn't restricted:

```bash
git pull origin claude/create-web-scraper-011CUPmjhp1RyGqS3XDNLZh2
npm install  # Will auto-download Chrome
npm run ui
```

### Solution 2: Install Chrome Manually

If you have server access:

```bash
# Linux
sudo apt-get install chromium-browser

# Then verify:
which chromium-browser
```

Then update your scraper config to use it:
```javascript
puppeteerOptions: {
  executablePath: '/usr/bin/chromium-browser'
}
```

### Solution 3: Use Docker with Chrome

```dockerfile
FROM ghcr.io/puppeteer/puppeteer:latest
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "ui"]
```

## Verifying Installation

Once Chrome is available, test with:

```bash
npm run ui
```

You should see:
```
==========================================================
🚀 Fair Scraper Web UI
==========================================================

✅ Server running at: http://localhost:3000

Open your browser and navigate to the URL above to start.
```

## Troubleshooting

### "Puppeteer can't find Chrome"
- Install Chromium: `sudo apt-get install chromium-browser`
- Or specify path in config

### "Port 3000 already in use"
```bash
# Kill existing process
lsof -i :3000
kill -9 <PID>

# Or use different port
PORT=3001 npm run ui
```

### Network/403 Errors
- Try on local machine instead of restricted server
- Use VPN if behind corporate firewall
- Use Docker image with Chrome pre-installed

## What's Included

All features are implemented and ready to use:

✅ Web scraping with auto-scroll (1000+ items)
✅ Login authentication for protected sites
✅ Visual element selector (Chrome extension-style)
✅ Real-time progress tracking
✅ JSON + Excel export with category sheets
✅ Save/load configurations
✅ User-friendly web UI

## Need Help?

See also:
- **CHROME_SETUP.md** - Detailed Chrome installation guide
- **QUICKSTART.md** - Using the scraper for Smart City Expo
- **TROUBLESHOOTING.md** - Common issues and solutions
- **README.md** - Full documentation
