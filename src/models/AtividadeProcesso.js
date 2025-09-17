const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const AtividadeProcesso = sequelize.define('AtividadeProcesso', {
    Id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    IdVariacao: { type: DataTypes.INTEGER, allowNull: false },
    Operacao: { type: DataTypes.INTEGER },
    Atividade: { type: DataTypes.STRING(255) },
    Maquina: { type: DataTypes.STRING(100) },
    TempoRelogio: { type: DataTypes.DECIMAL(10,2) },
    TempoCentesimo: { type: DataTypes.DECIMAL(10,2) },
    ColaboradorCronometrado: { type: DataTypes.STRING(100) },
    Tamanho: { type: DataTypes.STRING(50) },
    CriadoPor: { type: DataTypes.INTEGER },
}, {
    tableName: 'AtividadeProcesso',
    timestamps: false,
});

module.exports = AtividadeProcesso;
