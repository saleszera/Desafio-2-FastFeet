import * as Yup from 'yup';
import Deliveryman from '../models/Deliveryman';

class DeliverymanController {
  async store(req, res) {
    const schema = Yup.object().shape({
      nome: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ Error: 'Validation fails!' });
    }
    if (await Deliveryman.findOne({ where: { email: req.body.email } })) {
      return res.status(400).json({ Error: 'Email already exists!' });
    }
    const { id, nome, email } = await Deliveryman.create(req.body);
    return res.json({ id, nome, email });
  }

  async index(req, res) {
    const { page = 1 } = req.query;
    const deliverymans = await Deliveryman.findAll({
      order: ['nome'],
      limit: 20,
      offset: (page - 1) * 20,
      attributes: ['id', 'nome', 'email'],
    });

    return res.json(deliverymans);
  }

  async delete(req, res) {
    const isUserId = await Deliveryman.findOne({
      where: { id: req.params.id },
    });

    if (!isUserId) {
      return res.status(400).json({ Error: 'User ID does not exist!' });
    }

    await Deliveryman.destroy({ where: { id: req.params.id } });
    return res.status(200).json({});
  }

  async put(req, res) {
    const deliveryman = await Deliveryman.findOne({
      where: { id: req.params.id },
    });
    // verfica se o id existe no banco de dados
    if (!deliveryman) {
      return res.status(400).json({ Error: 'Deliveryman ID does not exist!' });
    }

    const schema = Yup.object().shape({
      nome: Yup.string(),
      email: Yup.string().email(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ Error: 'Validation fails!' });
    }

    const { email } = req.body;

    if (email && email === deliveryman.email) {
      return res.status(400).json({ Error: 'Email already exists!' });
    }

    const { id, nome } = await deliveryman.update(req.body);

    return res.json({ id, nome, email });
  }

  async show(req, res) {
    try {
      const { id } = req.params;
      const deliveryman = await Deliveryman.findOne({
        where: { id },
        attributes: ['id', 'nome', 'email'],
      });

      if (deliveryman === null) {
        return res.status(400).json({ Error: 'Deliveryman does not exist!' });
      }

      return res.json(deliveryman);
    } catch (err) {
      return res.status(400).json({ Error: 'Insert only numbers!' });
    }
  }
}

export default new DeliverymanController();
