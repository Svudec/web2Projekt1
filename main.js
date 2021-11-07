const express = require('express');
const exphbs  = require('express-handlebars');

const app = express();
const port = 4040;

app.use(express.static('public'));
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.get('/',  function (req, res) {
    res.render('index', {layout: false})
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
  })