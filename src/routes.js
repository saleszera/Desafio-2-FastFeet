import { Router } from 'express';
import multer from 'multer';
// controllers
import UserController from './app/controllers/UserController';
import SessionControler from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import DeliverymanController from './app/controllers/DeliverymanController';
import FileController from './app/controllers/FileController';
import OrderController from './app/controllers/OrderController';
import DeliveryAccessController from './app/controllers/DeliveryAccessController';
import DeliveryProblemController from './app/controllers/DeliveryProblemController';
// middlewares
import authMiddleware from './app/middlewares/auth';
import onlyAdminMiddleware from './app/middlewares/onlyAdmin';
import multerConfig from './config/multer';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);

routes.post('/sessions', SessionControler.store);

routes.post('/delivery/:id/problems', DeliveryProblemController.store);

routes.get('/deliveryman/:id', DeliveryAccessController.index);
routes.put('/deliveryman/:id', DeliveryAccessController.withdraw);
routes.post(
  '/deliveryman/:deliverymanId/:order',
  upload.single('file'),
  DeliveryAccessController.signature
);
routes.get('/deliveryman/:id/deliveries', DeliveryAccessController.deliveries);

routes.use(authMiddleware);
routes.put('/users', UserController.put);
routes.delete('/users/:id', UserController.delete);

routes.use(onlyAdminMiddleware);
routes.get('/users', UserController.index);

routes.post('/recipient', RecipientController.store);
routes.get('/recipient', RecipientController.index);
routes.put('/recipient', RecipientController.put);

routes.delete('/recipient/:id', RecipientController.delete);

routes.post('/deliverymans', DeliverymanController.store);
routes.get('/deliverymans', DeliverymanController.index);
routes.delete('/deliverymans/:id', DeliverymanController.delete);
routes.put('/deliverymans/:id', DeliverymanController.put);
routes.get('/deliverymans/:id', DeliverymanController.show);

routes.post('/files', upload.single('file'), FileController.store);

routes.post('/orders', OrderController.store);
routes.get('/orders', OrderController.index);
routes.get('/orders/:id', OrderController.show);
routes.delete('/orders/:id', OrderController.delete);
routes.put('/orders/:id', OrderController.put);

routes.get('/delivery/problems', DeliveryProblemController.index);
routes.get('/delivery/:id/problems', DeliveryProblemController.show);

export default routes;
