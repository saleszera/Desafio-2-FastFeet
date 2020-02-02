require('dotenv/config');

module.exports = {
  dialect: process.env.DB_DIALECT,
  host: process.env.DB_HOST,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
  define: {
    // timestamps garante que haverá uma coluna updated_at e created_at dentro de cada tabela do banco de dados
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  },
};
