// Visual Selector Client-Side Logic

const socket = io();

let currentMode = null;
let selections = {};
let highlightElement = null;
let tooltipElement = null;
let iframeDoc = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadTargetPage();
  setupEventListeners();
});

// Load target page into iframe
async function loadTargetPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session');

  if (!sessionId) {
    alert('No session ID provided');
    return;
  }

  try {
    const response = await fetch(`/api/selector/content/${sessionId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error);
    }

    const iframe = document.getElementById('target-iframe');
    const iframeWindow = iframe.contentWindow;

    // Write HTML to iframe
    iframe.srcdoc = data.html;

    // Wait for iframe to load
    iframe.onload = () => {
      iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      injectSelectorScript();
      document.getElementById('loading').style.display = 'none';
    };

  } catch (error) {
    console.error('Failed to load page:', error);
    alert('Failed to load target page: ' + error.message);
  }
}

// Inject selector script into iframe
function injectSelectorScript() {
  const script = iframeDoc.createElement('script');
  script.textContent = `
    // Prevent default link clicks
    document.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
    }, true);

    // Prevent form submissions
    document.addEventListener('submit', (e) => {
      e.preventDefault();
    }, true);

    // Generate optimal CSS selector
    function generateSelector(element) {
      // Try ID first
      if (element.id) {
        return '#' + element.id;
      }

      // Try unique class
      if (element.className && typeof element.className === 'string') {
        const classes = element.className.split(' ').filter(c => c.trim() && !c.includes(':'));

        for (const cls of classes) {
          const selector = '.' + cls;
          const matches = document.querySelectorAll(selector);
          if (matches.length === 1) {
            return selector;
          }
        }

        // Try first meaningful class
        for (const cls of classes) {
          if (cls.length > 2 && !cls.match(/^(btn|button|link|active|hover)$/i)) {
            const selector = '.' + cls;
            const matches = document.querySelectorAll(selector);
            // If reasonable number of matches (likely multiple cards/items)
            if (matches.length > 1 && matches.length < 500) {
              return selector;
            }
          }
        }

        // Try tag + class
        if (classes.length > 0) {
          const selector = element.tagName.toLowerCase() + '.' + classes[0];
          return selector;
        }
      }

      // Try data attributes
      const dataAttrs = Array.from(element.attributes).filter(attr => attr.name.startsWith('data-'));
      if (dataAttrs.length > 0) {
        return '[' + dataAttrs[0].name + ']';
      }

      // Fallback to tag
      return element.tagName.toLowerCase();
    }

    // Send selector to parent
    function sendSelectorToParent(selector) {
      window.parent.postMessage({
        type: 'ELEMENT_SELECTED',
        selector: selector
      }, '*');
    }

    // Send hover info to parent
    function sendHoverToParent(element, event) {
      const rect = element.getBoundingClientRect();
      const selector = generateSelector(element);

      window.parent.postMessage({
        type: 'ELEMENT_HOVER',
        selector: selector,
        rect: {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        },
        mouseX: event.clientX,
        mouseY: event.clientY
      }, '*');
    }

    // Send clear hover to parent
    function sendClearHover() {
      window.parent.postMessage({
        type: 'CLEAR_HOVER'
      }, '*');
    }

    // Expose functions to parent
    window.startElementSelection = function() {
      document.body.style.cursor = 'crosshair';

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('click', handleClick, true);
    };

    window.stopElementSelection = function() {
      document.body.style.cursor = 'default';

      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick, true);

      sendClearHover();
    };

    function handleMouseMove(e) {
      const element = e.target;
      sendHoverToParent(element, e);
    }

    function handleClick(e) {
      e.preventDefault();
      e.stopPropagation();

      const selector = generateSelector(e.target);
      sendSelectorToParent(selector);

      return false;
    }
  `;

  iframeDoc.body.appendChild(script);
}

// Setup event listeners
function setupEventListeners() {
  // Listen for messages from iframe
  window.addEventListener('message', (event) => {
    if (event.data.type === 'ELEMENT_HOVER') {
      showHighlight(event.data);
    } else if (event.data.type === 'CLEAR_HOVER') {
      clearHighlight();
    } else if (event.data.type === 'ELEMENT_SELECTED') {
      handleElementSelected(event.data.selector);
    }
  });
}

// Start selection for a specific element type
function startSelection(type) {
  // Clear previous mode
  if (currentMode) {
    stopCurrentSelection();
  }

  currentMode = type;

  // Update UI
  document.querySelectorAll('.selection-item').forEach(item => {
    item.classList.remove('active');
  });
  document.querySelector(`[data-type="${type}"]`).classList.add('active');

  // Update buttons
  document.querySelectorAll('.select-btn').forEach(btn => {
    btn.classList.remove('active');
    btn.textContent = 'Select';
  });
  const activeBtn = document.querySelector(`[data-type="${type}"] .select-btn`);
  activeBtn.classList.add('active');
  activeBtn.textContent = 'Selecting...';

  // Show banner
  const banner = document.getElementById('modeBanner');
  banner.textContent = `👆 Click on the ${type} element`;
  banner.classList.add('active');

  // Enable selection in iframe
  const iframe = document.getElementById('target-iframe');
  if (iframe.contentWindow && iframe.contentWindow.startElementSelection) {
    iframe.contentWindow.startElementSelection();
  }
}

// Stop current selection
function stopCurrentSelection() {
  if (!currentMode) return;

  const iframe = document.getElementById('target-iframe');
  if (iframe.contentWindow && iframe.contentWindow.stopElementSelection) {
    iframe.contentWindow.stopElementSelection();
  }

  // Clear UI
  document.querySelectorAll('.selection-item').forEach(item => {
    item.classList.remove('active');
  });

  document.querySelectorAll('.select-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  document.getElementById('modeBanner').classList.remove('active');

  clearHighlight();
  currentMode = null;
}

// Handle element selected
function handleElementSelected(selector) {
  if (!currentMode) return;

  // Save selection
  selections[currentMode] = selector;

  // Update UI
  document.getElementById(`selector-${currentMode}`).textContent = selector;
  document.querySelector(`[data-type="${currentMode}"]`).classList.add('completed');
  document.querySelector(`[data-type="${currentMode}"]`).classList.remove('active');

  const btn = document.querySelector(`[data-type="${currentMode}"] .select-btn`);
  btn.textContent = 'Reselect';
  btn.classList.remove('active');
  btn.classList.add('completed');

  // Stop selection
  stopCurrentSelection();

  console.log(`Selected ${currentMode}:`, selector);
}

// Show highlight on hover
function showHighlight(data) {
  const overlay = document.getElementById('overlay');

  // Remove old highlight
  const oldHighlight = document.querySelector('.element-highlight');
  if (oldHighlight) oldHighlight.remove();

  const oldTooltip = document.querySelector('.element-tooltip');
  if (oldTooltip) oldTooltip.remove();

  // Create highlight box
  const highlight = document.createElement('div');
  highlight.className = 'element-highlight';
  highlight.style.top = data.rect.top + 'px';
  highlight.style.left = data.rect.left + 'px';
  highlight.style.width = data.rect.width + 'px';
  highlight.style.height = data.rect.height + 'px';

  overlay.appendChild(highlight);

  // Create tooltip
  const tooltip = document.createElement('div');
  tooltip.className = 'element-tooltip';
  tooltip.textContent = data.selector;
  tooltip.style.left = (data.mouseX + 15) + 'px';
  tooltip.style.top = (data.mouseY + 15) + 'px';

  overlay.appendChild(tooltip);
}

// Clear highlight
function clearHighlight() {
  const oldHighlight = document.querySelector('.element-highlight');
  if (oldHighlight) oldHighlight.remove();

  const oldTooltip = document.querySelector('.element-tooltip');
  if (oldTooltip) oldTooltip.remove();
}

// Skip current selection
function skipCurrent() {
  if (currentMode) {
    stopCurrentSelection();
  }
}

// Finish and return to main UI
function finishSelection() {
  // Send selections back to main window
  if (window.opener) {
    window.opener.postMessage({
      type: 'SELECTORS_COMPLETE',
      selectors: selections
    }, '*');
    window.close();
  } else {
    // Fallback: send to socket
    socket.emit('selectors-complete', { selectors: selections });
    alert('Selectors saved! You can close this window.');
  }
}

// Listen for selectors complete from socket
socket.on('close-selector', () => {
  window.close();
});
