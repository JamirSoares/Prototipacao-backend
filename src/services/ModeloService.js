const { Modelo, PartePeca, ProcessoProduto } = require('../models');

class ModeloService {
    async createModelo(data) {
        return await Modelo.create(data);
    }
    
    async updateModelo(id, data) {
        const modelo = await Modelo.findByPk(id);
        if (modelo) {
            const modeloAtualizado = await modelo.update(data);
            
            // Chamada para atualizar o TempoCentesimo do processo pai
            if (modeloAtualizado.Id) {
                const ProcessoProdutoService = require('./ProcessoProdutoService');
                await ProcessoProdutoService.recalculateTempoCentesimo(modeloAtualizado.Id);
            }
            return modeloAtualizado;
        }
        return null;
    }
    
    async deleteModelo(id) {
        const modelo = await Modelo.findByPk(id);
        if (modelo) {
            await modelo.destroy();
            return true;
        }
        return false;
    }

    async getAllModelos() {
        return await Modelo.findAll();
    }
    
    async getModeloById(id) {
        return await Modelo.findByPk(id);
    }
    
    async getModeloWithDetails(id) {
        return await Modelo.findByPk(id, {
            include: [
                {
                    model: ProcessoProduto,
                },
                {
                    model: PartePeca,
                    include: [
                        {
                            model: VariacaoPeca,
                            include: [
                                {
                                    model: AtividadeProcesso,
                                }
                            ]
                        }
                    ]
                }
            ]
        });
    }

    async recalculateTempoCentesimo(idModelo) {
        const modelo = await Modelo.findByPk(idModelo, {
            include: [{ model: PartePeca }],
        });

        if (modelo) {
            const tempoTotalPecas = modelo.PartePecas.reduce((acc, parte) => {
                return acc + (parseFloat(parte.TempoCentesimo) || 0);
            }, 0);

            await modelo.update({ TempoCentesimo: tempoTotalPecas });
            
            // Propagar a atualização para o processo pai
            const ProcessoProdutoService = require('./ProcessoProdutoService');
            await ProcessoProdutoService.recalculateTempoCentesimo(modelo.Id);
        }
    }
}

module.exports = new ModeloService();