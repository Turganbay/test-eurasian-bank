const express = require("express");
const bodyParser = require("body-parser");
const routes = require('./routes');
const port = process.env.PORT || 3000;
const app = express();
const urlencodedParser = bodyParser.urlencoded({ extended: false });
process.env.PWD = process.cwd()


app.use(express.static(process.env.PWD + '/uploads'));
app.use(express.static(__dirname ));

app.set("view engine", "hbs");

const initializeDatabases = require('./dbs')
const server = require('http').Server(app);

initializeDatabases().then(dbs => {
  routes(app, dbs, urlencodedParser); 
  server.listen(port, () => console.log('Listening on port:', port))
}).catch(err => {
  console.error('Failed to make all database connections!')
  console.error(err)
  process.exit(1)
});
