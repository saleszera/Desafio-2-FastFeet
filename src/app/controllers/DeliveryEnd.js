import { Op } from 'sequelize';

import Order from '../models/Order';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';

class DeliveryEnd {
  async put(req, res) {
    const { deliverymanId, orderId } = req.params;

    const deliveryman = await Deliveryman.findByPk(deliverymanId);
    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveryman does not exist.' });
    }

    const order = await Order.findOne({
      where: {
        id: orderId,
        deliveryman_id: deliverymanId,
        canceled_at: null,
        start_date: {
          [Op.ne]: null,
        },
        end_date: null,
      },
    });

    if (!order) {
      return res.status(400).json({
        error: 'delivery does not exist or has finished',
      });
    }

    const { filename: path, originalname: name } = req.file;

    const newFile = await File.create({
      path,
      name,
    });

    const finishedDelivery = await order.update({
      signatures_id: newFile.id,
      end_date: new Date(),
    });

    return res.json(finishedDelivery);
  }
}

export default new DeliveryEnd();
