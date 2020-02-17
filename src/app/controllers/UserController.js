import * as Yup from 'yup';

import User from '../models/User';

class UserController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(6),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ Error: 'Validation fails' });
    }

    const userExists = await User.findOne({ where: { email: req.body.email } });

    if (userExists) {
      return res.status(400).json({ Error: 'User already exists' });
    }

    const { id, name, email } = await User.create(req.body);

    return res.json({
      id,
      name,
      email,
    });
  }

  async put(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ Error: 'Validation fails' });
    }

    const user = await User.findByPk(req.userId);

    const { email, oldPassword } = req.body;

    if (email && email === user.email) {
      return res
        .status(400)
        .json({ Error: 'You can not update email with this email!' });
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ Error: 'Password does not match' });
    }

    const { id, name } = await user.update(req.body);

    return res.json({
      id,
      name,
      email,
    });
  }

  async index(req, res) {
    const { page = 1 } = req.query;
    const users = await User.findAll({
      limit: 20,
      offset: (page - 1) * 20,
      attributes: ['id', 'name', 'email', 'provider'],
    });
    return res.json(users);
  }

  async delete(req, res) {
    const user = await User.findOne({ where: { id: req.userId } });

    if (user === null) {
      return res
        .status(400)
        .json({ Error: 'You can not do it! Verify your token or ID!' });
    }

    if (user.id === req.params.id) {
      return res
        .status(400)
        .json({ Error: 'you can delete only your account!' });
    }

    user.destroy();
    return res.json({ Message: 'ok' });
  }
}

export default new UserController();
