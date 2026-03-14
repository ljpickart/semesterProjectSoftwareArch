const { createServer } = require('node:http');

const debug = false;

const hostname = '127.0.0.1';
const port = 3000;

const server = createServer((req, res) => {

  // Taken from https://nodejs.org/en/learn/http/anatomy-of-an-http-transaction#a-quick-thing-about-errors
  let body = [];
  req
    .on('data', chunk => {
      body.push(chunk);
    })
    .on('end', () => {
      // TODO: process as json instead of a string
      body = Buffer.concat(body).toString();

      // Print raw json data if debug option is set
      if (debug) console.log("raw string:", body);

      try {
        const parsed = JSON.parse(body);
        console.log(parsed);
      }
      catch (error) {
        console.error("ERROR: failed to parse json:", error.message);
      }
    })
  // at this point, `body` has the entire request body stored in it as a string


  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Data received.');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
