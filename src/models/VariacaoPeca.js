const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const VariacaoPeca = sequelize.define('VariacaoPeca', {
    Id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Nome: { type: DataTypes.STRING(100), allowNull: false },
    TempoCentesimo: { type: DataTypes.DECIMAL(10,2), allowNull: true },
    IdPartePeca: { type: DataTypes.INTEGER, allowNull: false },
}, {
    tableName: 'VariacaoPeca',
    timestamps: false,
});

module.exports = VariacaoPeca;
