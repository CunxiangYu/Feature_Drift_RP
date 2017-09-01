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

// Import Category collection
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

// Select products route (Step 3)
app.post('/selectProduct', (req, res) => {
  let categoryFromUser;

  if (typeof req.body.categories === 'string') {
    categoryFromUser = [req.body.categories];
  } else {
    categoryFromUser = req.body.categories;
  }

  Category.find({ 'top': { $in: categoryFromUser } }, (err, categories) => {
    // Tree View model for retrieving and formatting category data
    let categoryData = categories.map((category) => {
      // Top level
      let element = {
        text: category.top,
        hideCheckbox: true,
        selectable: false,
        state: {
          expanded: true
        },
        color: '#fff',
        backColor: '#5fcf80',
        nodes: []
      };
      //Level 2
      element.nodes = category.subLevels.map((subLevel) => {
        let sub = {
          text: subLevel.second,
          hideCheckbox: true,
          selectable: false,
          state: {
            expanded: false
          },
          nodes: []
        };
        // Level 3
        sub.nodes = subLevel.third.map((third) => {
          let num = "" + third.num;
          return {
            text: third.name,
            selectable: false,
            tags: [
              'available',
              num
            ]
          };

        }); // Level 3 End

        return sub;
      }); // Level 2 End

      return element;
    }); // Top level End

    // Render selectProduct page
    res.render('selectProduct', {
      data: JSON.stringify(categoryData) // Convert to string for pug file to successfully receive
    });
  }); // Category Query End

});

// Import Product collection
const Product = require('./models/product');

// Select model route (Step 4)
app.post('/selectModel', (req, res) => {
  // Products array
  let { products } = req.body;
  products = JSON.parse(products);

  Product.find({ third: { $in: products } }, (err, docs) => {
    let modelData = docs.map((product) => {
      let productName = product.third; // Third level of category tree (which is product)

      let modelNamesArray = product.models.map((model) => {
        return model.model;
      }); // Array of string type

      return {
        productName: productName,
        models: modelNamesArray
      };
    });

    res.json({ data: modelData });
  });
});

// Word Cloud (Step 5)
app.post('/wordCloud', (req, res) => {
  // Array containing user selected models for generating word cloud
  let { selectedModels } = req.body;

  // TO DO


});







// Set port
app.set('port', process.env.PORT || 3000);
const port = app.get('port');

// Start server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
