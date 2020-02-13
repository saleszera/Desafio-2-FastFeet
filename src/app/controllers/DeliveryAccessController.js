import { Op } from 'sequelize';
import { isBefore, parseISO } from 'date-fns';
import * as Yup from 'yup';
import Order from '../models/Order';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';

class DeliverymanAccessController {
  async index(req, res) {
    const isDeliveryman = await Deliveryman.findOne({
      where: { id: req.params.id },
    });

    if (!isDeliveryman) {
      return res.status(401).json({ Error: 'Deliveryman does not exist!' });
    }

    const order = await Order.findAll({
      where: {
        deliveryman_id: req.params.id,
        end_date: null,
        canceled_at: null,
      },
      attributes: [
        'id',
        'product',
        'start_date',
        'signatures_id',
        'deliveryman_id',
        'recipient_id',
      ],
      include: {
        model: Recipient,
        as: 'recipient',
        attributes: [
          'nome',
          'rua',
          'numero',
          'bairro',
          'complemento',
          'cidade',
          'estado',
          'cep',
        ],
      },
    });

    return res.json(order);
  }

  async deliveries(req, res) {
    const isDeliveryman = await Deliveryman.findOne({
      where: { id: req.params.id },
    });

    if (!isDeliveryman) {
      return res.status(401).json({ Error: 'Deliveryman does not exist!' });
    }

    const order = await Order.findAll({
      where: {
        deliveryman_id: req.params.id,
        end_date: {
          [Op.not]: null, // retorna apenas o registro que não é null
        },
      },
      attributes: [
        'id',
        'product',
        'start_date',
        'end_date',
        'signatures_id',
        'deliveryman_id',
        'recipient_id',
      ],
      include: {
        model: Recipient,
        as: 'recipient',
        attributes: [
          'nome',
          'rua',
          'numero',
          'bairro',
          'complemento',
          'cidade',
          'estado',
          'cep',
        ],
      },
    });

    return res.json(order);
  }

  async put(req, res) {
    const isDeliveryman = await Deliveryman.findOne({
      where: { id: req.params.id },
    });

    if (!isDeliveryman) {
      return res.status(401).json({ Error: 'Deliveryman does not exist!' });
    }

    const schema = Yup.object().shape({
      id: Yup.number().required(),
      start_date: Yup.date(),
      end_date: Yup.date(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ Error: 'Validation fails!' });
    }

    const order = await Order.findOne({ where: { id: req.body.id } });

    if (!order) {
      return res.status(400).json({ Error: 'Order id does not exist!' });
    }

    if (isBefore(parseISO(req.body.start_date), new Date()) === true) {
      return res.status(400).json({ Error: 'Start date is before today!' });
    }

    if (
      req.body.end_date &&
      isBefore(parseISO(req.body.start_date), parseISO(req.body.end_date)) ===
        false
    ) {
      return res.status(400).json({ Error: 'End date is before start date!' });
    }

    if (req.body.product || req.body.recipient_id || req.body.deliveryman_id) {
      return res.status(401).json({ Error: 'You can not do it!' });
    }

    const { id, product, start_date, end_date } = await order.update(req.body);
    return res.json({ id, product, start_date, end_date });
  }
}

export default new DeliverymanAccessController();
