const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const port = 8000;

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);

    // Parse URL
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;

    // Default to index.html if accessing root
    if (pathname === '/') {
        pathname = '/index.html';
    }

    // Determine file path - check templates first, then static
    let filePath = path.join(__dirname, 'templates', pathname);
    if (!fs.existsSync(filePath)) {
        filePath = path.join(__dirname, 'static', pathname);
    }

    const ext = path.parse(filePath).ext;
    const mimeType = mimeTypes[ext] || 'text/plain';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/html');
            res.end(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>404 - File Not Found</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            display: flex; 
                            justify-content: center; 
                            align-items: center; 
                            height: 100vh; 
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            text-align: center;
                        }
                        .container { 
                            max-width: 600px; 
                            padding: 2rem;
                        }
                        h1 { font-size: 3rem; margin-bottom: 1rem; }
                        p { font-size: 1.2rem; margin-bottom: 2rem; }
                        .links { margin-top: 2rem; }
                        .links a { 
                            color: #00d4ff; 
                            text-decoration: none; 
                            margin: 0 1rem;
                            padding: 0.5rem 1rem;
                            border: 2px solid #00d4ff;
                            border-radius: 25px;
                            display: inline-block;
                            transition: all 0.3s ease;
                        }
                        .links a:hover { 
                            background: #00d4ff; 
                            color: white;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>404</h1>
                        <p>File not found: ${req.url}</p>
                        <div class="links">
                            <a href="/">🏠 Home (index.html)</a>
                            <a href="/portal.html">🏥 Medibot Portal</a>
                        </div>
                    </div>
                </body>
                </html>
            `);
        } else {
            res.statusCode = 200;
            res.setHeader('Content-Type', mimeType);

            // Add CORS headers for development
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

            res.end(data);
        }
    });
});

server.listen(port, () => {
    console.log(`🚀 Medibot Server running at:`);
    console.log(`📱 Local: http://localhost:${port}`);
    console.log(`🏥 Portal: http://localhost:${port}/portal.html`);
    console.log(`🏠 Home: http://localhost:${port}/index.html`);
    console.log(`\n🔥 Ready to serve your Medibot project!`);

    // Try to open browser automatically
    const open = require('child_process').exec;
    open(`start http://localhost:${port}`);
});

// Handle server errors
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`❌ Port ${port} is already in use.`);
        console.log(`🔄 Try closing other servers or use a different port.`);
    } else {
        console.log('❌ Server error:', err);
    }
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down Medibot server...');
    server.close(() => {
        console.log('✅ Server closed successfully');
        process.exit(0);
    });
});
