import { Router } from 'express';
import multer from 'multer';
// controllers
import UserController from './app/controllers/UserController';
import SessionControler from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import DeliverymanController from './app/controllers/DeliverymanController';
import FileController from './app/controllers/FileController';
// middlewares
import authMiddleware from './app/middlewares/auth';
import onlyAdminMiddleware from './app/middlewares/onlyAdmin';
import multerConfig from './config/multer';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionControler.store);

routes.use(authMiddleware);
routes.put('/users', UserController.put);
routes.delete('/users/:id', UserController.delete);
routes.use(onlyAdminMiddleware);
routes.get('/users', UserController.show);
routes.post('/recipient', RecipientController.store);
routes.get('/recipient', RecipientController.show);
routes.put('/recipient', RecipientController.put);
routes.delete('/recipient/:id', RecipientController.delete);
routes.post('/deliverymans', DeliverymanController.store);
routes.get('/deliverymans', DeliverymanController.index);
routes.delete('/deliverymans/:id', DeliverymanController.delete);
routes.put('/deliverymans/:id', DeliverymanController.put);
routes.get('/deliverymans/:id', DeliverymanController.show);
routes.post('/files', upload.single('file'), FileController.store);

export default routes;
