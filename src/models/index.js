const sequelize = require('./database');

const AtividadeProcesso = require('./AtividadeProcesso');
const VariacaoPeca = require('./VariacaoPeca');
const PartePeca = require('./PartePeca');
const Modelo = require('./Modelo');
const ProcessoProduto = require('./ProcessoProduto');
const { Model } = require('sequelize');


// Exemplo de associações
VariacaoPeca.belongsTo(PartePeca, { foreignKey: 'IdPartePeca' });
PartePeca.hasMany(VariacaoPeca, { foreignKey: 'IdPartePeca' });

AtividadeProcesso.belongsTo(VariacaoPeca, { foreignKey: 'IdVariacao' });
VariacaoPeca.hasMany(AtividadeProcesso, { foreignKey: 'IdVariacao' });

PartePeca.belongsTo(Modelo, { foreignKey: 'IdModelo' });

Modelo.hasMany(PartePeca, { foreignKey: 'IdModelo' });
Modelo.hasMany(ProcessoProduto, { foreignKey: 'IdModelo' })



module.exports = {
  sequelize,
  AtividadeProcesso,
  VariacaoPeca,
  PartePeca,
  Modelo,
  ProcessoProduto,
};
