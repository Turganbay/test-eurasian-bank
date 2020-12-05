const MongoClient = require('mongodb').MongoClient;
 
const PROD_URI = "mongodb://Turganbay:turboturbo92@ds033267.mlab.com:33267/test-eurasion"
 
function connect(url) {
  return MongoClient.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(client => client.db())
}
 
module.exports = async function() {
  let databases = await Promise.all([connect(PROD_URI)])
 
  return {
    production: databases[0]
  }
}