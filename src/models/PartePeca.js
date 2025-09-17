const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const PartePeca = sequelize.define('PartePeca', {
    Id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Nome: { type: DataTypes.STRING(100), allowNull: false },
    TempoCentesimo: { type: DataTypes.DECIMAL(10,2), allowNull: true },
    IdModelo: { type: DataTypes.INTEGER, allowNull: false },
}, {
    tableName: 'PartePeca',
    timestamps: false,
});

module.exports = PartePeca;
