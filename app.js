const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const mongoose = require('mongoose');
const session = require('express-session');
const dbSetting = require('./dbCredentials');
const sw = require('stopword'); // Node module for removing stopwords
const removeDuplicateWord = require('./lib/removeDuplicateWord');
const tm = require('textmining'); // Node module for sorting words based on frequency

// Init app
const app = express();

// Session middleware
let sess = {
  secret: 'rp feature',
  resave: false,
  saveUninitialized: false,
  cookie: {}
};

if (app.get('env') === 'production') {
  app.set('trust proxy', 1);
  sess.cookie.secure = true;
}

app.use(session(sess));

// Connect to db
mongoose.connect(dbSetting.db, { useMongoClient: true });

// Set static assets containing client side css and js files
app.use(express.static(__dirname + '/public'));

// Set bodyParser for getting client data
app.use(bodyParser.json()); // Use json format
app.use(bodyParser.urlencoded({ extended: false }));

// Set view engine to pug, pug files implicitly stored in 'views'
app.set('view engine', 'pug');

// Import Category collection
const Category = require('./models/category');

// Import Product collection
const Product = require('./models/product');

// Import Specification collection
const Specification = require('./models/specification');

// Global session variable
let ssn;

// Index route (Step 1)
app.get('/', (req, res) => {
  ssn = req.session;
  // Set session variables
  ssn.allModelsArray = [];
  ssn.maxLength = 0;
  ssn.relatedProducts = [];
  res.render('index');
});

// Handle determining category Ajax route
app.post('/rpCategory', (req, res) => {
  // Get product type and model from request
  let {referenceProduct} = req.body;
  ssn.rpType = referenceProduct.split('-')[0];
  ssn.rpModel = referenceProduct.split('-')[1];

  Specification.findOne({ 'model': ssn.rpModel }, (err, model) => {
    let wordsArray = model.specification.split(' ');
    let bag = tm.bagOfWords(wordsArray, true, true);
    let featureWordsArray = bag.terms.sort(function(a, b) {
      if (a.frequency > b.frequency) {
        return -1;
      } else if (a.frequency < b.frequency) {
        return 1;
      } else {
        return 0;
      }
    });
    featureWordsArray = featureWordsArray.slice(1, 71).map(obj => {
      return obj.term;
    });

    let modelAndSpec = {
     modelName: model.model,
     specArray: featureWordsArray
    };
    ssn.allModelsArray.push(modelAndSpec);
  });

  // Open taxonomy file
  fs.readFile('./taxonomy.txt', 'utf8', (err, data) => {
    if (err) throw err;
    const taxonomyFileArray = data.split(/\n/); // Split all lines of the file into array
    const re = new RegExp(ssn.rpType + '$', 'i'); // Create a product type RegExp to match
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

// Select model route (Step 4)
app.post('/selectModel', (req, res) => {
  // Products array
  let { products } = req.body;
  products = JSON.parse(products);

  Product.find({ third: { $in: products } }, (err, docs) => {
    let modelData = docs.map((product) => {
      let productName = product.third; // Third level of category tree (which is product)

      let modelNamesArray = product.models.map((model) => {
        return model;
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
  let selectedModels;
  if (typeof req.body.selectedModels === 'string') {
    selectedModels = [req.body.selectedModels];
  } else {
    selectedModels = req.body.selectedModels;
  }

  // Find specs data of each model in DB
  Specification.find({ model: {$in: selectedModels} }, (err, models) => {
    models.map((model) => {
      let wordsArray = model.specification.split(' ');
      let bag = tm.bagOfWords(wordsArray, true, true);
      let featureWordsArray = bag.terms.sort(function(a, b) {
        if (a.frequency > b.frequency) {
          return -1;
        } else if (a.frequency < b.frequency) {
          return 1;
        } else {
          return 0;
        }
      });
      featureWordsArray = featureWordsArray.slice(1, 71).map(obj => {
        return obj.term;
      });
      // Each individual model data in object format
      let modelAndSpec = {
       modelName: model.model,
       specArray: featureWordsArray
      };
      ssn.allModelsArray.push(modelAndSpec);
    });

    res.render('wordCloud', {
      data: JSON.stringify(ssn.allModelsArray) // Convert to string for pug file to successfully receive
    });
  });

});


// Ask user to set the similarity range (Step 6)
app.post('/setSimilarityRange', (req, res) => {
  // User input non-feature words for filtering in string format
  let { userInputWords } = req.body;
  // Convert it to array
  userInputWords = userInputWords.split(' ').map(word => {
    return word.toLowerCase();
  });
  // Filter userInputWords
  ssn.allModelsArray.forEach((model) => {
    model.specArray = model.specArray.filter((word) => {
        if (userInputWords.indexOf(word.toLowerCase()) === -1) {
          return true;
        } else {
          return false;
        }
    });
  });
  // Find the max length of specArray
  ssn.allModelsArray.forEach((model) => {
    if (model.specArray.length > ssn.maxLength) {
      ssn.maxLength = model.specArray.length
    }
    model.specArray = model.specArray.map((word) => {
      return word.toLowerCase();
    });
  });

  // Fill up to maxLength with 'null'
  ssn.allModelsArray.forEach((model) => {
    if (model.specArray.length < ssn.maxLength) {
      let nullCount = ssn.maxLength - model.specArray.length;
      for (let i = 0; i < nullCount; i++) {
        model.specArray.push(null);
      }
    }
  });
  
  // Sepatate other models from RP model
  ssn.rpAndSpec = ssn.allModelsArray[0];
  ssn.otherModelsAndSpec = ssn.allModelsArray.slice(1);

  // Render a form asking for similarity range
  res.render('similarityRange');
});


// Ask user to choose his interested product (Step 7)
app.post('/interestedProduct', (req, res) => {
  // Similarity range
  let min = parseFloat(req.body.min);
  let max = parseFloat(req.body.max);
  // Calculate similarity
  ssn.otherModelsAndSpec.forEach((model) => {
    let sameWordCount = 0;
    model.specArray.map((word) => {
      if (ssn.rpAndSpec.specArray.indexOf(word) !== -1) {
        sameWordCount++;
      }
    });

    let valueOfSimilarity = sameWordCount / (Math.sqrt(ssn.rpAndSpec.specArray.length) * Math.sqrt(sameWordCount));

    valueOfSimilarity = parseFloat(valueOfSimilarity.toFixed(1));
    // If in the range, push it to relatedProducts array
    if (valueOfSimilarity >= min && valueOfSimilarity <= max) {
      ssn.relatedProducts.push(model);
    }
  });
  let relatedProductsModelArray = ssn.relatedProducts.map((model) => {
    return model.modelName;
  });

  Product.find({models: {$elemMatch: {$in: relatedProductsModelArray}}}, (err, products) => {
    let relatedProductsData = products.map(product => {
      for (let i = 0; i < product.models.length; i++) {
        if (relatedProductsModelArray.indexOf(product.models[i]) !== -1) {
          return {
            productName: product.third,
            modelName: product.models[i]
          };
        }
      }
    });
    res.render('interestedProduct', {
      relatedProducts: relatedProductsData
    });
  });
});


// Show Unique Feature (Step 8)
app.post('/showUniqueFeature', (req, res) => {
  let uniqueFeatures = [];
  ssn.relatedProducts.forEach(product => {
    product.specArray.forEach(word => {
      if (ssn.rpAndSpec.specArray.indexOf(word) === -1 &&
          uniqueFeatures.indexOf(word) === -1) {
        uniqueFeatures.push(word);
      }
    });
  });

  res.render('uniqueFeatures', {
    data: JSON.stringify(uniqueFeatures) // Convert to string for pug file to successfully receive
  });
});











// Set port
app.set('port', process.env.PORT || 3000);
const port = app.get('port');

// Start server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
