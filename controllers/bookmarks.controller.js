const bookmarksController = (bookmarks) => {
  const get = (req, res) => {
    return res.json(bookmarks)
  }
  return { get }
}

module.exports = bookmarksController;