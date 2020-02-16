import * as Yup from 'yup';

import DeliveryProblem from '../models/DeliveryProblem';
import Order from '../models/Order';

class DeliveryProblemController {
  async show(req, res) {
    const problems = await DeliveryProblem.findOne({
      where: { delivery_id: req.params.id },
      attributes: ['delivery_id', 'description'],
      include: {
        model: Order,
        as: 'order_problem',
        attributes: ['id', 'product', 'recipient_id', 'deliveryman_id'],
      },
    });

    if (problems === null) {
      return res
        .status(404)
        .json({ Message: 'it does not exist problem to that order!' });
    }

    return res.json(problems);
  }

  async index(req, res) {
    const problem = await DeliveryProblem.findAll({
      attributes: ['delivery_id', 'description'],
      include: {
        model: Order,
        as: 'order_problem',
        attributes: ['id', 'product', 'recipient_id', 'deliveryman_id'],
      },
    });

    return res.json(problem);
  }

  async store(req, res) {
    const isOrder = await Order.findOne({ where: { id: req.params.id } });

    if (!isOrder) {
      return res.status(400).json({ Error: 'ID does not exist!' });
    }

    const schema = Yup.object().shape({
      delivery_id: Yup.number(),
      description: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ Error: 'Validation fails!' });
    }
    if (req.body.delivery_id && req.body.delivery_id !== req.params.id) {
      return res.status(400).json({ Error: 'You can not do it!' });
    }

    const newProblem = await DeliveryProblem.create({
      delivery_id: req.params.id,
      description: req.body.description,
    });

    return res.json({
      id: newProblem.id,
      delivery_id: newProblem.delivery_id,
      description: newProblem.description,
    });
  }
}

export default new DeliveryProblemController();
