const express = require('express');
const exphbs  = require('express-handlebars');
var fs = require('fs');
var https = require('https');


const app = express();

const dotenv = require('dotenv');
dotenv.config();

app.use(express.static('public'));
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

const { auth, requiresAuth } = require('express-openid-connect');
const port = 4040;

const config = { 
    authRequired : false,
    idpLogout : true,
    secret: process.env.SECRET,
    baseURL: `https://localhost:${port}`,
    clientID: process.env.CLIENT_ID,
    issuerBaseURL: 'https://ks-web2-projekt1.eu.auth0.com',
    clientSecret: process.env.CLIENT_SECRET,
    authorizationParams: {
      response_type: 'code'
     },
  };
app.use(auth(config));

app.get('/',  function (req, res) {
    req.user = {
        isAuthenticated : req.oidc.isAuthenticated()
    };
    if (req.user.isAuthenticated) {
        req.user.name = req.oidc.user.name;
    }
    console.log(req.user);
    res.render('index', {layout: false});
});

app.get('/history', requiresAuth(), function (req, res) {
    console.log(req.user);         
    res.render('index', {layout: false});
});

https.createServer({
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
  }, app)
  .listen(port, () => 
    console.log(`Server running at https://localhost:${port}/`)
);

// app.listen(port, () => {
//     console.log(`Server running at http://localhost:${port}`)
//   })