# Chrome/Chromium Setup Guide

## The Issue

You encountered "socket hang up" errors because Puppeteer couldn't download Chrome due to network restrictions (403 errors from Google's servers).

## Solution: Install Chrome Manually

### Option 1: Install Chromium (Linux)

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y chromium-browser

# Or download manually from:
# https://www.chromium.org/getting-involved/download-chromium/
```

### Option 2: Use System Chrome

If you have Chrome already installed, configure the scraper to use it by setting the `executablePath` in your config:

```javascript
{
  // ... other config ...
  puppeteerOptions: {
    executablePath: '/usr/bin/chromium-browser',  // Linux
    // executablePath: '/usr/bin/google-chrome',   // Alternative
    // executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',  // Windows
    // executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',  // macOS
  }
}
```

### Option 3: Run on Your Local Machine

Since this environment has network restrictions, you may want to:

1. **Clone the repo to your local computer:**
   ```bash
   git clone <your-repo-url>
   cd your-template
   git checkout claude/create-web-scraper-011CUPmjhp1RyGqS3XDNLZh2
   ```

2. **Install dependencies** (Puppeteer will auto-download Chrome):
   ```bash
   npm install
   ```

3. **Run the scraper:**
   ```bash
   npm run ui
   ```

4. **Open browser:**
   ```
   http://localhost:3000
   ```

## Testing Without Chrome (Development Only)

For development/testing without a browser, you can modify the code to mock browser operations, but the actual scraping won't work without Chrome.

## Next Steps

Choose one of the options above based on your environment:
- **Local development** → Use your own computer (recommended)
- **Server deployment** → Install Chromium on the server
- **Docker** → Use a Puppeteer Docker image with Chrome included

## Environment with Chrome Pre-installed

If you're using Docker, consider these images:
```bash
# Use official Puppeteer image with Chrome included
FROM ghcr.io/puppeteer/puppeteer:latest
```

or

```dockerfile
FROM node:18
RUN apt-get update && apt-get install -y chromium-browser
```
