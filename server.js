const { createServer } = require('node:http');

const hostname = '127.0.0.1';
const port = 3000;

const server = createServer((req, res) => {
  
  // Taken from https://nodejs.org/en/learn/http/anatomy-of-an-http-transaction#a-quick-thing-about-errors
  let body = [];
  request
    .on('data', chunk => {
      body.push(chunk);
    })
    .on('end', () => {
      // TODO: process as json instead of a string
      body = Buffer.concat(body).toString();
      // at this point, `body` has the entire request body stored in it as a string
    });


  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
