import { Router } from 'express';
// controllers
import UserController from './app/controllers/UserController';
import SessionControler from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
// middlewares
import authMiddleware from './app/middlewares/auth';
import onlyAdminMiddleware from './app/middlewares/onlyAdmin';

const routes = new Router();

routes.post('/users', UserController.store);
routes.post('/sessions', SessionControler.store);

routes.use(authMiddleware);
routes.put('/users', UserController.put);
routes.use(onlyAdminMiddleware);
routes.post('/recipient', RecipientController.store);
routes.get('/recipient', RecipientController.show);

export default routes;
