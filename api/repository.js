const express = require('express');
const app = express();
const https = require('https')

// array to persist the fetched repositories
let repositories = [];
// array to persist the bookmarked repos from the fetch repositories
let bookmarks = [];

// endpoint to search for github repos, by string query
const searchRepos = app.get('/api/repos/search', (req, res) => {
  const query = req.query.q;
  if (!query)
    return res.status(400).send("A search term is required.")
  // options for the https get request to the github dev API
  const options = {
    hostname: `api.github.com`,
    port: 443,
    path: `/search/repositories?q=${query}`,
    method: 'GET',
    headers: { 'User-Agent': 'github-repo-search-backend' }
  }
  https.get(options, githubResponse => {
    let data = '';
    githubResponse.on('data', chunk => {
      data += chunk;
    });
    githubResponse.on('end', () => {
      // keep only the array of repositories returned in githubResponse
      repositories = JSON.parse(data).items;
      res.send(repositories)
    });
  }).on('error', error => {
    // bad request
    res.status(400).send(error)
    console.error(error)
  }).end()
});

// endpoint to bookmark a repo, from fetched repositories, using its id
const bookmarkRepo = app.post('/api/repos/bookmark/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const repo = repositories.find(r => r.id === id);
  // simple validation - for more complex data types, Joi could be used
  if (!repo)
    return res.status(404).send(bookmarks)
  const bookmarked = !!bookmarks.find(b => b.id === id);
  if (bookmarked)
    return res.send(bookmarks)
  // if request is valid, bookmark the repo
  bookmarks.push(repo);
  res.status(200).send(bookmarks);
});

// endpoint to fetch persisted bookmarked repos
const getBookmarkedRepos = app.get('/api/repos/bookmarks', (req, res) => {
  // return the bookmarks
  res.send(bookmarks);
});

// endpoint to remove/delete a repo from the persisted bookmarked repos
const removeBookmark = app.delete('/api/repos/bookmarks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const repo = repositories.find(r => r.id === id);
  // simple validation
  if (!repo)
    return res.status(404).send(bookmarks)
  // if request is valid, remove the bookmark
  const index = bookmarks.findIndex(r => r.id === id);
  bookmarks.splice(index, 1);
  res.status(200).send(bookmarks);
});


module.exports = {
  searchRepos: searchRepos,
  bookmarkRepo: bookmarkRepo,
  getBookmarkedRepos: getBookmarkedRepos,
  removeBookmark: removeBookmark
}
