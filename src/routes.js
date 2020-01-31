import { Router } from 'express';

const routes = Router();

routes.get('/', (req, res) => {
  return res.json({Message: "It's Works!"});
})

export default routes;