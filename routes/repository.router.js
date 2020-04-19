const express = require('express');
const https = require('https')

const bookmarksController = require('../controllers/bookmarks.controller')

const routes = (repositories, bookmarks) => {
  const router = express.Router();
  // endpoint to search for github repos, by string query
  router.route('/repos/search')
    .get((req, res) => {
      const query = req.query.q;
      if (!query)
        return res.sendStatus(400);
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
          return res.json(repositories)
        });
      }).on('error', error => {
        // bad request
        return res.send(error)
      }).end()
    });
  const bController = bookmarksController(bookmarks)
  // endpoint to fetch persisted bookmarked repos
  router.route('/bookmarks')
    .get(bController.get);
  router.route('/bookmarks/:id')
    // endpoint to bookmark a repo, from fetched repositories, using its id
    .post((req, res) => {
      const id = parseInt(req.params.id);
      const repo = repositories.find(r => r.id === id);
      // simple validation - for more complex data types, Joi could be used
      if (!repo)
        return res.sendStatus(404)
      const bookmarked = !!bookmarks.find(b => b.id === id);
      if (bookmarked)
        return res.json(bookmarks)
      // if request is valid, bookmark the repo
      bookmarks.push(repo);
      return res.json(bookmarks);
    })
    // endpoint to remove a repo from the persisted bookmarked repos
    .delete((req, res) => {
      const id = parseInt(req.params.id);
      const index = bookmarks.findIndex(r => r.id === id);
      // simple validation
      if (index < 0)
        return res.status(404).json(bookmarks)
      // if request is valid, remove the bookmark
      bookmarks.splice(index, 1);
      return res.json(bookmarks);
    });
  return router;
}

module.exports = routes;

