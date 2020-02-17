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
import DeliveryStart from './app/controllers/DeliveryStart';
import DeliveryEnd from './app/controllers/DeliveryEnd';
// middlewares
import authMiddleware from './app/middlewares/auth';
import onlyAdminMiddleware from './app/middlewares/onlyAdmin';
import multerConfig from './config/multer';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);

routes.post('/sessions', SessionControler.store);

routes.post('/delivery/:orderId/problems', DeliveryProblemController.store);

routes.get('/deliveryman/:id', DeliveryAccessController.index);
routes.put(
  '/deliveryman/:deliverymanId/start/order/:orderId',
  DeliveryStart.store
);
routes.put(
  '/deliveryman/:deliverymanId/end/order/:orderId',
  upload.single('file'),
  DeliveryEnd.put
);
routes.get(
  '/deliveryman/:deliverymanId/deliveries',
  DeliveryAccessController.deliveries
);

routes.use(authMiddleware);
routes.put('/users', UserController.put);
routes.delete('/users/:userId', UserController.delete);

routes.use(onlyAdminMiddleware);
routes.get('/users', UserController.index);

routes.post('/recipient', RecipientController.store);
routes.get('/recipient', RecipientController.index);
routes.put('/recipient', RecipientController.put);

routes.delete('/recipient/:recipientId', RecipientController.delete);

routes.post('/deliverymans', DeliverymanController.store);
routes.get('/deliverymans', DeliverymanController.index);
routes.delete('/deliverymans/:deliverymanId', DeliverymanController.delete);
routes.put('/deliverymans/:deliverymanId', DeliverymanController.put);
routes.get('/deliverymans/:deliverymanId', DeliverymanController.show);

routes.post(
  '/avatar/deliveryman/:deliverymanId',
  upload.single('file'),
  FileController.store
);

routes.post('/orders', OrderController.store);
routes.get('/orders', OrderController.index);
routes.get('/orders/:orderId', OrderController.show);
routes.delete('/orders/:id', OrderController.delete);
routes.put('/orders/:id', OrderController.put);

routes.get('/delivery/problems', DeliveryProblemController.index);
routes.get('/delivery/:deliverymanId/problems', DeliveryProblemController.show);

export default routes;
