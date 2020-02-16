import Mail from '../../lib/Mail';

class OrderMail {
  get key() {
    return 'OrderMail';
  }

  async handle({ data }) {
    const { newOrder } = data;

    await Mail.sendMail({
      to: `${newOrder.delivery.name} <${newOrder.delivery.email}>`,
      subject: 'Novo cadastro',
      template: 'newOrder',
      context: {
        deliveryman: newOrder.delivery.name,
      },
    });
  }
}

export default new OrderMail();
