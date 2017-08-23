const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.set('view engine', 'pug');

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(3000);
