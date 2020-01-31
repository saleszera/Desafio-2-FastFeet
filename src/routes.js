const { Router } = require('express');

const routes = Router();

routes.get('/', (req, res) => {
  return res.json({Message: "It's Works!"});
})

module.exports = routes;