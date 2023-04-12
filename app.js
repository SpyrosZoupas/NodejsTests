const express = require('express');
const app = express();
const fs = require('fs');
const readline = require('readline');
const { performance } = require('perf_hooks');
const { Worker } = require('worker_threads');
const path = require('path');
const sql = require("mssql/msnodesqlv8");
const connection = new sql.ConnectionPool({
  database: "TestDatabase",
  server: "LAPTOP-33SI8OVS",
  driver: "msnodesqlv8",
  options: {
    trustedConnection: true,
    encrypt: true,
    trustServerCertificate: true
  }
});

app.get('/databaseio', (req, res) => {
  // Create and populate a list of 2000 Products
  const products = [];
  for (let i = 1; i <= 2000; i++) {
    products.push({ Name: `Product${i}`, Description: `Description for Product${i}`, Price: i * 10 });
  }

  // Connect to the database
  connection.connect().then(() => {
    //Delete any existing data in the Products table
    connection.query("DELETE FROM PRODUCT", (err, result) => {
      if (err) {
        console.log(err);
        return;
      }

      // Start timer
      const start = performance.now();

      // Insert the list of products into the database using the Tedious library
      const request = new sql.Request(connection);
      connection.query("INSERT INTO PRODUCT (Name, Description, Price) VALUES (@Name, @Description, @Price)", products);

        // Select all PRODUCT rows from the database and convert them to a list
        const query = "SELECT * FROM PRODUCT";
        request.query(query, (err, result) => {
          if (err) {
            console.log(err);
            return;
          }
        });
        
        // Stop timer and calculate elapsed time
        const end = new Date().getTime();
        const elapsed = end - start;

        // Send response with elapsed time
        res.send(`${elapsed}`);
    });
  });
});

  app.get('/dbIO', function (req, res) {
   
    // Populate the list of 2000 products
    const products = [];
    for (let i = 1; i <= 2000; i++) {
      products.push({ Name: `Product${i}`, Description: `Description for Product${i}`, Price: i * 10 });
    }

    const start = performance.now();

    // connect to your database
    connection.connect().then(() => {
    });

    const end = performance.now();

    const elapsed = end - start;

    res.send(`${elapsed}`);
  });

  app.listen(3000, () => {
    console.log('Server listening on port 3000');
  });
  
app.get('/discIO', (req, res) => {
    // Deletes "integers.csv" file if it already exists
    if (fs.existsSync('integers.csv')) {
      fs.unlinkSync('integers.csv');
    }
  
    // start timer
    const start = performance.now();
  
    // size of integers array
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
      }, 2); // Wait for 1 second (adjust this as needed)
});

app.get('/gc', (req, res) => {
    const ObjectSizeInMB = 100;
    const NumIterations = 10;
  
    // Allocate a large object in memory
    const largeObject = Buffer.alloc(ObjectSizeInMB * 1024 * 1024);
  
    // Peforms an operation on the object
    // Populates the object with integers
    for (let i = 0; i < largeObject.length; i++) {
      largeObject[i] = 1;
    }
  
    // Starts timer
    const start = performance.now();
  
    // Force garbage collection and measure the time it takes
    for (let i = 0; i < NumIterations; i++) {
      global.gc();
    }
  
    const end = performance.now();
    const elapsed = end - start;
  
    res.send(`${elapsed}`);
});


app.get('/tp', (req, res) => {
  const numThreads = 4;
  const numIterations = 10000000;
  const threads = [];
  
  const start = performance.now();
  
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
  
  let numThreadsCompleted = 0;
  for (let i = 0; i < numThreads; i++) {
    threads[i].on('message', () => {
      numThreadsCompleted++;
      if (numThreadsCompleted === numThreads) {
          const end = performance.now();
          const elapsed = end - start;
          res.send(`${elapsed}`);
      }
    });
  }
});





  
  
  
  
