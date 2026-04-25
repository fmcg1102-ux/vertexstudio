/**
 * Express API server that serves the dashboard and data
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const api = require('./api');
const { generateReport } = require('./reportGenerator');

const PORT = 3333;
const PUBLIC_DIR = path.join(__dirname, '..');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;

  // API endpoints
  if (pathname === '/api/dashboard') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(api.getDashboardData()));
    return;
  }

  if (pathname === '/api/report/download') {
    try {
      const reportPath = path.join(__dirname, '..', 'reports');
      if (!fs.existsSync(reportPath)) {
        fs.mkdirSync(reportPath, { recursive: true });
      }

      const fileName = `nike-visibility-${new Date().toISOString().split('T')[0]}.pdf`;
      const filePath = path.join(reportPath, fileName);

      generateReport(filePath).then(() => {
        const fileContent = fs.readFileSync(filePath);
        res.writeHead(200, {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Content-Length': fileContent.length
        });
        res.end(fileContent);
      }).catch(err => {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      });
      return;
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
      return;
    }
  }

  // Serve static files
  if (pathname === '/') pathname = '/index.html';

  const filePath = path.join(PUBLIC_DIR, pathname.replace(/^\//, ''));
  const fileExt = path.extname(filePath).toLowerCase();

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const mimeType = mimeTypes[fileExt] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mimeType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`\n🚀 Vertex Studio Dashboard`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`📊 API: http://localhost:${PORT}/api/dashboard`);
  console.log(`\n💡 To collect data: node server/collect.js\n`);
});
