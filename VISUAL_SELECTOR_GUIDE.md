# Visual Selector Tool Guide

The Visual Selector Tool allows you to **visually select elements with your mouse** instead of manually finding CSS selectors. This makes configuration incredibly easy!

## 🎯 What is the Visual Selector?

Instead of using browser DevTools to find CSS selectors, the Visual Selector:
1. Opens your target website in a browser
2. Adds a visual overlay with instructions
3. Lets you **click on elements** to select them
4. **Automatically generates** the best CSS selector
5. **Fills in the form** for you automatically

## 🚀 How to Use

### Step 1: Enter Basic Information

In the Web UI (http://localhost:3000):

1. **Target URL**: Enter the exhibitors page URL
   ```
   https://ecatalogue.firabarcelona.com/smartcityexpo2025/home?filter=ONLY_EXHIBITORS&lang=en_GB
   ```

2. **Login Settings** (if required):
   - ✓ Check "Login Required"
   - Enter login URL, username, password
   - Enter login field selectors (username, password, submit button)

### Step 2: Click "Visual Selector" Button

1. Scroll to the **"🎯 CSS Selectors"** section
2. Click the **"🖱️ Visual Selector"** button
3. A new browser window will open

### Step 3: Select Elements

A panel will appear on the right side with a list:

1. **Container (Main Card)** - Click "Select" then click on one exhibitor card
2. **Company Name** - Click "Select" then click on the company name
3. **Logo** - Click "Select" then click on the logo image
4. **Website Link** - Click "Select" then click on the website link
5. **Booth Position** - Click "Select" then click on the stand/booth number
6. **Category/Sector** - Click "Select" then click on the category
7. **Expand Button** (Optional) - If there's a button to reveal more info

### Step 4: Click "Done & Use Selectors"

When you're done selecting, click **"Done & Use Selectors"** in the panel.

The browser will close and all selectors will be **automatically filled** in the Web UI!

## 🎨 Visual Features

### Hover Highlighting
- When in selection mode, hovering over elements highlights them with a blue outline
- A tooltip shows the CSS selector that will be used

### Auto-Selector Generation
The tool intelligently generates the best selector by trying:
1. ID (if unique)
2. Class name (if unique)
3. Tag + class combination
4. Fallback to tag name

### Real-time Updates
As you select elements:
- The Web UI fields update in real-time
- A notification shows what was selected
- The field flashes green to indicate it was updated

## 📋 Step-by-Step Example: Smart City Expo

### 1. Start the Web UI
```bash
npm run ui
```

### 2. Fill in Basic Info
- **Target URL**: `https://ecatalogue.firabarcelona.com/smartcityexpo2025/home?filter=ONLY_EXHIBITORS&lang=en_GB`
- **Login Required**: ✓ Checked
- **Login URL**: (the login page URL)
- **Username**: your-username
- **Password**: your-password
- **Username Selector**: `#username` (or whatever you found)
- **Password Selector**: `#password`
- **Submit Selector**: `button[type="submit"]`

### 3. Click Visual Selector

Click the "🖱️ Visual Selector" button.

A browser opens showing the Smart City Expo site (after logging in automatically).

### 4. Select Container

1. In the right panel, click "Select" next to "Container (Main Card)"
2. The instructions say "👆 Click on the container element"
3. Click on any exhibitor card
4. ✅ Container selector is captured!

### 5. Select Name

1. Click "Select" next to "Company Name"
2. Click on a company name in any exhibitor card
3. ✅ Name selector is captured!

### 6. Repeat for Other Elements

Continue selecting:
- Logo (the company logo image)
- Website Link (the website button/link)
- Booth Position (the stand/hall location)
- Category (the sector/industry tag)

You can **skip** any optional elements by clicking "Skip Current".

### 7. Done!

Click "Done & Use Selectors".

The browser closes and **all your selectors are filled in** the Web UI automatically!

## 🔍 Understanding the Panel

### Selection List
Each item shows:
- **Number**: Order of selection
- **Label**: What element to select
- **Status**: "Click to select" or the CSS selector once selected
- **Select Button**: Click to enter selection mode

### Status Indicators
- **Gray background**: Not selected yet
- **Blue border**: Currently in selection mode
- **Green border**: Successfully selected

### Actions
- **Skip Current**: Skip the current selection
- **Done & Use Selectors**: Finish and apply all selectors

## 💡 Tips

### Tip 1: Select Container First
Always select the container (main card) first. This is the most important selector.

### Tip 2: Click Precisely
Click directly on the element you want, not its parent or child.

### Tip 3: Watch the Tooltip
The tooltip shows the selector that will be used. Make sure it looks reasonable.

### Tip 4: Test Selectors
After selecting, you can test by clicking "🚀 Start Scraping" with "Max Scrolls" set to 10.

### Tip 5: Re-run if Needed
If selectors don't work, just click "🖱️ Visual Selector" again to re-select.

## 🛠️ Troubleshooting

### Browser Doesn't Open
**Problem**: Visual selector doesn't launch

**Solutions**:
- Make sure Target URL is filled in
- Check console for errors
- Try running `npm install` again

### Can't Click on Elements
**Problem**: Clicking doesn't select elements

**Solutions**:
- Make sure you clicked "Select" button first
- Don't click inside the selector panel
- Try clicking directly on the element (not nearby)

### Wrong Element Selected
**Problem**: Selected the wrong element

**Solutions**:
- Click "Select" again for that element type
- Click on the correct element
- Previous selection will be replaced

### Login Fails
**Problem**: Visual selector can't log in

**Solutions**:
- Verify login URL is correct
- Check username/password are correct
- Make sure login field selectors are correct
- Try manually filling them in the Web UI first

### Selectors Don't Work in Scraper
**Problem**: Selectors are filled in but scraper doesn't extract data

**Solutions**:
- The website might use different selectors for different items
- Try selecting from different exhibitor cards
- Check if some fields are loaded dynamically (need to scroll first)
- Increase "Wait After Scroll" timeout

## 🎯 Common Selector Patterns

The tool generates these patterns:

### By ID
```
#exhibitor-123
```
Good: Very specific
Bad: Might be unique per item

### By Class
```
.exhibitor-card
.company-name
```
Good: Reusable across all items
Bad: Might select too many if not specific

### By Tag + Class
```
div.exhibitor-card
h3.company-name
img.logo
```
Good: Balance of specificity
Recommended: This is what the tool prefers

### By Attribute
```
[data-exhibitor-id]
```
Good: Stable selectors
Bad: Not all sites use data attributes

## ⚡ Advanced Features

### Smart Container Detection
If you select a child element first, the tool can help identify its parent container.

### Unique Selector Preference
The tool tries to generate selectors that:
- Match multiple exhibitors (for container, logo, name, etc.)
- Are stable (won't change if site updates)
- Are readable (easy to understand)

### Multi-Class Handling
If an element has multiple classes, the tool picks the most relevant one.

## 📊 Workflow Integration

### Full Workflow
1. **Start Web UI**: `npm run ui`
2. **Enter URL**: Target exhibitors page
3. **Configure Login**: If needed
4. **Visual Selector**: Click button, select elements
5. **Test**: Set Max Scrolls = 10, start scraper
6. **Verify**: Check output
7. **Full Scrape**: Set Max Scrolls = 300, start scraper
8. **Download**: Get JSON and Excel files

### Time Savings
- **Manual way**: 10-15 minutes finding selectors with DevTools
- **Visual Selector**: 2-3 minutes clicking on elements
- **Savings**: ~80% faster! 🚀

## 🔐 Security

- Login credentials are used only to access the site
- They're never stored or sent anywhere
- The browser runs locally on your machine
- Same security as manual browsing

## 🆘 Getting Help

### Documentation
- This guide for Visual Selector
- UI_GUIDE.md for Web UI
- QUICKSTART.md for complete workflow

### Video Walkthrough
1. Start Web UI
2. Enter basic settings
3. Click Visual Selector
4. Select each element by clicking
5. Click Done
6. Start scraping

### Need More Help?
- Check browser console (F12) for errors
- Look at the selector panel tooltips
- Try the manual DevTools method as backup
- Re-read the "Troubleshooting" section above

## ✅ Success Checklist

- [ ] Web UI started (npm run ui)
- [ ] Target URL entered
- [ ] Login configured (if required)
- [ ] Visual Selector button clicked
- [ ] Browser window opened
- [ ] Container selected
- [ ] Name selected
- [ ] Other elements selected (logo, link, position, category)
- [ ] "Done & Use Selectors" clicked
- [ ] Selectors auto-filled in Web UI
- [ ] Test run successful
- [ ] Full scrape completed

Congratulations! You've mastered the Visual Selector Tool! 🎉
