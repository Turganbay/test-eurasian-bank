const Sequelize = require("sequelize");
const express = require("express");
const bodyParser = require("body-parser");
const routes = require('./routes/auth');
// const jwt = require('jsonwebtoken');
const port = process.env.PORT || 3000;


const app = express();
const urlencodedParser = bodyParser.urlencoded({ extended: false });
// At the top of your server.js
process.env.PWD = process.cwd()

// Then
app.use(express.static(process.env.PWD + '/uploads'));

app.set("view engine", "hbs");

const initializeDatabases = require('./dbs')
//const routes = require('./routes')

const server = require('http').Server(app);

initializeDatabases().then(dbs => {
  // Initialize the application once database connections are ready.
  // routes(app, dbs);
  console.log('dbs', dbs);
  routes(app, dbs, urlencodedParser); 
  server.listen(port, () => console.log('Listening on port:', port))
}).catch(err => {
  console.error('Failed to make all database connections!')
  console.error(err)
  process.exit(1)
});

// app.listen(3000, () => {
//     console.log('server connected new');
// });