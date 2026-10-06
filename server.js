const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = 3000;
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.csv': 'text/csv; charset=UTF-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp'
};

function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push({ name, address: iface.address });
      }
    }
  }
  return addresses;
}

const server = http.createServer((req, res) => {
  // CORS headers for local LAN devices
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';

  const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(__dirname, safePath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Server Error');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

// Bind to 0.0.0.0 so external devices on the same Wi-Fi (like phones) can connect!
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`Earth's Vitals Jukebox Server is Active!`);
  console.log(`======================================================`);
  console.log(`Local Access:   http://localhost:${PORT}`);
  
  const ips = getLocalIpAddresses();
  if (ips.length > 0) {
    console.log(`\nMobile Phone Access (Connect phone to same Wi-Fi):`);
    ips.forEach(ip => {
      console.log(` -> http://${ip.address}:${PORT} (${ip.name})`);
    });
  }
  console.log(`======================================================\n`);
});
