const express = require('express');
const cors = require('cors');
const app = express();

// require project modules
const repositoryRouter = require('./routes/repository.router');

// array to persist the fetched repositories
let repositories = [];
// array to persist the bookmarked repos from the fetch repositories
let bookmarks = [];

// setting port
app.set('port', (process.env.PORT || 5000));

// setting middleware
app.use(express.json());
app.use(cors());

// register APIs
app.use('/api', repositoryRouter(repositories, bookmarks));

// default route
app.get('/', (req, res) => {
  res.send('Welcome to Github repo search backend!');
});

// run the server
app.listen(app.get('port'), () => {
  console.log('Node app is running on port', app.get('port'));
});