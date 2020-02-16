import { Op } from 'sequelize';
import { isBefore, parseISO, format } from 'date-fns';
import * as Yup from 'yup';
import Order from '../models/Order';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';

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

  async withdraw(req, res) {
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
    const { start_date, end_date } = req.body;
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ Error: 'Validation fails!' });
    }

    const order = await Order.findOne({ where: { id: req.body.id } });

    if (!order) {
      return res.status(400).json({ Error: 'Order id does not exist!' });
    }

    if (isBefore(parseISO(start_date), new Date()) === true) {
      return res.status(400).json({ Error: 'Start date is before today!' });
    }

    if (
      end_date &&
      isBefore(parseISO(start_date), parseISO(end_date)) === false
    ) {
      return res.status(400).json({ Error: 'End date is before start date!' });
    }

    if (req.body.product || req.body.recipient_id || req.body.deliveryman_id) {
      return res.status(401).json({ Error: 'You can not do it!' });
    }

    const start = format(parseISO(start_date), 'HH:mm')
      .split(':')
      .join('')
      .split('0')
      .join('');

    if (start < 8 || start > 18) {
      return res.status(400).json({ Error: 'You can not start at this hour!' });
    }

    const end = format(parseISO(end_date), 'HH:mm')
      .split(':')
      .join('')
      .split('0')
      .join('');

    if (end < 8 || end > 18) {
      return res.status(400).json({ Error: 'You can not end at this hour!' });
    }

    const { id, product } = await order.update(req.body);
    return res.json({ id, product, start_date, end_date });
  }

  async signature(req, res) {
    const deliveryman = await Deliveryman.findOne({
      where: { id: req.params.id },
    });

    if (!deliveryman) {
      return res.status(401).json({ Error: 'Deliveryman does not exist!' });
    }

    const order = await Order.findOne({
      where: { id: req.params.order },
    });

    if (!order) {
      return res.status(401).json({ Error: 'Order does not exist!' });
    }

    const { originalname: name, filename: path } = req.file;

    const { id, url } = await File.create({ name, path });

    const {
      product,
      deliveryman_id,
      recipient_id,
      start_date,
      end_date,
    } = await order.update({ signatures_id: id });

    return res.json(
      product,
      deliveryman_id,
      recipient_id,
      start_date,
      end_date,
      url
    );
  }
}

export default new DeliverymanAccessController();
