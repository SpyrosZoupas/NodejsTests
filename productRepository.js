const sql = require('mssql');
const config = {
  user: 'your_username',
  password: 'your_password',
  server: 'your_server',
  database: 'your_database',
  options: {
    encrypt: true, // If you are connecting to Azure SQL Database, set this to true
    trustServerCertificate: true // If you are connecting to Azure SQL Database, set this to false
  }
};

async function DatabaseIO() {
  try {
    // Create and populate a list of 2000 Products 
    let products = [];
    for (let i = 1; i <= 2000; i++) {
      products.push({ Name: `Product${i}`, Description: `Description for Product${i}`, Price: i * 10 });
    }

    // Connect to the database
    await sql.connect(config);

    // Delete any existing data in the Products table
    await sql.query`DELETE FROM PRODUCT`;

    //Start timer
    const stopwatch = new Date();

    // Insert the list of products into the database using Dapper
    await sql.transaction(async (tx) => {
      const ps = new sql.PreparedStatement(tx);
      ps.input('Name', sql.NVarChar);
      ps.input('Description', sql.NVarChar);
      ps.input('Price', sql.Int);
      for (const product of products) {
        ps.prepare('INSERT INTO PRODUCT (Name, Description, Price) VALUES (@Name, @Description, @Price)', (err) => {
          if (err) throw err;
          ps.execute(product, (err) => {
            if (err) throw err;
          });
        });
      }
      await ps.unprepare();
    });

    // Select all PRODUCT rows from the database and convert them to a list
    const query = 'SELECT * FROM PRODUCT';
    const result = await sql.query(query);

    // Stop timer
    const elapsed = new Date() - stopwatch;

    return elapsed;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// Call the method
DatabaseIO().then((elapsed) => {
  console.log(`Elapsed time: ${elapsed} ms`);
}).catch((err) => {
  console.error(err);
});
