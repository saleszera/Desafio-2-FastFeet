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
      return res.status(400).json({ Error: 'Validation is fails' });
    }

    const { nome, numero, complemento } = req.body;

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
  }
}

export default new RecipientController();
