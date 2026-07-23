import { createServer } from 'node:http';

const PORT = process.env.PORT ?? 3000;

const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end('<h1>Hello, World!</h1><p>Running on Node.js ' + process.version + '</p>');
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
