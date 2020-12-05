const users = require('../models/users');
const storage = require('node-sessionstorage');
const accessTokenSecret = 'youraccesstokensecret';
const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
   
    const token = storage.getItem('token');
    console.log('token', token);
    // const authHeader = req.headers.authorization;

    if (token) {
        // const token = authHeader.split(' ')[1];

        jwt.verify(token, accessTokenSecret, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }

            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

module.exports = function(app, dbs, urlencodedParser) {

    
    app.get('/', (req, res) => {
        res.render("index.hbs",  {
            users: [{
                id: 1,
                name: "Turbo",
                age: 27  
            }]
        });
    })

    app.get('/main', authenticateJWT, (req, res) => {
        // console.log('current user', req.user);

        dbs.production.collection('users').find().toArray((err, docs) => {
            // console.info('message page', res.json(docs));
            // if (err) {
            //   console.log(err)
            //   //res.error(err)
            // } else {
            //   console.info('message page', res.json(docs));
            //   //res.json(docs)
            // }
            res.render("main.hbs",  {
                user: req.user
            });

          });
    });

    app.post('/login', urlencodedParser, (req, res) => {
        const { username, password } = req.body;
        dbs.production.collection('users').find({ username: username, password: password }).toArray((err, docs) => {
            if (err || docs.length == 0) {
                res.render("index.hbs");
            } else {
                const accessToken = jwt.sign({ username: docs[0].username,  id: docs[0].id }, accessTokenSecret);
                storage.setItem('token', accessToken);
                res.redirect('/main');
            }
        });
    });

    return app;
}