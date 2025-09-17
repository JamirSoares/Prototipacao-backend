const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const Registro = sequelize.define('registro_producao', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    hora: { type: DataTypes.STRING(100), allowNull: false },
    previsto: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    real: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    retrabalho: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    status: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: 'A'
    },
}, {
    tableName: 'registro_producao',
    timestamps: false,
});

const Historico = sequelize.define('historico_producao', {
    historico_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    registro_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Registro, key: 'id' } },
    hora: { type: DataTypes.STRING(100), allowNull: false },
    previsto: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    real: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    retrabalho: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    operacao: { type: DataTypes.CHAR(1), allowNull: false },
    atualizado_em: { type: DataTypes.DATE, allowNull: true },
    referencia: { type: DataTypes.STRING(100), allowNull: true },
    TempoPeca: { type: DataTypes.STRING(100), allowNull: true },
    pessoasCelula: { type: DataTypes.INTEGER, allowNull: true },
    tempoAcabamento: { type: DataTypes.STRING(100), allowNull: true },
    pessoaAcabamento: { type: DataTypes.STRING(100), allowNull: true },
}, {
    tableName: 'historico_producao',
    timestamps: false,
});
Registro.hasMany(Historico, { foreignKey: 'registro_id' });
Historico.belongsTo(Registro, { foreignKey: 'registro_id' });


const Horarios = sequelize.define('horarios',{
    index_hora: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    hora: { type: DataTypes.STRING(100), allowNull: false },
}, {
    tableName: 'horarios',
    timestamps: false,
});


module.exports = { Registro, Historico, Horarios };