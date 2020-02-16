import axios from 'axios';

async function searchCep(data) {
  const endereco = await axios.get(`https://viacep.com.br/ws/${data}/json/`);

  return endereco.data;
}

export default searchCep;
