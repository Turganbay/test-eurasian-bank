const storage = require('node-sessionstorage');
const accessTokenSecret = 'youraccesstokensecret';
const jwt = require('jsonwebtoken');
const path = require("path");


const multer = require('multer');
//const upload = multer({dest: 'uploads/'});


const multer_storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        console.log(file);
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

const upload = multer({ storage: multer_storage, fileFilter: fileFilter });

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

        dbs.production.collection('images').find({ userId: req.user.id}).toArray((err, docs) => {

            console.info('docs', docs);
            // if (err) {
            //   console.log(err)
            //   //res.error(err)
            // } else {
            //   console.info('message page', res.json(docs));
            //   //res.json(docs)
            // }
            res.render("main.hbs",  {
                user: req.user,
                images: docs
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

    app.get('/logout', function(req, res, next) {
        //req.logout();
        req.session = null;
        storage.setItem('token', null);
        res.redirect('/');
    });

    app.post('/upload', authenticateJWT, upload.single('file'), (req, res) => {
        console.log('req', req.user);
        console.log('req', req);
        
        if (!req.file) {
          console.log("No file received");
          return res.send({
            success: false
          });
      
        } else {
            const img_data = {
                userId: req.user.id,
                filename: req.file.filename, 
                createdAt: Date.now(),
            }
            dbs.production.collection('images').insertOne(img_data, (err, message) => {
                console.log('err', err);
                console.log('message', message);
            });
            console.log('file received');
            res.redirect('/main');
          return res.send({
            success: true
          })
        }
      });
    return app;
}