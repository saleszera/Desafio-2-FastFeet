import {
  startOfDay,
  endOfDay,
  setHours,
  setMinutes,
  setSeconds,
  isAfter,
  isBefore,
} from 'date-fns';
import { Op } from 'sequelize';

import Order from '../models/Order';
import Deliveryman from '../models/Deliveryman';

class DeliveryStart {
  async store(req, res) {
    const { deliverymanId, orderId } = req.params;

    const deliveryman = await Deliveryman.findByPk(deliverymanId);
    if (!deliveryman) {
      return res.status(400).json({ Error: 'Deliveryman does not exist!' });
    }

    const order = await Order.findOne({
      where: {
        id: orderId,
        deliveryman_id: deliverymanId,
        start_date: null,
        canceled_at: null,
      },
    });
    if (!order) {
      return res.status(400).json({ Error: 'Order does not exist!' });
    }

    const date = new Date();

    const startDelivery = setSeconds(setMinutes(setHours(date, 8), 0), 0);
    const endDelivery = setSeconds(setMinutes(setHours(date, 18), 0), 0);

    if (!(isAfter(date, startDelivery) && isBefore(date, endDelivery))) {
      return res
        .status(400)
        .json({ Error: 'You can start between 08:00 and 18:00' });
    }

    const { count: countAttempts } = await Order.findAndCountAll({
      where: {
        deliveryman_id: deliverymanId,
        canceled_at: null,
        start_date: { [Op.between]: [startOfDay(date), endOfDay(date)] },
      },
    });

    if (countAttempts >= 5) {
      return res
        .status(400)
        .json({ Error: 'You have reached your 5 attempts' });
    }

    const deliveryStart = await Order.update({ start_date: new Date() });

    return res.json(deliveryStart);
  }
}

export default new DeliveryStart();
