const express = require('express');
const app = express();
const fs = require('fs');
const readline = require('readline');
const { performance } = require('perf_hooks');
const { Worker } = require('worker_threads');
const path = require('path');
require("./config");
var sql = require('mssql');
const config = {
  server: 'LAPTOP-33SI8OVS',
  database: 'TestDatabase',
  options: {
    trustedConnection: true,
    encrypt: true,
    trustServerCertificate: true
  },
};

// define the endpoint
app.get('/dbIO', (req, res) => {
  sql.connect(config).then(() => {
    // Query
    return sql.query('SELECT * FROM PRODUCT');
  }).then(result => {
    console.log(result);
  }).catch(err => {
    console.log(err);
  });
  //try {
    // connect to the database
    //await sql.connect(config);

    // execute a query
    //const result = await sql.query`SELECT * FROM [dbo].[MyTable]`;

    // close the connection
    //await sql.close();

    // send the result back to the client
    //res.send(result.recordset);
  //} catch (err) {
    //console.error(err);
    //res.status(500).send('Error connecting to the database');
  //}
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});

app.get('/dbIO', (req,res) => {

});

//Disc Input Output Performance Test
app.get('/discIO', (req, res) => {
    // delete "integers.csv" file if it already exists
    if (fs.existsSync('integers.csv')) {
      fs.unlinkSync('integers.csv');
    }
  
    // get current timestamp
    const start = performance.now();
  
    const size = 10000;
    const integers = [];
    // integersList that will hold the result of reading the "integers.csv" file
    const integersList = [];
  
    // populate integers array of size 10000 with random numbers ranging from 0 to 1000
    for (let i = 0; i < size; i++) {
      integers[i] = Math.floor(Math.random() * 1000);
    }
  
    // use fs.createWriteStream() method to write the integers array into the "integers.csv" file
    const writer = fs.createWriteStream('integers.csv');
    integers.forEach(integer => {
      const buffer = Buffer.from(integer.toString() + '\n');
      writer.write(buffer);
    });
    writer.end();
  
    // use readline.createInterface() method to parse the "integers.csv" file and add it to the integersList line by line
    setTimeout(() => {
        const reader = readline.createInterface({
          input: fs.createReadStream('integers.csv'),
          crlfDelay: Infinity
        });
      
        reader.on('line', (line) => {
          const integer = parseInt(line);
          integersList.push(integer);
        });
      
        reader.on('close', () => {
          const end = performance.now();
          const elapsed = end - start;
      
          res.send(`${elapsed}`);
        });
      });
});

app.get('/gc', (req, res) => {

  const ObjectSizeInMB = 100;
  const NumIterations = 10;

  // Allocate a large object in memory
  const largeObject = Buffer.alloc(ObjectSizeInMB * 1024 * 1024);
  
  // Peform an operation on the object
  // Populate the object with integers
  for (let i = 0; i < largeObject.length; i++) {
    largeObject[i] = 1;
  }
  
  // Get initial timestamp
  const start = performance.now();
  
  // Force garbage collection and measure the time it takes to complete
  for (let i = 0; i < NumIterations; i++) {
    global.gc();
  }
  
  // Get final timestamp and calculate elapsed time
  const end = performance.now();
  const elapsed = end - start;
  
  res.send(`${elapsed}`);
});


app.get('/tp', (req, res) => {
  const numThreads = 4;
  const numIterations = 10000000;
  const threads = [];
  
  // get initial timestamp
  const start = performance.now();
  
  // start the threads
  for (let i = 0; i < numThreads; i++) {
    const worker = new Worker(path.join(__dirname, './worker.js'), { workerData: { numIterations } });
  
    worker.on('error', (error) => {
      console.error(`Worker ${i} encountered an error:`, error);
      res.status(500).send(`Worker ${i} encountered an error: ${error}`);
    });
  
    worker.on('message', () => {
      worker.terminate();
    });
  
    threads.push(worker);
  }
  
  // wait for the threads to complete
  let numThreadsCompleted = 0;
  for (let i = 0; i < numThreads; i++) {
    threads[i].on('message', () => {
      numThreadsCompleted++;
      if (numThreadsCompleted === numThreads) {
          //get final timestamp and calculate total execution time
          const end = performance.now();
          const elapsed = end - start;
          res.send(`${elapsed}`);
      }
    });
  }
});





  
  
  
  
