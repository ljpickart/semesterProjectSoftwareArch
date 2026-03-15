const { createServer } = require('node:http');

const debug = false;

const hostname = '127.0.0.1';
const port = 3000;

let newRequest = null;

const server = createServer((req, res) => {

  res.on('close', () => {
          if(newRequest && newRequest.res === res) {
            console.log("Disconnected, request thrown out");
            newRequest = null;
          }
        });

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

      let parsed;
      try {
        parsed = JSON.parse(body);
        //console.log(parsed);
      }
      catch (error) {
        console.error("ERROR: failed to parse json:", error.message);
        res.statusCode = 400;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Request body parsing failed.');
        return;
      }

      //data coming in from sensor
      // JSON format: {measurement: x}
      if(req.url === "/") {
        const dataValue = parseFloat(parsed.measurement);

        //sanity checking
        if(dataValue > 150 || dataValue < -175) {
          res.statusCode = 400;
          res.end("Bad measurement from sensor");
          return;
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Data received.');

        //if no current request for data from the sensor, ignore the data
        if(newRequest == null) {
          return;
        } else {
          console.log("Request for data from sensor filled");

          //put data into return JSON object
          newRequest.sampleData.push(dataValue);

          //check if all the requested samples have been filled
          if(newRequest.sampleData.length >= newRequest.numberOfSamples) {
            const numberOfSamples = newRequest.numberOfSamples;
            const sampleData = newRequest.sampleData;
            const returnRes = newRequest.res;
            newRequest = null;

            returnRes.statusCode = 200;
            returnRes.setHeader('Content-Type', 'application/json');
            returnRes.end(JSON.stringify({sampleSuccessful: 1, responseMessage: "Success", numberOfSamples, sampleData}))
          }
        }

        //POST /sample endpoint, client posts to this endpoint with number of samples and recieves the data
      } else if(req.url === '/sample') {
        const numberOfSamples = parsed.numberOfSamples;

        if(numberOfSamples === null || numberOfSamples < 1) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({sampleSuccessful: 0, responseMessage: "Improper number of samples requested"}));
          return;
        }

        newRequest = {numberOfSamples, sampleData: [], res};
        
      }
    })
  // at this point, `body` has the entire request body stored in it as a string
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
