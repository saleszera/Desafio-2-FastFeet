import jwt from 'jsonwebtoken';
import * as Yup from 'yup';

import User from '../models/User';
import authConfig from '../../config/auth';

class SessionController {
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string().required(),
    });

    if (!schema.isValid(req.body)) {
      return res.status(400).json({ Error: 'Validation is fails' });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ Error: 'User not found!' });
    }

    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ Error: 'Password does not match!' });
    }

    const { id, nome } = user;

    return res.json({
      user: {
        id,
        nome,
      },
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    });
  }
}

export default new SessionController();
