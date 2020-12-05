const Sequelize = require("sequelize");
const express = require("express");
const bodyParser = require("body-parser");
const routes = require('./routes/auth');
// const jwt = require('jsonwebtoken');

const app = express();
const urlencodedParser = bodyParser.urlencoded({ extended: false });


app.set("view engine", "hbs");

const initializeDatabases = require('./dbs')
//const routes = require('./routes')
initializeDatabases().then(dbs => {
  // Initialize the application once database connections are ready.
  // routes(app, dbs);
  console.log('dbs', dbs);
  routes(app, dbs, urlencodedParser); 
  app.listen(3000, () => console.log('Listening on port 3000'))
}).catch(err => {
  console.error('Failed to make all database connections!')
  console.error(err)
  process.exit(1)
});

// app.listen(3000, () => {
//     console.log('server connected new');
// });