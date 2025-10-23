// Socket.IO connection
const socket = io();

// DOM Elements
const form = document.getElementById('scraperForm');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const progressSection = document.getElementById('progressSection');
const progressFill = document.getElementById('progressFill');
const progressPercent = document.getElementById('progressPercent');
const statusMessage = document.getElementById('statusMessage');
const participantCount = document.getElementById('participantCount');
const loginRequiredCheckbox = document.getElementById('loginRequired');
const loginFields = document.getElementById('loginFields');
const savedConfigsSelect = document.getElementById('savedConfigs');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadSavedConfigs();
  refreshOutputs();

  // Toggle login fields
  loginRequiredCheckbox.addEventListener('change', (e) => {
    loginFields.style.display = e.target.checked ? 'block' : 'none';
  });
});

// Form submission
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  await startScraper();
});

// Socket events
socket.on('status', (status) => {
  updateProgress(status);
});

socket.on('complete', (data) => {
  showNotification('Scraping completed successfully!', 'success');
  refreshOutputs();
});

socket.on('error', (error) => {
  showNotification(`Error: ${error.message}`, 'error');
});

// Visual selector events
socket.on('selector-update', (data) => {
  // Update the corresponding field when a selector is selected
  const fieldId = `selector${data.elementType.charAt(0).toUpperCase() + data.elementType.slice(1)}`;
  const field = document.getElementById(fieldId);
  if (field) {
    field.value = data.selector;
    field.style.background = '#f0fdf4';
    setTimeout(() => {
      field.style.background = '';
    }, 1000);
  }
  showNotification(`Selected ${data.elementType}: ${data.selector}`, 'success');
});

socket.on('selectors-complete', (data) => {
  // Update all selector fields
  const selectors = data.selectors;
  Object.keys(selectors).forEach(key => {
    if (selectors[key]) {
      const fieldId = `selector${key.charAt(0).toUpperCase() + key.slice(1)}`;
      const field = document.getElementById(fieldId);
      if (field) {
        field.value = selectors[key];
      }
    }
  });

  // Also set waitFor to container if not set
  if (selectors.container && !document.getElementById('selectorWaitFor').value) {
    document.getElementById('selectorWaitFor').value = selectors.container;
  }

  showNotification('Visual selector completed! Selectors have been filled in.', 'success');
});

socket.on('selector-error', (data) => {
  showNotification(`Visual selector error: ${data.message}`, 'error');
});

// Store selector window reference
let selectorWindow = null;

// Start visual selector
async function startVisualSelector() {
  const targetUrl = document.getElementById('targetUrl').value;

  if (!targetUrl) {
    showNotification('Please enter a Target URL first', 'warning');
    return;
  }

  // Prepare login config if needed
  let loginConfig = null;
  if (loginRequiredCheckbox.checked) {
    const loginUrl = document.getElementById('loginUrl').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!loginUrl || !username || !password) {
      showNotification('Please fill in login credentials first', 'warning');
      return;
    }

    loginConfig = {
      required: true,
      loginUrl: loginUrl,
      username: username,
      password: password,
      usernameSelector: document.getElementById('usernameSelector').value,
      passwordSelector: document.getElementById('passwordSelector').value,
      submitSelector: document.getElementById('submitSelector').value,
      waitAfterLogin: parseInt(document.getElementById('waitAfterLogin').value),
    };
  }

  try {
    console.log('🎯 Starting visual selector...');
    console.log('Target URL:', targetUrl);
    console.log('Login required:', !!loginConfig);

    showNotification('Loading page content... Please wait 10-30 seconds.', 'info');

    const response = await fetch('/api/selector/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: targetUrl, loginConfig }),
    });

    const result = await response.json();

    console.log('✅ Server response:', result);

    if (!response.ok) {
      throw new Error(result.error);
    }

    const sessionId = result.sessionId;
    console.log('Session ID:', sessionId);

    // Set a timeout in case the event never fires
    const timeout = setTimeout(() => {
      console.error('❌ Timeout waiting for selector-ready event');
      showNotification('Timeout loading page. Please check server logs and try again.', 'error');
    }, 60000); // 60 second timeout

    // Wait for selector-ready event
    socket.once('selector-ready', (data) => {
      console.log('📡 Received selector-ready event:', data);

      if (data.sessionId === sessionId) {
        clearTimeout(timeout);

        console.log('✅ Session ID matches, opening popup...');

        // Open selector window
        const selectorUrl = `/embedded-selector.html?session=${data.sessionId}`;
        console.log('Opening URL:', selectorUrl);

        // Try to open popup
        selectorWindow = window.open(selectorUrl, 'VisualSelector', 'width=1400,height=900,resizable=yes,scrollbars=yes');

        if (!selectorWindow || selectorWindow.closed || typeof selectorWindow.closed === 'undefined') {
          console.error('❌ Popup blocked!');
          clearTimeout(timeout);

          // Fallback: provide a link
          const message = `Popup was blocked. <a href="${selectorUrl}" target="_blank" style="color: white; text-decoration: underline;">Click here to open Visual Selector in new tab</a>`;
          showHTMLNotification(message, 'warning');
        } else {
          console.log('✅ Popup opened successfully');
          showNotification('Visual selector opened! Click on elements to select them.', 'success');
        }
      } else {
        console.warn('⚠️ Session ID mismatch:', data.sessionId, 'vs', sessionId);
      }
    });

    socket.once('selector-error', (data) => {
      console.error('❌ Selector error event:', data);

      if (data.sessionId === sessionId) {
        clearTimeout(timeout);
        showNotification(`Error loading page: ${data.message}`, 'error');
      }
    });

    console.log('👂 Listening for selector-ready event...');

  } catch (error) {
    console.error('❌ Visual selector error:', error);
    showNotification(`Failed to start visual selector: ${error.message}`, 'error');
  }
}

// Listen for selector completion from popup window
window.addEventListener('message', (event) => {
  if (event.data.type === 'SELECTORS_COMPLETE') {
    const selectors = event.data.selectors;

    // Update form fields
    Object.keys(selectors).forEach(key => {
      if (selectors[key]) {
        const fieldId = `selector${key.charAt(0).toUpperCase() + key.slice(1)}`;
        const field = document.getElementById(fieldId);
        if (field) {
          field.value = selectors[key];
          field.style.background = '#f0fdf4';
          setTimeout(() => {
            field.style.background = '';
          }, 2000);
        }
      }
    });

    // Set waitFor to container if not set
    if (selectors.container && !document.getElementById('selectorWaitFor').value) {
      document.getElementById('selectorWaitFor').value = selectors.container;
    }

    showNotification('✅ Selectors applied! Ready to scrape.', 'success');

    // Close selector window if still open
    if (selectorWindow && !selectorWindow.closed) {
      selectorWindow.close();
    }
  }
});

// Start scraper
async function startScraper() {
  const config = getFormConfig();

  try {
    startBtn.disabled = true;
    stopBtn.disabled = false;
    progressSection.style.display = 'block';

    const response = await fetch('/api/scrape/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error);
    }

    showNotification('Scraper started!', 'success');

  } catch (error) {
    showNotification(error.message, 'error');
    startBtn.disabled = false;
    stopBtn.disabled = true;
    progressSection.style.display = 'none';
  }
}

// Stop scraper
async function stopScraper() {
  try {
    const response = await fetch('/api/scrape/stop', {
      method: 'POST',
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error);
    }

    showNotification('Scraper stopped', 'info');
    startBtn.disabled = false;
    stopBtn.disabled = true;

  } catch (error) {
    showNotification(error.message, 'error');
  }
}

// Update progress
function updateProgress(status) {
  if (!status.running && status.progress === 100) {
    startBtn.disabled = false;
    stopBtn.disabled = true;
  }

  progressFill.style.width = `${status.progress}%`;
  progressPercent.textContent = `${status.progress}%`;
  statusMessage.textContent = status.message;
  participantCount.textContent = status.participants;

  // Change color based on status
  if (status.progress === 100) {
    progressFill.style.background = 'var(--success-color)';
  } else if (status.message.toLowerCase().includes('error')) {
    progressFill.style.background = 'var(--danger-color)';
  }
}

// Get form configuration
function getFormConfig() {
  const config = {
    targetUrl: document.getElementById('targetUrl').value,
    headless: document.getElementById('headless').value === 'true',
    timeout: parseInt(document.getElementById('timeout').value),

    viewport: {
      width: 1920,
      height: 1080,
    },

    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',

    enableAutoScroll: document.getElementById('enableAutoScroll').checked,

    scrolling: {
      distance: parseInt(document.getElementById('scrollDistance').value),
      delay: parseInt(document.getElementById('scrollDelay').value),
      maxScrolls: parseInt(document.getElementById('maxScrolls').value),
      waitAfterScroll: parseInt(document.getElementById('waitAfterScroll').value),
    },

    selectors: {
      waitFor: document.getElementById('selectorWaitFor').value || null,
      container: document.getElementById('selectorContainer').value,
      logo: document.getElementById('selectorLogo').value || null,
      name: document.getElementById('selectorName').value,
      link: document.getElementById('selectorLink').value || null,
      position: document.getElementById('selectorPosition').value || null,
      category: document.getElementById('selectorCategory').value || null,
      buttonToClick: document.getElementById('selectorButtonToClick').value || null,
    },

    exportJSON: document.getElementById('exportJSON').checked,
    exportExcel: document.getElementById('exportExcel').checked,
    outputDir: './output',

    waitUntil: 'networkidle2',
    clickDelay: 500,
    requestDelay: 1000,
  };

  // Add login config if required
  if (loginRequiredCheckbox.checked) {
    config.login = {
      required: true,
      loginUrl: document.getElementById('loginUrl').value,
      username: document.getElementById('username').value,
      password: document.getElementById('password').value,
      usernameSelector: document.getElementById('usernameSelector').value,
      passwordSelector: document.getElementById('passwordSelector').value,
      submitSelector: document.getElementById('submitSelector').value,
      waitAfterLogin: parseInt(document.getElementById('waitAfterLogin').value),
    };
  } else {
    config.login = { required: false };
  }

  return config;
}

// Set form from config
function setFormConfig(config) {
  document.getElementById('targetUrl').value = config.targetUrl || '';
  document.getElementById('headless').value = config.headless ? 'true' : 'false';
  document.getElementById('timeout').value = config.timeout || 90000;

  // Login
  if (config.login && config.login.required) {
    loginRequiredCheckbox.checked = true;
    loginFields.style.display = 'block';
    document.getElementById('loginUrl').value = config.login.loginUrl || '';
    document.getElementById('username').value = config.login.username || '';
    document.getElementById('password').value = config.login.password || '';
    document.getElementById('usernameSelector').value = config.login.usernameSelector || '#username';
    document.getElementById('passwordSelector').value = config.login.passwordSelector || '#password';
    document.getElementById('submitSelector').value = config.login.submitSelector || 'button[type="submit"]';
    document.getElementById('waitAfterLogin').value = config.login.waitAfterLogin || 3000;
  } else {
    loginRequiredCheckbox.checked = false;
    loginFields.style.display = 'none';
  }

  // Scrolling
  document.getElementById('enableAutoScroll').checked = config.enableAutoScroll !== false;
  if (config.scrolling) {
    document.getElementById('scrollDistance').value = config.scrolling.distance || 400;
    document.getElementById('scrollDelay').value = config.scrolling.delay || 300;
    document.getElementById('maxScrolls').value = config.scrolling.maxScrolls || 300;
    document.getElementById('waitAfterScroll').value = config.scrolling.waitAfterScroll || 3000;
  }

  // Selectors
  if (config.selectors) {
    document.getElementById('selectorWaitFor').value = config.selectors.waitFor || '';
    document.getElementById('selectorContainer').value = config.selectors.container || '';
    document.getElementById('selectorLogo').value = config.selectors.logo || '';
    document.getElementById('selectorName').value = config.selectors.name || '';
    document.getElementById('selectorLink').value = config.selectors.link || '';
    document.getElementById('selectorPosition').value = config.selectors.position || '';
    document.getElementById('selectorCategory').value = config.selectors.category || '';
    document.getElementById('selectorButtonToClick').value = config.selectors.buttonToClick || '';
  }

  // Export
  document.getElementById('exportJSON').checked = config.exportJSON !== false;
  document.getElementById('exportExcel').checked = config.exportExcel !== false;
}

// Load saved configurations
async function loadSavedConfigs() {
  try {
    const response = await fetch('/api/configs');
    const data = await response.json();

    savedConfigsSelect.innerHTML = '<option value="">-- Load Saved Config --</option>';

    data.configs.forEach(name => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      savedConfigsSelect.appendChild(option);
    });

  } catch (error) {
    console.error('Failed to load configs:', error);
  }
}

// Load selected config
async function loadConfig() {
  const configName = savedConfigsSelect.value;

  if (!configName) {
    showNotification('Please select a configuration', 'warning');
    return;
  }

  try {
    const response = await fetch(`/api/config/${configName}`);
    const config = await response.json();

    setFormConfig(config);
    showNotification(`Configuration "${configName}" loaded`, 'success');

  } catch (error) {
    showNotification('Failed to load configuration', 'error');
  }
}

// Save config
function saveConfig() {
  const modal = document.getElementById('saveModal');
  modal.classList.add('active');
  document.getElementById('configName').value = '';
  document.getElementById('configName').focus();
}

// Confirm save
async function confirmSave() {
  const configName = document.getElementById('configName').value.trim();

  if (!configName) {
    showNotification('Please enter a configuration name', 'warning');
    return;
  }

  const config = getFormConfig();

  try {
    const response = await fetch('/api/config/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: configName, config }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error);
    }

    showNotification(`Configuration "${configName}" saved`, 'success');
    closeModal();
    loadSavedConfigs();

  } catch (error) {
    showNotification('Failed to save configuration', 'error');
  }
}

// Close modal
function closeModal() {
  document.getElementById('saveModal').classList.remove('active');
}

// Show selector help
function showSelectorHelp() {
  document.getElementById('helpModal').classList.add('active');
}

// Close help modal
function closeHelpModal() {
  document.getElementById('helpModal').classList.remove('active');
}

// Close modals on outside click
window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    e.target.classList.remove('active');
  }
});

// Refresh output files
async function refreshOutputs() {
  try {
    const response = await fetch('/api/outputs');
    const data = await response.json();

    const outputFiles = document.getElementById('outputFiles');

    if (data.files.length === 0) {
      outputFiles.innerHTML = '<p class="empty-state">No output files yet. Start a scraping job to generate files.</p>';
      return;
    }

    outputFiles.innerHTML = '';

    data.files.forEach(file => {
      const fileItem = document.createElement('div');
      fileItem.className = 'file-item';

      const fileInfo = document.createElement('div');
      fileInfo.className = 'file-info';

      const fileName = document.createElement('div');
      fileName.className = 'file-name';
      fileName.textContent = file.name;

      const fileMeta = document.createElement('div');
      fileMeta.className = 'file-meta';
      fileMeta.textContent = `${formatFileSize(file.size)} • ${formatDate(file.modified)}`;

      fileInfo.appendChild(fileName);
      fileInfo.appendChild(fileMeta);

      const downloadBtn = document.createElement('button');
      downloadBtn.className = 'btn btn-primary btn-sm';
      downloadBtn.textContent = '⬇️ Download';
      downloadBtn.onclick = () => downloadFile(file.name);

      fileItem.appendChild(fileInfo);
      fileItem.appendChild(downloadBtn);

      outputFiles.appendChild(fileItem);
    });

  } catch (error) {
    console.error('Failed to refresh outputs:', error);
  }
}

// Download file
function downloadFile(filename) {
  window.location.href = `/api/output/${filename}`;
}

// Format file size
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString();
}

// Show notification
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    background: ${type === 'success' ? 'var(--success-color)' :
                  type === 'error' ? 'var(--danger-color)' :
                  type === 'warning' ? 'var(--warning-color)' :
                  'var(--primary-color)'};
    color: white;
    border-radius: 8px;
    box-shadow: var(--shadow-lg);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;

  document.body.appendChild(notification);

  // Remove after 5 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

// Show HTML notification (allows links, etc.)
function showHTMLNotification(htmlMessage, type = 'info') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    background: ${type === 'success' ? 'var(--success-color)' :
                  type === 'error' ? 'var(--danger-color)' :
                  type === 'warning' ? 'var(--warning-color)' :
                  'var(--primary-color)'};
    color: white;
    border-radius: 8px;
    box-shadow: var(--shadow-lg);
    z-index: 10000;
    animation: slideIn 0.3s ease;
    max-width: 400px;
  `;
  notification.innerHTML = htmlMessage;

  document.body.appendChild(notification);

  // Remove after 10 seconds (longer for HTML messages)
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 10000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
