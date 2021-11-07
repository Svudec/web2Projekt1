const express = require('express');
const exphbs  = require('express-handlebars');
var fs = require('fs');
var https = require('https');


const app = express();
//array to save recent logins
const history = [];

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
app.use(express.json());
app.use(express.urlencoded());

//homescreen
app.get('/',  function (req, res) {
    req.user = {
        isAuthenticated : req.oidc.isAuthenticated()
    };
    //redirect if logged in
    if (req.user.isAuthenticated) {
        req.user.name = req.oidc.user.name;
        res.redirect('/history')
    } else {
        res.render("empty", {user: req.user});
    }
});

//protected endpoint for logged in users
app.get('/history', requiresAuth(), function (req, res) {
    req.user = {
        isAuthenticated : req.oidc.isAuthenticated()
    };
    if (req.user.isAuthenticated) {
        req.user.name = req.oidc.user.name;
    }
    res.render("history", {user: req.user});
});

//endpoint to save login data to server
app.post('/saveLocation', function(req, res){
    const newLoginUser = req.body.user;

    const oldUserRecord = history.find( ({ name }) => name === newLoginUser.name );
    if(oldUserRecord){
        oldUserRecord.time = newLoginUser.time;
        oldUserRecord.longitude = newLoginUser.longitude;
        oldUserRecord.latitude = newLoginUser.latitude;
    } else {
        if(history.length > 4){
            history.pop();
        }
        history.push(newLoginUser)
    }
    history.sort((a, b) => b.time - a.time);
    res.json(history);
});

app.get('/logout', requiresAuth(), function(req, res) {
    res.oidc.logout({returnTo: '/'});
});

https.createServer({
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
  }, app)
  .listen(port, () => 
    console.log(`Server running at https://localhost:${port}/`)
);