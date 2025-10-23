const puppeteer = require('puppeteer');

/**
 * Visual Element Selector Tool
 * Allows users to visually select elements with mouse clicks
 */
class VisualSelectorTool {
  constructor(options = {}) {
    this.browser = null;
    this.page = null;
    this.selectedElements = {
      container: null,
      logo: null,
      name: null,
      link: null,
      position: null,
      category: null,
      buttonToClick: null,
    };
    this.currentMode = null;
    this.onSelectorSelected = options.onSelectorSelected || (() => {});
    this.onComplete = options.onComplete || (() => {});
  }

  /**
   * Start the visual selector tool
   */
  async start(url, loginConfig = null) {
    console.log('🎯 Starting Visual Selector Tool...');

    this.browser = await puppeteer.launch({
      headless: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--window-size=1920,1080',
      ],
      defaultViewport: null,
    });

    this.page = await this.browser.newPage();

    // Handle login if required
    if (loginConfig && loginConfig.required) {
      await this.handleLogin(loginConfig);
    }

    // Navigate to target page
    console.log(`🌐 Navigating to ${url}...`);
    await this.page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 90000,
    });

    // Wait a bit for page to fully load
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Inject the selector UI
    await this.injectSelectorUI();

    console.log('✅ Visual Selector Tool ready!');
    console.log('📌 Click on elements to select them');

    // Set up message handler
    await this.setupMessageHandler();
  }

  /**
   * Handle login if required
   */
  async handleLogin(loginConfig) {
    console.log('🔐 Logging in...');

    await this.page.goto(loginConfig.loginUrl, {
      waitUntil: 'networkidle2',
      timeout: 90000,
    });

    await new Promise(resolve => setTimeout(resolve, 1000));

    if (loginConfig.usernameSelector && loginConfig.username) {
      await this.page.waitForSelector(loginConfig.usernameSelector);
      await this.page.type(loginConfig.usernameSelector, loginConfig.username);
    }

    if (loginConfig.passwordSelector && loginConfig.password) {
      await this.page.type(loginConfig.passwordSelector, loginConfig.password);
    }

    if (loginConfig.submitSelector) {
      await this.page.click(loginConfig.submitSelector);
      await this.page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
      await new Promise(resolve => setTimeout(resolve, loginConfig.waitAfterLogin || 2000));
    }

    console.log('✅ Login complete');
  }

  /**
   * Inject the visual selector UI and JavaScript
   */
  async injectSelectorUI() {
    await this.page.evaluate(() => {
      // Create overlay UI
      const overlay = document.createElement('div');
      overlay.id = 'visual-selector-overlay';
      overlay.innerHTML = `
        <div id="selector-panel">
          <div class="panel-header">
            <h3>🎯 Visual Element Selector</h3>
            <button id="close-selector" class="close-btn">✕</button>
          </div>
          <div class="panel-content">
            <div class="instructions">
              Click on elements to select them. The tool will auto-detect the best selector.
            </div>

            <div class="selection-list">
              <div class="selection-item" data-type="container">
                <span class="label">1. Container (Main Card)</span>
                <span class="status" id="status-container">Click to select</span>
                <button class="select-btn" data-type="container">Select</button>
              </div>

              <div class="selection-item" data-type="name">
                <span class="label">2. Company Name</span>
                <span class="status" id="status-name">Click to select</span>
                <button class="select-btn" data-type="name">Select</button>
              </div>

              <div class="selection-item" data-type="logo">
                <span class="label">3. Logo (Optional)</span>
                <span class="status" id="status-logo">Click to select</span>
                <button class="select-btn" data-type="logo">Select</button>
              </div>

              <div class="selection-item" data-type="link">
                <span class="label">4. Website Link (Optional)</span>
                <span class="status" id="status-link">Click to select</span>
                <button class="select-btn" data-type="link">Select</button>
              </div>

              <div class="selection-item" data-type="position">
                <span class="label">5. Booth Position (Optional)</span>
                <span class="status" id="status-position">Click to select</span>
                <button class="select-btn" data-type="position">Select</button>
              </div>

              <div class="selection-item" data-type="category">
                <span class="label">6. Category/Sector (Optional)</span>
                <span class="status" id="status-category">Click to select</span>
                <button class="select-btn" data-type="category">Select</button>
              </div>

              <div class="selection-item" data-type="buttonToClick">
                <span class="label">7. Expand Button (Optional)</span>
                <span class="status" id="status-buttonToClick">Click to select</span>
                <button class="select-btn" data-type="buttonToClick">Select</button>
              </div>
            </div>

            <div class="panel-actions">
              <button id="skip-current" class="btn-secondary">Skip Current</button>
              <button id="done-selecting" class="btn-primary">Done & Use Selectors</button>
            </div>

            <div class="current-mode" id="current-mode"></div>
          </div>
        </div>

        <div id="highlight-overlay"></div>
        <div id="selector-tooltip"></div>
      `;

      document.body.appendChild(overlay);

      // Add CSS styles
      const style = document.createElement('style');
      style.textContent = `
        #visual-selector-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 999999;
          pointer-events: none;
        }

        #selector-panel {
          position: fixed;
          top: 20px;
          right: 20px;
          width: 400px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
          pointer-events: auto;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          max-height: 90vh;
          overflow-y: auto;
        }

        .panel-header {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          padding: 1rem 1.5rem;
          border-radius: 12px 12px 0 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .panel-header h3 {
          margin: 0;
          font-size: 1.1rem;
        }

        .close-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .panel-content {
          padding: 1.5rem;
        }

        .instructions {
          background: #f0f9ff;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
          color: #1e40af;
          border-left: 4px solid #3b82f6;
        }

        .selection-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .selection-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: #f9fafb;
          border-radius: 8px;
          border: 2px solid transparent;
          transition: all 0.2s;
        }

        .selection-item.active {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .selection-item.completed {
          border-color: #10b981;
          background: #f0fdf4;
        }

        .selection-item .label {
          flex: 1;
          font-weight: 500;
          font-size: 0.9rem;
        }

        .selection-item .status {
          font-size: 0.85rem;
          color: #6b7280;
        }

        .selection-item.completed .status {
          color: #10b981;
          font-weight: 500;
        }

        .select-btn {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 500;
          transition: all 0.2s;
        }

        .select-btn:hover {
          background: #2563eb;
        }

        .select-btn:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .panel-actions {
          display: flex;
          gap: 0.75rem;
        }

        .btn-primary, .btn-secondary {
          flex: 1;
          padding: 0.75rem;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary {
          background: #10b981;
          color: white;
        }

        .btn-primary:hover {
          background: #059669;
        }

        .btn-secondary {
          background: #6b7280;
          color: white;
        }

        .btn-secondary:hover {
          background: #4b5563;
        }

        .current-mode {
          margin-top: 1rem;
          padding: 1rem;
          background: #fef3c7;
          border-radius: 8px;
          font-weight: 500;
          color: #92400e;
          text-align: center;
          display: none;
        }

        .current-mode.active {
          display: block;
        }

        #highlight-overlay {
          position: absolute;
          pointer-events: none;
          border: 3px solid #3b82f6;
          background: rgba(59, 130, 246, 0.1);
          z-index: 999998;
          display: none;
          transition: all 0.1s;
        }

        #selector-tooltip {
          position: absolute;
          background: #1f2937;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.85rem;
          pointer-events: none;
          z-index: 1000000;
          display: none;
          white-space: nowrap;
          max-width: 300px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        body.selector-mode-active {
          cursor: crosshair !important;
        }

        body.selector-mode-active * {
          cursor: crosshair !important;
        }

        .selector-highlight {
          outline: 3px solid #3b82f6 !important;
          outline-offset: 2px;
          background: rgba(59, 130, 246, 0.05) !important;
        }
      `;
      document.head.appendChild(style);

      // Initialize selector state
      window.visualSelectorState = {
        mode: null,
        selections: {},
        hoveredElement: null,
      };

      // Generate optimal CSS selector for an element
      window.generateSelector = function(element) {
        // Try ID first
        if (element.id) {
          return `#${element.id}`;
        }

        // Try unique class
        if (element.className && typeof element.className === 'string') {
          const classes = element.className.split(' ').filter(c => c.trim());
          for (const cls of classes) {
            const selector = `.${cls}`;
            if (document.querySelectorAll(selector).length === 1) {
              return selector;
            }
          }

          // Try first class with tag
          if (classes.length > 0) {
            const selector = `${element.tagName.toLowerCase()}.${classes[0]}`;
            const matches = document.querySelectorAll(selector);
            if (matches.length < 20) {
              return selector;
            }
            return `.${classes[0]}`;
          }
        }

        // Try tag + nth-child
        const parent = element.parentElement;
        if (parent) {
          const siblings = Array.from(parent.children);
          const index = siblings.indexOf(element) + 1;
          return `${element.tagName.toLowerCase()}:nth-child(${index})`;
        }

        // Fallback to tag name
        return element.tagName.toLowerCase();
      };

      // Setup button handlers
      document.querySelectorAll('.select-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const type = btn.getAttribute('data-type');
          window.visualSelectorState.mode = type;

          // Update UI
          document.querySelectorAll('.selection-item').forEach(item => {
            item.classList.remove('active');
          });
          btn.closest('.selection-item').classList.add('active');

          // Show current mode
          const modeDisplay = document.getElementById('current-mode');
          modeDisplay.textContent = `👆 Click on the ${type} element`;
          modeDisplay.classList.add('active');

          // Enable selection mode
          document.body.classList.add('selector-mode-active');
        });
      });

      // Skip current selection
      document.getElementById('skip-current').addEventListener('click', () => {
        if (window.visualSelectorState.mode) {
          window.visualSelectorState.mode = null;
          document.body.classList.remove('selector-mode-active');
          document.getElementById('current-mode').classList.remove('active');
          document.querySelectorAll('.selection-item').forEach(item => {
            item.classList.remove('active');
          });
        }
      });

      // Done selecting
      document.getElementById('done-selecting').addEventListener('click', () => {
        window.postMessage({
          type: 'SELECTORS_COMPLETE',
          selectors: window.visualSelectorState.selections,
        }, '*');
      });

      // Close button
      document.getElementById('close-selector').addEventListener('click', () => {
        window.postMessage({ type: 'SELECTOR_TOOL_CLOSE' }, '*');
      });

      // Handle element hover and click
      document.addEventListener('mousemove', (e) => {
        if (!window.visualSelectorState.mode) return;

        const panel = document.getElementById('selector-panel');
        if (panel.contains(e.target)) return;

        const element = e.target;

        // Highlight element
        if (window.visualSelectorState.hoveredElement) {
          window.visualSelectorState.hoveredElement.classList.remove('selector-highlight');
        }
        element.classList.add('selector-highlight');
        window.visualSelectorState.hoveredElement = element;

        // Show tooltip
        const tooltip = document.getElementById('selector-tooltip');
        const selector = window.generateSelector(element);
        tooltip.textContent = selector;
        tooltip.style.display = 'block';
        tooltip.style.left = e.pageX + 15 + 'px';
        tooltip.style.top = e.pageY + 15 + 'px';
      }, true);

      document.addEventListener('click', (e) => {
        if (!window.visualSelectorState.mode) return;

        const panel = document.getElementById('selector-panel');
        if (panel.contains(e.target)) return;

        e.preventDefault();
        e.stopPropagation();

        const element = e.target;
        const selector = window.generateSelector(element);
        const mode = window.visualSelectorState.mode;

        // Save selection
        window.visualSelectorState.selections[mode] = selector;

        // Update UI
        document.getElementById(`status-${mode}`).textContent = selector;
        document.querySelector(`[data-type="${mode}"]`).closest('.selection-item').classList.add('completed');
        document.querySelector(`[data-type="${mode}"]`).closest('.selection-item').classList.remove('active');

        // Clear mode
        window.visualSelectorState.mode = null;
        document.body.classList.remove('selector-mode-active');
        document.getElementById('current-mode').classList.remove('active');

        // Remove highlight
        element.classList.remove('selector-highlight');
        document.getElementById('selector-tooltip').style.display = 'none';

        // Send update
        window.postMessage({
          type: 'SELECTOR_SELECTED',
          elementType: mode,
          selector: selector,
        }, '*');
      }, true);
    });
  }

  /**
   * Setup message handler to receive selections from the page
   */
  async setupMessageHandler() {
    await this.page.exposeFunction('sendSelectorToNode', (data) => {
      if (data.type === 'SELECTOR_SELECTED') {
        this.selectedElements[data.elementType] = data.selector;
        console.log(`✅ ${data.elementType}: ${data.selector}`);
        this.onSelectorSelected(data.elementType, data.selector);
      } else if (data.type === 'SELECTORS_COMPLETE') {
        console.log('✅ All selections complete!');
        console.log('Selections:', data.selectors);
        this.onComplete(data.selectors);
        this.close();
      } else if (data.type === 'SELECTOR_TOOL_CLOSE') {
        console.log('Tool closed by user');
        this.close();
      }
    });

    await this.page.evaluate(() => {
      window.addEventListener('message', (event) => {
        if (event.data.type && event.data.type.startsWith('SELECTOR')) {
          window.sendSelectorToNode(event.data);
        }
      });
    });
  }

  /**
   * Close the selector tool
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      console.log('🔒 Visual Selector Tool closed');
    }
  }

  /**
   * Get selected elements
   */
  getSelections() {
    return this.selectedElements;
  }
}

module.exports = VisualSelectorTool;
