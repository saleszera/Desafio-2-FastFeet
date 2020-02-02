import jwt from 'jsonwebtoken';
import { promisify } from 'util';

import User from '../models/User';
import authConfig from '../../config/auth';

export default async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ Error: 'Token is not provided' });
  }

  const [, token] = authHeader.split(' ');

  try {
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);

    const isAdmin = await User.findByPk(decoded.id);

    if (!isAdmin.provider === true) {
      return res.status(401).json({ Error: 'You do not have permision!' });
    }

    return next();
  } catch (err) {
    return res.status(401).json({ Error: 'Token invalid' });
  }
};
