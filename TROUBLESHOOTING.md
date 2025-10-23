# Troubleshooting: Visual Selector Popup Not Opening

This guide will help you debug why the Visual Selector popup window isn't opening.

## Step 1: Check Browser Console

Open browser Developer Tools (F12) and check the Console tab for errors.

### What to look for:

1. **Click "🖱️ Visual Selector" button**
2. **Watch the console**

You should see:
```
🎯 Starting visual selector...
Target URL: https://...
Login required: true/false
✅ Server response: {sessionId: "..."}
Session ID: ...
👂 Listening for selector-ready event...
```

Then after 10-30 seconds:
```
📡 Received selector-ready event: {sessionId: "..."}
✅ Session ID matches, opening popup...
Opening URL: /embedded-selector.html?session=...
✅ Popup opened successfully
```

### Common Issues:

#### Issue 1: "❌ Popup blocked!"

**Cause**: Browser is blocking popups

**Solution**:
1. Look for popup blocker icon in address bar (usually top right)
2. Click it and select "Always allow popups from localhost"
3. Or manually allow popups:
   - **Chrome**: Settings → Privacy → Site Settings → Popups → Add `http://localhost:3000`
   - **Firefox**: Preferences → Privacy → Permissions → Block pop-up windows → Exceptions → Add `http://localhost:3000`
   - **Edge**: Settings → Cookies and site permissions → Pop-ups and redirects → Allow → Add `http://localhost:3000`

4. If blocked, you'll see a notification with a clickable link - **click the link** to open in a new tab

#### Issue 2: "❌ Timeout waiting for selector-ready event"

**Cause**: Page is taking too long to load or server error

**Solution**:
1. Check server terminal for error messages
2. Try a simpler URL first (e.g., `https://www.example.com` without login)
3. Check your internet connection
4. Increase timeout (see below)

#### Issue 3: No console messages at all

**Cause**: JavaScript error or button not working

**Solution**:
1. Check for red error messages in console
2. Refresh the page (F5)
3. Make sure you're on http://localhost:3000
4. Try different browser (Chrome recommended)

## Step 2: Check Server Terminal

Look at the terminal where you ran `npm run ui`.

### What to look for:

You should see:
```
🔐 Getting authenticated page content...
🌐 Loading https://...
✅ Page content retrieved
✅ Selector session abc123 ready
```

### Common Issues:

#### Issue 1: Login errors

```
❌ Login failed: ...
```

**Solution**:
1. Verify login URL is correct
2. Check username/password are correct
3. Verify login field selectors match the actual page
4. Try logging in manually first to verify credentials

#### Issue 2: Timeout errors

```
TimeoutError: Navigation timeout of 90000 ms exceeded
```

**Solution**:
1. The website is slow or unreachable
2. Check your internet connection
3. Try increasing timeout in code (see below)

#### Issue 3: Puppeteer errors

```
Error: Failed to launch the browser process!
```

**Solution (Linux)**:
```bash
sudo apt-get install -y \
  chromium-browser \
  fonts-liberation \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libatspi2.0-0 \
  libcups2 \
  libdbus-1-3 \
  libdrm2 \
  libgbm1 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libxcomposite1 \
  libxdamage1 \
  libxfixes3 \
  libxkbcommon0 \
  libxrandr2 \
  xdg-utils
```

## Step 3: Test with Simple URL

Try a simple test without login first:

1. **Target URL**: `https://www.example.com`
2. **Uncheck** "Login Required"
3. Click "🖱️ Visual Selector"

If this works, the issue is with your login configuration.

## Step 4: Manual Fallback

If popup is blocked and you see the notification with a link:

**Click the link in the notification** - it will open the Visual Selector in a new tab instead of a popup.

## Step 5: Detailed Debugging Steps

### Check Network Tab

1. Open DevTools (F12)
2. Go to Network tab
3. Click "🖱️ Visual Selector"
4. Look for:
   - `POST /api/selector/start` - Should return 200 OK
   - `GET /embedded-selector.html` - Should load
   - `GET /api/selector/content/:sessionId` - Should return HTML

### Check Socket Connection

In browser console, type:
```javascript
socket.connected
```

Should return `true`. If `false`:
1. Server might be down
2. Socket.IO connection failed
3. Try refreshing page

### Enable Verbose Logging

All console messages now have emojis for easy scanning:
- 🎯 = Starting process
- ✅ = Success
- ❌ = Error
- 📡 = Network event
- 👂 = Waiting for event
- ⚠️ = Warning

## Step 6: Common Solutions

### Solution 1: Allow Popups

**Chrome:**
```
1. Click lock icon in address bar
2. Site settings
3. Pop-ups and redirects → Allow
4. Refresh page
```

**Firefox:**
```
1. Click shield icon in address bar
2. Turn off blocking for This Site
3. Refresh page
```

### Solution 2: Use Link Fallback

If you see notification:
```
"Popup was blocked. Click here to open Visual Selector in new tab"
```

Just click the link! It works the same way.

### Solution 3: Check Server Logs

Always check the server terminal for detailed error messages.

### Solution 4: Restart Everything

```bash
# Stop server (Ctrl+C)
# Clear npm cache
npm cache clean --force

# Reinstall
npm install

# Start again
npm run ui
```

## Step 7: Test Checklist

Go through this checklist:

- [ ] Browser Developer Tools open (F12)
- [ ] Console tab visible
- [ ] Popups allowed for localhost
- [ ] Target URL entered
- [ ] Login credentials filled (if required)
- [ ] Clicked "🖱️ Visual Selector"
- [ ] Waited 30 seconds
- [ ] Checked console for messages
- [ ] Checked server terminal for errors
- [ ] No red errors in console
- [ ] Socket connected (socket.connected = true)

## Still Not Working?

### Try This Diagnostic:

In browser console, paste:
```javascript
console.log('Socket connected:', socket.connected);
console.log('Target URL:', document.getElementById('targetUrl').value);
console.log('Login required:', document.getElementById('loginRequired').checked);

// Manually test popup
const testPopup = window.open('about:blank', 'test', 'width=800,height=600');
if (testPopup) {
  console.log('✅ Popups are working');
  testPopup.close();
} else {
  console.log('❌ Popups are blocked');
}
```

### Expected Output:
```
Socket connected: true
Target URL: https://...
Login required: true/false
✅ Popups are working
```

If you see "❌ Popups are blocked" - that's your issue!

## Alternative: Direct URL Method

If popup still doesn't work, use this workaround:

1. Click "🖱️ Visual Selector"
2. Wait for notification
3. Open browser console (F12)
4. Look for this line:
   ```
   Opening URL: /embedded-selector.html?session=abc123
   ```
5. Copy the session ID (abc123)
6. Manually open in new tab:
   ```
   http://localhost:3000/embedded-selector.html?session=abc123
   ```

## For Smart City Expo Specifically

### Common issues:

1. **Login URL wrong**
   - Make sure it's the actual login page URL
   - Try visiting it manually first

2. **Login selectors wrong**
   - Inspect the login page with DevTools
   - Verify field selectors are correct

3. **Website blocks automated access**
   - Some sites detect Puppeteer
   - May need to add delays or different user agent

### Test Login First:

Before using Visual Selector, test login:

1. Set up login credentials in UI
2. Try running a scrape with Max Scrolls = 1
3. Watch server terminal for login success/failure
4. If login works, Visual Selector should work too

## Getting Help

If still stuck, provide these details:

1. Browser console output (copy all messages)
2. Server terminal output (copy last 50 lines)
3. Browser and version
4. Operating system
5. Whether simple test (example.com) worked

## Quick Fixes Summary

| Problem | Solution |
|---------|----------|
| Popup blocked | Allow popups in browser settings |
| Timeout | Wait longer, check internet, try simpler URL |
| No console messages | Refresh page, check for JS errors |
| Login fails | Verify credentials and selectors |
| Puppeteer error | Install system dependencies |
| Socket not connected | Restart server, refresh page |

## Success Indicators

You know it's working when you see:

✅ Console: "✅ Popup opened successfully"
✅ New window opens with embedded website
✅ Left panel shows selection checklist
✅ Right panel shows target website
✅ Can hover over elements (blue highlight)
✅ Can click elements to select them

Happy debugging! 🐛🔧
