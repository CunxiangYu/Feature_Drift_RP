const express = require('express');
const bodyParser = require('body-parser');

// Init app
const app = express();

// Set static assets containing client side css and js files
app.use(express.static(__dirname + '/public'));

// Set bodyParser for getting client data
app.use(bodyParser.json()); // Use json format
app.use(bodyParser.urlencoded({ extended: true }));

// Set view engine to pug, pug files implicitly stored in 'views'
app.set('view engine', 'pug');

// Set port
app.set('port', process.env.PORT || 8000);

app.get('/', (req, res) => {
  res.render('index');
});

const port = app.get('port');
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
