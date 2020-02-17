import File from '../models/File';
import Deliveryman from '../models/Deliveryman';

class FileController {
  async store(req, res) {
    const deliveryman = await Deliveryman.findOne({
      where: { id: req.params.deliverymanId },
      attributes: ['id', 'name', 'email', 'avatar_id'],
      include: {
        model: File,
        as: 'avatar',
        attributes: ['name', 'path', 'url'],
      },
    });

    if (!deliveryman) {
      return res.status(400).json({ Error: 'Deliveryman Does not exist!' });
    }

    const { originalname: name, filename: path } = req.file;

    const file = await File.create({ name, path });

    const insertAvatar = await deliveryman.update({
      avatar_id: file.id,
    });

    return res.json(insertAvatar);
  }
}

export default new FileController();
