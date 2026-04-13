const { createServer } = require('node:http');
const http = require('node:http');

const debug = false;

const hostname = '0.0.0.0';
const port = 3000;

const transformerHost = process.env.TRANSFORMER_HOST;
const transformerPort = process.env.TRANSFORMER_PORT;

let newRequest = {
  numberOfSamples: 1,
  sampleData: [],
  res: null 
};

const server = createServer((req, res) => {

  res.on('close', () => {
    if (newRequest && newRequest.res === res) {
      console.log("Disconnected, request thrown out");
      newRequest = null;
    }
  });

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

      let parsed;
      try {
        parsed = JSON.parse(body);
      }
      catch (error) {
        console.error("ERROR: failed to parse json:", error.message);
        res.statusCode = 400;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Request body parsing failed.');
        return;
      }

      const currentReq = newRequest; 

      if (req.url === "/") {
        const dataValue = parseFloat(parsed.measurement);

        if (dataValue > 150 || dataValue < -175) {
          res.statusCode = 400;
          res.end("Bad measurement from sensor");
          return;
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Data received.');
        
        console.log(`Received data from sensor. State of newRequest: ${currentReq ? 'ACTIVE' : 'NULL (Dropping data)'}`);

        if (!currentReq) { 
          return;
        } else {
          console.log("Request for data from sensor filled");

          currentReq.sampleData.push(dataValue); 

          console.log(`checking sample length, length [${currentReq.sampleData.length}] >= req [${currentReq.numberOfSamples}]`)
          
          if (currentReq.sampleData.length >= currentReq.numberOfSamples) {
            console.log(`requirement filled, sending packet`);
            const numberOfSamples = currentReq.numberOfSamples;
            const sampleData = currentReq.sampleData;
            const returnRes = currentReq.res; 
            
            currentReq.sampleData = []; 
            
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
                
                if (returnRes) { 
                  returnRes.statusCode = 200;
                  returnRes.setHeader('Content-Type', 'application/json');
                  returnRes.end(JSON.stringify({
                    sampleSuccessful: 1,
                    responseMessage: "Success",
                    numberOfSamples,
                    sampledVoltage: sampleData,
                    transformerResult: JSON.parse(transformerRequestBody),
                  }));
                } else {
                  console.log("Background batch complete. No client to respond to.");
                }
              })
            })

            transformerRequest.on('error', (e) => {
              console.error("Error forwarding to transformer:", e);
              if (returnRes) {
                returnRes.statusCode = 502;
                returnRes.end("Failed to reach transformer");
              }
            });

            transformerRequest.write(body);
            transformerRequest.end();
          }
        }

      } else if (req.url === '/sample') {
        const numberOfSamples = parsed.numberOfSamples;

        if (numberOfSamples === null || numberOfSamples < 1) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ sampleSuccessful: 0, responseMessage: "Improper samples requested" }));
          return;
        }

        newRequest = { numberOfSamples, sampleData: [], res };
      }
    })
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
