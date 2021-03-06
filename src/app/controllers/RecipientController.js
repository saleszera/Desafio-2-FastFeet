import * as Yup from 'yup';

import Recipient from '../models/Recipient';

import searchCep from '../../utils/searchCep';

class RecipientController {
  async store(req, res) {
    const schema = Yup.object().shape({
      nome: Yup.string().required(),
      cep: Yup.string().required(),
      numero: Yup.string(), // O numero da casa pode ser algo como A1 ou 1F e pode não conter número
      complemento: Yup.string().required(),
    });

    if (!schema.isValid(req.body)) {
      return res.status(400).json({ Error: 'Validation is fails!' });
    }

    const { nome, numero, complemento } = req.body;
    try {
      const { cep, logradouro, bairro, localidade, uf } = await searchCep(
        req.body.cep
      );

      const endereco = await Recipient.create({
        nome,
        rua: logradouro,
        numero,
        bairro,
        complemento,
        estado: uf,
        cidade: localidade,
        cep,
      });

      return res.json(endereco);
    } catch (err) {
      return res.status(400).json({ Error: 'Bad request' });
    }
  }

  async index(req, res) {
    const { page = 1 } = req.query;
    const destinatarios = await Recipient.findAll({
      limit: 20,
      offset: (page - 1) * 20,
      attributes: [
        'id',
        'nome',
        'rua',
        'numero',
        'bairro',
        'complemento',
        'cidade',
        'estado',
        'cep',
      ],
    });
    return res.json(destinatarios);
  }

  async put(req, res) {
    const schema = Yup.object().shape({
      id: Yup.string().required(),
      nome: Yup.string(),
      rua: Yup.string(),
      numero: Yup.string(),
      bairro: Yup.string(),
      complemento: Yup.string(),
      estado: Yup.string(),
      cidade: Yup.string(),
      cep: Yup.string(),
    });

    if (!schema.isValid(req.body)) {
      return res.status(400).json({ Error: 'Validation fails!' });
    }

    const { id } = req.body;
    const destinatario = await Recipient.findByPk(id);

    if (!destinatario) {
      return res.status(400).json({ Error: 'Recipiend does not exist!' });
    }

    const {
      nome,
      rua,
      numero,
      bairro,
      complemento,
      estado,
      cidade,
      cep,
    } = await destinatario.update(req.body);

    return res.json({
      nome,
      rua,
      numero,
      bairro,
      complemento,
      estado,
      cidade,
      cep,
    });
  }

  async delete(req, res) {
    const { id } = req.params;

    const recipient = await Recipient.findByPk(id);
    if (!recipient) {
      return res.status(400).json({ Error: 'User does not exist!' });
    }
    recipient.destroy();

    return res.status(200).json({ Message: 'ok' });
  }
}

export default new RecipientController();
