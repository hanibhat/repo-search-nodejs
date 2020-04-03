const express = require('express');
const cors = require('cors');
const app = express();

// require project modules
const repository = require('./api/repository')

// setting port
app.set('port', (process.env.PORT || 5000));

// setting middleware
app.use(express.json());
app.use(cors());

// register APIs
app.use(repository.searchRepos);
app.use(repository.bookmarkRepo);
app.use(repository.getBookmarkedRepos);
app.use(repository.removeBookmark);

// run the server
app.listen(app.get('port'), () => {
  console.log('Node app is running on port', app.get('port'));
});