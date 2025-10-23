const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const fs = require('fs').promises;
const bodyParser = require('body-parser');
const cors = require('cors');
const FairScraper = require('./scraper');
const VisualSelectorTool = require('./selector-tool');
const EmbeddedSelector = require('./embedded-selector');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Store active scraper instances
let activeScraper = null;
let scraperStatus = {
  running: false,
  progress: 0,
  message: 'Ready',
  participants: 0,
};

// Store selector sessions
const selectorSessions = new Map();

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API: Get saved configurations
app.get('/api/configs', async (req, res) => {
  try {
    const configsDir = path.join(__dirname, 'saved-configs');
    await fs.mkdir(configsDir, { recursive: true });

    const files = await fs.readdir(configsDir);
    const configs = files
      .filter(f => f.endsWith('.json'))
      .map(f => f.replace('.json', ''));

    res.json({ configs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Load a configuration
app.get('/api/config/:name', async (req, res) => {
  try {
    const configPath = path.join(__dirname, 'saved-configs', `${req.params.name}.json`);
    const config = await fs.readFile(configPath, 'utf-8');
    res.json(JSON.parse(config));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Save a configuration
app.post('/api/config/save', async (req, res) => {
  try {
    const { name, config } = req.body;
    const configsDir = path.join(__dirname, 'saved-configs');
    await fs.mkdir(configsDir, { recursive: true });

    const configPath = path.join(configsDir, `${name}.json`);
    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');

    res.json({ success: true, message: 'Configuration saved' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Delete a configuration
app.delete('/api/config/:name', async (req, res) => {
  try {
    const configPath = path.join(__dirname, 'saved-configs', `${req.params.name}.json`);
    await fs.unlink(configPath);
    res.json({ success: true, message: 'Configuration deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Start embedded visual selector
app.post('/api/selector/start', async (req, res) => {
  try {
    const { url, loginConfig } = req.body;

    // Generate session ID
    const sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);

    res.json({ success: true, message: 'Loading page...', sessionId });

    // Load page in background
    const embeddedSelector = new EmbeddedSelector();

    embeddedSelector.getAuthenticatedPage(url, loginConfig)
      .then((pageData) => {
        // Store in session
        selectorSessions.set(sessionId, {
          html: pageData.html,
          url: pageData.url,
          timestamp: Date.now(),
        });

        // Notify client that page is ready
        io.emit('selector-ready', { sessionId });

        console.log(`✅ Selector session ${sessionId} ready`);
      })
      .catch((error) => {
        console.error('Embedded selector error:', error);
        io.emit('selector-error', { message: error.message, sessionId });
      });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Get selector page content
app.get('/api/selector/content/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = selectorSessions.get(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({
      html: session.html,
      url: session.url,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Start scraping
app.post('/api/scrape/start', async (req, res) => {
  if (scraperStatus.running) {
    return res.status(400).json({ error: 'Scraper is already running' });
  }

  try {
    const config = req.body;

    scraperStatus = {
      running: true,
      progress: 0,
      message: 'Starting scraper...',
      participants: 0,
    };

    io.emit('status', scraperStatus);

    res.json({ success: true, message: 'Scraper started' });

    // Run scraper in background
    runScraper(config);

  } catch (error) {
    scraperStatus.running = false;
    res.status(500).json({ error: error.message });
  }
});

// API: Stop scraping
app.post('/api/scrape/stop', async (req, res) => {
  if (activeScraper) {
    try {
      await activeScraper.close();
      activeScraper = null;
      scraperStatus.running = false;
      scraperStatus.message = 'Stopped by user';
      io.emit('status', scraperStatus);
      res.json({ success: true, message: 'Scraper stopped' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(400).json({ error: 'No scraper is running' });
  }
});

// API: Get scraper status
app.get('/api/scrape/status', (req, res) => {
  res.json(scraperStatus);
});

// API: List output files
app.get('/api/outputs', async (req, res) => {
  try {
    const outputDir = path.join(__dirname, 'output');
    await fs.mkdir(outputDir, { recursive: true });

    const files = await fs.readdir(outputDir);
    const fileStats = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(outputDir, file);
        const stats = await fs.stat(filePath);
        return {
          name: file,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
        };
      })
    );

    res.json({ files: fileStats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API: Download output file
app.get('/api/output/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'output', req.params.filename);
  res.download(filePath);
});

// Run scraper with progress updates
async function runScraper(config) {
  try {
    activeScraper = new FairScraper(config);

    // Patch console.log to capture progress
    const originalLog = console.log;
    console.log = (...args) => {
      const message = args.join(' ');
      originalLog(...args);

      scraperStatus.message = message;
      io.emit('status', scraperStatus);

      // Update progress based on message
      if (message.includes('Launching browser')) {
        scraperStatus.progress = 5;
      } else if (message.includes('Login')) {
        scraperStatus.progress = 15;
      } else if (message.includes('Navigating')) {
        scraperStatus.progress = 25;
      } else if (message.includes('Auto-scrolling')) {
        scraperStatus.progress = 35;
      } else if (message.includes('Scrolling complete')) {
        scraperStatus.progress = 60;
      } else if (message.includes('Extracting')) {
        scraperStatus.progress = 70;
      } else if (message.includes('Extracted')) {
        scraperStatus.progress = 80;
        const match = message.match(/(\d+) participants/);
        if (match) {
          scraperStatus.participants = parseInt(match[1]);
        }
      } else if (message.includes('Exporting')) {
        scraperStatus.progress = 85;
      } else if (message.includes('Excel exported')) {
        scraperStatus.progress = 95;
      }

      io.emit('status', scraperStatus);
    };

    await activeScraper.scrape();

    // Restore console.log
    console.log = originalLog;

    scraperStatus = {
      running: false,
      progress: 100,
      message: 'Scraping completed successfully!',
      participants: activeScraper.participants.length,
    };

    io.emit('status', scraperStatus);
    io.emit('complete', {
      participants: activeScraper.participants.length,
      categories: Object.keys(activeScraper.groupByCategory()).length,
    });

    activeScraper = null;

  } catch (error) {
    console.error('Scraper error:', error);

    scraperStatus = {
      running: false,
      progress: 0,
      message: `Error: ${error.message}`,
      participants: 0,
    };

    io.emit('status', scraperStatus);
    io.emit('error', { message: error.message });

    activeScraper = null;
  }
}

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('Client connected');

  // Send current status to new client
  socket.emit('status', scraperStatus);

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Start server
server.listen(PORT, () => {
  console.log('');
  console.log('='.repeat(60));
  console.log('🚀 Fair Scraper Web UI');
  console.log('='.repeat(60));
  console.log('');
  console.log(`✅ Server running at: http://localhost:${PORT}`);
  console.log('');
  console.log('Open your browser and navigate to the URL above to start.');
  console.log('');
  console.log('Press Ctrl+C to stop the server.');
  console.log('='.repeat(60));
  console.log('');
});
