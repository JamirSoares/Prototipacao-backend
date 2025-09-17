const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Modelo = sequelize.define('Modelo', {
    Id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Nome: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    TempoCentesimo: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    ImagemUrl: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    CriadoPor: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
}, {
    tableName: 'Modelo',
    timestamps: false,
});

module.exports = Modelo;