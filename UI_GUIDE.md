# Web UI Guide

The Fair Scraper includes a user-friendly web interface that makes configuration and scraping much easier!

## Why Use the Web UI?

- **No code editing required** - Configure everything through forms
- **Login support** - Easily configure login credentials for protected websites
- **Real-time progress** - Watch the scraping progress in real-time
- **Save configurations** - Save and load different configurations for different websites
- **Download results** - Download output files directly from the interface
- **Visual feedback** - See exactly what's happening with progress bars and status messages

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Web UI

```bash
npm run ui
```

The server will start and display:
```
✅ Server running at: http://localhost:3000
```

### 3. Open in Browser

Open your web browser and go to:
```
http://localhost:3000
```

## Using the Interface

### Configuration Sections

#### 🌐 Basic Settings

- **Target URL** (Required): The URL of the fair exhibitors page
- **Browser Mode**:
  - Visible: See the browser window (recommended for testing)
  - Headless: Faster, runs in background
- **Timeout**: How long to wait for pages to load (in milliseconds)

#### 🔐 Login Settings

Check "Login Required" if the website requires authentication:

1. **Login Page URL**: Where to go to login (e.g., `https://example.com/login`)
2. **Username/Email**: Your login username or email
3. **Password**: Your password
4. **Username Field Selector**: CSS selector for the username input (e.g., `#username`)
5. **Password Field Selector**: CSS selector for the password input (e.g., `#password`)
6. **Login Button Selector**: CSS selector for the submit button (e.g., `button[type="submit"]`)
7. **Wait After Login**: How long to wait after logging in (milliseconds)

**Finding Login Selectors:**
1. Open the login page in your browser
2. Right-click on the username field → Inspect
3. Look for `id="username"` → selector is `#username`
4. Or look for `class="login-input"` → selector is `.login-input`

#### 📜 Auto-Scroll Settings

Control how the scraper scrolls to load all content:

- **Enable Auto-Scrolling**: Check if the page has infinite scroll
- **Scroll Distance**: How many pixels to scroll each time (default: 400)
- **Scroll Delay**: Wait time between scrolls in ms (default: 300)
- **Max Scrolls**: Maximum number of times to scroll (default: 300)
  - For 1000+ exhibitors, use 300-500
- **Wait After Scroll**: Wait time after all scrolling is done (default: 3000)

#### 🎯 CSS Selectors

These tell the scraper where to find the data:

- **Wait For Element**: Element to wait for before starting (usually same as container)
- **Container Selector** (Required): The main div/element for each exhibitor
- **Logo Selector**: Where to find the logo image
- **Name Selector** (Required): Where to find the company name
- **Website Link Selector**: Where to find the website URL
- **Position/Booth Selector**: Where to find the stand/booth number
- **Category Selector**: Where to find the category/sector
- **Button to Click**: Optional button to click to reveal details

**How to Find Selectors:**

1. Open the target website
2. Right-click on an exhibitor card → "Inspect"
3. Look at the HTML structure
4. Find class names or IDs

Example:
```html
<div class="exhibitor-card">
  <img class="company-logo" src="logo.jpg" />
  <h3 class="company-name">ABC Corp</h3>
  <a class="website-link" href="https://example.com">Website</a>
  <span class="booth-location">Hall 3, A42</span>
  <div class="sector">Technology</div>
</div>
```

Selectors would be:
- Container: `.exhibitor-card`
- Logo: `img.company-logo` or `.company-logo`
- Name: `.company-name`
- Link: `a.website-link` or `.website-link`
- Position: `.booth-location`
- Category: `.sector`

#### 💾 Export Settings

Choose output formats:
- **Export to JSON**: Creates a structured JSON file with data grouped by category
- **Export to Excel**: Creates an Excel file with multiple sheets

### Saving and Loading Configurations

#### Save Configuration

1. Fill in all the settings
2. Click "Save As..." button
3. Enter a name (e.g., "smart-city-expo-2025")
4. Click "Save"

Your configuration is saved and can be loaded later.

#### Load Configuration

1. Click the "Load Saved Config" dropdown
2. Select a saved configuration
3. Click "Load"

All fields will be filled with the saved values.

### Running the Scraper

1. Fill in all required fields (marked with *)
2. Click "🚀 Start Scraping"
3. Watch the progress bar
4. When complete, download files from the Output Files section

### Monitoring Progress

Once started, you'll see:

- **Progress Bar**: Visual progress from 0-100%
- **Status**: Current action (e.g., "Logging in...", "Scrolling...", "Extracting data...")
- **Participants**: Number of participants extracted so far

### Downloading Results

After scraping completes:

1. Scroll to the "Output Files" section
2. You'll see:
   - `participants.json` - JSON data file
   - `participants.xlsx` - Excel file
3. Click "Download" to get the files

## Tips for Success

### 1. Test with Small Sample First

- Set "Max Scrolls" to 10-20 initially
- Run the scraper
- Check the output to verify selectors are correct
- If good, increase Max Scrolls and run again

### 2. Use Visible Browser Mode

- Keep "Browser Mode" on "Visible" while testing
- Watch what the browser does
- This helps you understand if something goes wrong

### 3. Finding the Right Selectors

- The most important selectors are:
  - **Container** (required) - Must be correct or nothing works
  - **Name** (required) - Essential for identifying participants
  - Others are optional but recommended

- Common container patterns:
  - `.exhibitor-card`
  - `.company-item`
  - `[class*="exhibitor"]`
  - `article`

### 4. Login Issues

If login fails:
- Check username/password are correct
- Verify login URL is correct
- Check selectors match the login form
- Try increasing "Wait After Login"
- Watch in visible mode to see what's happening

### 5. Not Getting All Exhibitors

If you're missing exhibitors:
- Increase "Max Scrolls"
- Increase "Wait After Scroll"
- Check if there's a "Show All" filter on the website
- Check if website has pagination (buttons to click)

### 6. Slow Scraping

If scraping is too slow:
- Decrease "Scroll Delay" (but not below 200ms)
- Switch to "Headless" mode
- Check your internet connection

### 7. Saving Passwords Securely

- Saved configurations include passwords
- They're stored locally in the `saved-configs/` folder
- Don't commit this folder to git (it's in .gitignore)
- Don't share configurations with others if they contain passwords

## Troubleshooting

### Server won't start

**Error**: Port 3000 is already in use

**Solution**:
```bash
# Use a different port
PORT=3001 npm run ui
```

Then open `http://localhost:3001`

### Can't connect to server

**Check**:
1. Is the server running? (Check terminal)
2. Are you using the correct URL?
3. Try `http://127.0.0.1:3000` instead

### Configuration won't load

**Check**:
1. Does the configuration exist in `saved-configs/` folder?
2. Is it a valid JSON file?
3. Try saving a new configuration

### Scraper shows "Error"

**Check**:
1. All required fields are filled
2. URL is correct and accessible
3. Selectors match the website structure
4. Login credentials are correct (if applicable)

### No data extracted

**Possible causes**:
1. Wrong selectors - Check with browser DevTools
2. Page not fully loaded - Increase timeouts
3. Login failed - Verify credentials
4. Wrong URL - Check the URL in browser first

## API Endpoints

If you want to integrate programmatically:

### Start Scraping
```bash
POST /api/scrape/start
Content-Type: application/json

{
  "targetUrl": "https://...",
  "selectors": { ... },
  ...
}
```

### Stop Scraping
```bash
POST /api/scrape/stop
```

### Get Status
```bash
GET /api/scrape/status
```

### Save Configuration
```bash
POST /api/config/save
Content-Type: application/json

{
  "name": "my-config",
  "config": { ... }
}
```

### Load Configuration
```bash
GET /api/config/:name
```

### List Outputs
```bash
GET /api/outputs
```

### Download File
```bash
GET /api/output/:filename
```

## Example: Smart City Expo 2025

Here's an example configuration for Smart City Expo:

1. **Basic Settings**:
   - Target URL: `https://ecatalogue.firabarcelona.com/smartcityexpo2025/home?filter=ONLY_EXHIBITORS&lang=en_GB`
   - Browser Mode: Visible (for testing)
   - Timeout: 90000

2. **Login Settings**:
   - ✓ Login Required
   - Login URL: `https://ecatalogue.firabarcelona.com/smartcityexpo2025/login`
   - Username: (your username)
   - Password: (your password)
   - Username Selector: `#username` (UPDATE to match actual page)
   - Password Selector: `#password` (UPDATE to match actual page)
   - Submit Selector: `button[type="submit"]` (UPDATE to match actual page)

3. **Auto-Scroll**:
   - ✓ Enable Auto-Scrolling
   - Max Scrolls: 300

4. **Selectors** (IMPORTANT: Verify these):
   - Container: `.exhibitor-card` (UPDATE to match actual page)
   - Name: `.company-name` (UPDATE to match actual page)
   - Logo: `img.logo` (UPDATE to match actual page)
   - Link: `a.website` (UPDATE to match actual page)
   - Position: `.stand-location` (UPDATE to match actual page)
   - Category: `.sector` (UPDATE to match actual page)

5. **Export**:
   - ✓ Export to JSON
   - ✓ Export to Excel

Then click "🚀 Start Scraping" and watch it work!

## Security Notes

- **Never share configurations** that contain passwords
- Saved configs are stored locally only
- Use environment variables for passwords in production
- The web UI is for local use only (not secure for internet exposure)

## Advanced Usage

### Running on Different Port

```bash
PORT=8080 npm run ui
```

### Remote Access

The UI is designed for local use. To access from another computer:

1. Find your IP address:
   ```bash
   # Linux/Mac
   ifconfig | grep inet

   # Windows
   ipconfig
   ```

2. Start server:
   ```bash
   npm run ui
   ```

3. Access from other computer:
   ```
   http://YOUR-IP-ADDRESS:3000
   ```

**Warning**: This is not secure. Only use on trusted networks.

## Best Practices

1. ✅ Save configurations for reuse
2. ✅ Test with visible browser first
3. ✅ Start with low Max Scrolls
4. ✅ Verify output after test runs
5. ✅ Keep server terminal visible to see logs
6. ✅ Use descriptive configuration names
7. ❌ Don't commit saved-configs to git
8. ❌ Don't run multiple scrapings simultaneously
9. ❌ Don't scrape too aggressively (respect servers)

## Getting Help

1. Check selector with "Need help?" link in UI
2. Watch browser in visible mode
3. Check server terminal for detailed logs
4. Read SETUP_GUIDE.md for detailed instructions
5. Open browser console (F12) for JavaScript errors

Happy scraping! 🚀
