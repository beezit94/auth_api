var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
const userRoutes = require('./routes/user');

mongoose
  .connect('mongodb://localhost/authapi')
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/api/user', userRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
