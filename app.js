const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

// Init app
const app = express();

// Set static assets containing client side css and js files
app.use(express.static(__dirname + '/public'));

// Set bodyParser for getting client data
app.use(bodyParser.json()); // Use json format
app.use(bodyParser.urlencoded({ extended: false }));

// Set view engine to pug, pug files implicitly stored in 'views'
app.set('view engine', 'pug');

// Index route
app.get('/', (req, res) => {
  res.render('index');
});

// Handle determining category Ajax route
app.post('/rpCategory', (req, res) => {
  // Get product type and model from request
  let {referenceProduct} = req.body;
  const type = referenceProduct.split('-')[0];
  const model = referenceProduct.split('-')[1];

  // Open taxonomy file
  fs.readFile('./taxonomy.txt', 'utf8', (err, data) => {
    if (err) throw err;
    const taxonomyFileArray = data.split(/\n/); // Split all lines of the file into array
    const re = new RegExp(type + '$', 'i'); // Create a product type RegExp to match
    let category = null;
    // Match each line
    taxonomyFileArray.forEach((line) => {
      // If match
      if(line.match(re) !== null) {
        // Store top level category into 'category' variable
        category = line.match(/^(.+?)>/)[1]; // [1] because we only need the one captured by ()
        res.json({category: category}); // respond a json format category data to client
      }
    });
  });
});

// Set port
app.set('port', process.env.PORT || 3000);
const port = app.get('port');

// Start server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
