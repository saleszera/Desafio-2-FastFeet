import * as Yup from 'yup';
import Deliveryman from '../models/Deliveryman';
import User from '../models/User';

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
}

export default new DeliverymanController();
