const { DataTypes } = require('sequelize');
const sequelize = require('./database');
const Modelo = require('./Modelo');

const ProcessoProduto = sequelize.define('ProcessoProduto', {
    Id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Referencia: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    Tecido: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    IdModelo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Modelo,
            key: 'Id'
        }
    },
    TempoCentesimo: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    CriadoPor: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'ProcessoProduto',
    timestamps: false
});

ProcessoProduto.belongsTo(Modelo, {
    foreignKey: 'IdModelo'
});

module.exports = ProcessoProduto;