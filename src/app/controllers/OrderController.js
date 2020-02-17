import * as Yup from 'yup';

import Order from '../models/Order';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';

import OrderMail from '../jobs/OrderMail';
import CancellationMail from '../jobs/CancellationMail';
import Queue from '../../lib/Queue';

class OrderController {
  async store(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
      product: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ Error: 'Validation fails' });
    }
    const { recipient_id, deliveryman_id } = req.body;

    const isRecipient = await Recipient.findOne({
      where: { id: recipient_id },
    });

    if (!isRecipient) {
      return res.status(400).json({ Error: 'Recipient ID does not exist!' });
    }

    const isDeliveryman = await Deliveryman.findOne({
      where: { id: deliveryman_id },
    });

    if (!isDeliveryman) {
      return res.status(400).json({ Error: 'Deliveryman ID does not exist!' });
    }

    const { id, product } = await Order.create(req.body);
    const newOrder = await Order.findByPk(id, {
      include: {
        model: Deliveryman,
        as: 'delivery',
        attributes: ['id', 'name', 'email'],
      },
    });

    await Queue.add(OrderMail.key, {
      newOrder,
    });

    return res.json({ id, product, recipient_id, deliveryman_id });
  }

  async index(req, res) {
    const { page = 1 } = req.query;
    const orders = await Order.findAll({
      order: ['created_at'],
      limit: 20,
      offset: (page - 1) * 20,
      attributes: [
        'id',
        'product',
        'recipient_id',
        'deliveryman_id',
        'signatures_id',
      ],
    });

    return res.json(orders);
  }

  async delete(req, res) {
    const order = await Order.findOne({
      where: { id: req.params.id },
      attributes: [
        'id',
        'product',
        'start_date',
        'end_date',
        'canceled_at',
        'deliveryman_id',
        'recipient_id',
        'signatures_id',
      ],
      include: {
        model: Deliveryman,
        as: 'delivery',
        attributes: ['name', 'email'],
      },
    });

    if (!order) {
      return res.status(400).json({ Error: 'Order does not exist!' });
    }

    if (order.canceled_at !== null) {
      return res.status(400).json({ Error: 'Order have already canceled!' });
    }

    order.canceled_at = new Date();
    order.save();

    await Queue.add(CancellationMail.key, {
      order,
    });

    return res.json(order);
  }

  async put(req, res) {
    const order = await Order.findOne({
      where: { id: req.params.id, canceled_at: null },
    });

    if (!order) {
      return res.status(400).json({ Error: 'Order ID does not exist!' });
    }

    const schema = Yup.object().shape({
      recipient_id: Yup.number(),
      deliveryman_id: Yup.number(),
      product: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ Error: 'Validation fails' });
    }

    try {
      const {
        id,
        product,
        deliveryman_id,
        recipient_id,
        signatures_id,
        start_date,
        end_date,
        canceled_at,
      } = await order.update(req.body);
      return res.status(200).json({
        id,
        product,
        deliveryman_id,
        recipient_id,
        signatures_id,
        start_date,
        end_date,
        canceled_at,
      });
    } catch (err) {
      return res.status(500).json({ Error: 'Anything wrong happend...' });
    }
  }

  async show(req, res) {
    const order = await Order.findOne({
      where: { id: req.params.id },
      attributes: [
        'id',
        'product',
        'deliveryman_id',
        'recipient_id',
        'signatures_id',
      ],
      include: {
        model: Recipient,
        as: 'recipient',
        attributes: [
          'nome',
          'rua',
          'numero',
          'bairro',
          'cidade',
          'estado',
          'cep',
        ],
      },
    });

    if (!order) {
      return res.status(400).json({ Error: 'ID does not exist!' });
    }

    return res.json(order);
  }
}

export default new OrderController();
