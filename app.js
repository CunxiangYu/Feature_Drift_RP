const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const mongoose = require('mongoose');
const dbSetting = require('./dbCredentials');

// Global variable holding the type and model of RP (development)
let type, model;

// Init app
const app = express();

// Connect to db
mongoose.connect(dbSetting.db, { useMongoClient: true });

// Set static assets containing client side css and js files
app.use(express.static(__dirname + '/public'));

// Set bodyParser for getting client data
app.use(bodyParser.json()); // Use json format
app.use(bodyParser.urlencoded({ extended: false }));

// Set view engine to pug, pug files implicitly stored in 'views'
app.set('view engine', 'pug');

// Index route (Step 1)
app.get('/', (req, res) => {
  res.render('index');
});

// Handle determining category Ajax route
app.post('/rpCategory', (req, res) => {
  // Get product type and model from request
  let {referenceProduct} = req.body;
  type = referenceProduct.split('-')[0];
  model = referenceProduct.split('-')[1];

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
        category = line.match(/^(.+?)>/)[1].trim(); // [1] because we only need the one captured by ()
        res.json({category: category}); // respond a json format category data to client
      }
    });
  });
});

// Category collection
const Category = require('./models/category');

// Select category route (Step 2)
app.post('/selectCategory', (req, res) => {
  Category.find({}, 'top', (err, categories) => {
    if (err) return console.error(err);
    let categoryData = categories.map((category) => {
      return category.top;
    });
    res.render('selectCategory', {
      categories: categoryData
    });
  });
});

const Product = require('./models/product');

// Select products route (Step 3)
app.post('/selectProduct', (req, res) => {
  let categoryFromUser;

  if (typeof req.body.categories === 'string') {
    categoryFromUser = [req.body.categories];
  } else {
    categoryFromUser = req.body.categories;
  }


  Category.find({ 'top': { $in: categoryFromUser } }, (err, categories) => {
    // View model for retrieving and formatting category data
    let categoryData = categories.map((category) => {
      // Top level
      let element = {
        text: category.top,
        nodes: []
      };
      //Level 2
      element.nodes = category.subLevels.map((subLevel) => {
        let sub = {
          text: subLevel.second,
          nodes: []
        };
        // Level 3
        sub.nodes = subLevel.third.map((third) => {
          return {
            text: third
          };
        }); // Level 3 End

        return sub;
      }); // Level 2 End

      return element;
    }); // Top level End

  }); // Category Query End
});

// Set port
app.set('port', process.env.PORT || 8080);
const port = app.get('port');

// Start server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
