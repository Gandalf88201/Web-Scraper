# Quick Start Guide - Smart City Expo 2025

## Setup (One-Time)

```bash
# 1. Install dependencies
npm install
```

## Running the Web UI

```bash
# Start the web interface
npm run ui
```

Then open: **http://localhost:3000**

## Configuration Steps for Smart City Expo

### ⚡ Quick Method: Visual Selector (Recommended)

**Easiest way - No DevTools needed!**

1. In the Web UI, enter:
   - Target URL: `https://ecatalogue.firabarcelona.com/smartcityexpo2025/home?filter=ONLY_EXHIBITORS&lang=en_GB`
   - Login URL, username, password
   - Login field selectors (see Step 1 below for finding these)

2. Click **"🖱️ Visual Selector"** button

3. A browser window opens with a panel on the right

4. Click "Select" for each element, then click on the element on the page:
   - Container (the exhibitor card)
   - Company Name
   - Logo
   - Website Link
   - Booth Position
   - Category

5. Click **"Done & Use Selectors"**

6. All selectors are automatically filled in! ✨

7. Skip to Step 4 below

See [VISUAL_SELECTOR_GUIDE.md](VISUAL_SELECTOR_GUIDE.md) for detailed Visual Selector instructions.

---

### 🔧 Manual Method: DevTools (Alternative)

If you prefer to find selectors manually:

### Step 1: Find Login Selectors

1. Open https://ecatalogue.firabarcelona.com/smartcityexpo2025/login in Chrome
2. Press F12 to open DevTools
3. Click on the username field
4. In DevTools, look for the `id` or `class` attribute
5. Repeat for password field and login button

**Example:**
```html
<input id="email" type="text" />          → Selector: #email
<input id="password" type="password" />   → Selector: #password
<button class="login-btn">Login</button>  → Selector: .login-btn
```

### Step 2: Find Data Selectors

1. After logging in, go to the exhibitors page
2. Right-click on an exhibitor card → Inspect
3. Find the main container class
4. Find selectors for: logo, name, website, position, category

**Example:**
```html
<div class="exhibitor-card">
  <img class="logo" src="..." />
  <h3 class="name">Company Name</h3>
  <a class="website" href="...">Website</a>
  <span class="booth">Hall 3</span>
  <div class="sector">Technology</div>
</div>
```

Selectors:
- Container: `.exhibitor-card`
- Logo: `.logo` or `img.logo`
- Name: `.name` or `h3.name`
- Website: `.website` or `a.website`
- Position: `.booth`
- Category: `.sector`

### Step 3: Configure in Web UI

Fill in the form:

**Basic Settings:**
- Target URL: `https://ecatalogue.firabarcelona.com/smartcityexpo2025/home?filter=ONLY_EXHIBITORS&lang=en_GB`
- Browser Mode: Visible
- Timeout: 90000

**Login Settings:**
- ✓ Login Required
- Login URL: `https://ecatalogue.firabarcelona.com/smartcityexpo2025/login`
- Username: (your username)
- Password: (your password)
- Username Selector: (from Step 1)
- Password Selector: (from Step 1)
- Submit Selector: (from Step 1)
- Wait After Login: 3000

**Auto-Scroll:**
- ✓ Enable Auto-Scrolling
- Scroll Distance: 400
- Scroll Delay: 300
- Max Scrolls: 10 (for testing) or 300 (for full scrape)
- Wait After Scroll: 3000

**Selectors:**
- Wait For: (same as Container)
- Container: (from Step 2)
- Logo: (from Step 2)
- Name: (from Step 2)
- Link: (from Step 2)
- Position: (from Step 2)
- Category: (from Step 2)

**Export:**
- ✓ Export to JSON
- ✓ Export to Excel

### Step 4: Save Configuration

1. Click "Save As..."
2. Name: "smart-city-expo-2025"
3. Click "Save"

Now you can reload this configuration anytime!

### Step 5: Test Run

1. Make sure Max Scrolls = 10 (test mode)
2. Click "🚀 Start Scraping"
3. Watch the progress
4. Check output files to verify data is correct

### Step 6: Full Scrape

1. Load saved configuration
2. Change Max Scrolls to 300
3. Click "🚀 Start Scraping"
4. Wait 10-20 minutes for completion
5. Download results

## Troubleshooting

### Login Fails
- Check username/password are correct
- Verify login URL is correct
- Check selectors match the actual login form
- Watch browser in visible mode to see what happens

### No Data Extracted
- Verify selectors are correct
- Check container selector first (most important)
- Use browser DevTools to verify class names
- Make sure you're logged in successfully

### Missing Exhibitors
- Increase Max Scrolls to 500
- Increase Wait After Scroll to 5000
- Check if website has pagination buttons

### Browser Won't Open
- Run: `npm install` again
- Make sure Puppeteer installed correctly
- Check for errors in terminal

## Output Files

After scraping, download from Web UI:

- **participants.json** - All data in JSON format
- **participants.xlsx** - Excel file with multiple sheets

Excel sheets:
- All Participants
- (One sheet per category)
- Summary

## Security

- Saved configurations contain passwords
- Stored locally in `saved-configs/` folder
- NOT committed to git
- Don't share saved configs with others

## Support

- **UI_GUIDE.md** - Complete Web UI documentation
- **SETUP_GUIDE.md** - Detailed setup guide
- **README.md** - General information

## Commands Reference

```bash
# Start Web UI (recommended)
npm run ui

# Run via command line
npm run smartcity

# Test mode (limited scrolling)
npm run smartcity:test

# Selector inspector
npm run inspect
```

---

**Success checklist:**
- [ ] Dependencies installed
- [ ] Web UI started (http://localhost:3000)
- [ ] Login selectors found
- [ ] Data selectors found
- [ ] Configuration filled in Web UI
- [ ] Configuration saved
- [ ] Test run successful (Max Scrolls = 10)
- [ ] Output data looks correct
- [ ] Full scrape started (Max Scrolls = 300)
- [ ] Results downloaded

Good luck! 🚀
