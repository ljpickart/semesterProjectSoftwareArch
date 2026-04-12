const { createServer } = require('node:http');
const http = require('node:http');

const debug = false;

const hostname = '0.0.0.0';
const port = 3000;

const transformerHost = 'transformer';
const transformerPort = 5000;

let newRequest = null;

const server = createServer((req, res) => {

  res.on('close', () => {
    if (newRequest && newRequest.res === res) {
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
      body = Buffer.concat(body).toString();

      if(!body.trim()) {
        res.statusCode = 200;
        res.end("OK");
        return;
      }
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
      if (req.url === "/") {
        const dataValue = parseFloat(parsed.measurement);

        //sanity checking
        if (dataValue > 150 || dataValue < -175) {
          res.statusCode = 400;
          res.end("Bad measurement from sensor");
          return;
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Data received.');

        //if no current request for data from the sensor, ignore the data
        if (newRequest == null) {
          return;
        } else {
          console.log("Request for data from sensor filled");

          //put data into return JSON object
          newRequest.sampleData.push(dataValue);

          //check if all the requested samples have been filled
          if (newRequest.sampleData.length >= newRequest.numberOfSamples) {
            const numberOfSamples = newRequest.numberOfSamples;
            const sampleData = newRequest.sampleData;
            const returnRes = newRequest.res;
            newRequest = null;

            const body = JSON.stringify({sampleData});
            const options = {
              hostname: transformerHost,
              port: transformerPort,
              path: '/',
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
            };

            const transformerRequest = http.request(options, (transformerResponse) => {
              let transformerRequestBody = '';
              transformerResponse.on('data', c =>{transformerRequestBody += c});
              transformerResponse.on('end', () => {
                console.log("Transformer Response: ", transformerRequestBody);
                returnRes.statusCode = 200;
                returnRes.setHeader('Content-Type', 'application/json');
                returnRes.end(JSON.stringify({
                  sampleSuccessful: 1,
                  responseMessage: "Success",
                  numberOfSamples,
                  sampledVoltage: sampleData,
                  transformerResult: JSON.parse(transformerRequestBody),
                }))
              })

            })

            transformerRequest.on('error', (e) => {
              console.error("Error forwarding to transformer:", e);
              returnRes.statusCode = 502;
              returnRes.end("Failed to reach transformer");
            });
 
            transformerRequest.write(body);
            transformerRequest.end();
          }
        }

        //POST /sample endpoint, client posts to this endpoint with number of samples and recieves the data
      } else if (req.url === '/sample') {
        const numberOfSamples = parsed.numberOfSamples;

        if (numberOfSamples === null || numberOfSamples < 1) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ sampleSuccessful: 0, responseMessage: "Improper number of samples requested" }));
          return;
        }

        newRequest = { numberOfSamples, sampleData: [], res };

      }
    })
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
