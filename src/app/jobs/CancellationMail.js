import { format, parseISO } from 'date-fns';
import { pt } from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class CancellationMail {
  get key() {
    return 'CancellationMail';
  }

  async handle({ data }) {
    const { order } = data;

    await Mail.sendMail({
      to: `${order.delivery.name} <${order.delivery.email}>`,
      subject: 'Entrega cancelada!',
      template: 'cancellation',
      context: {
        deliveryman: order.delivery.name,
        id: order.id,
        product: order.product,
        canceled_at: format(
          parseISO(order.canceled_at),
          "'dia' dd 'de' MMMM', às' H:mm'h'",
          { locale: pt }
        ),
      },
    });
  }
}

export default new CancellationMail();
