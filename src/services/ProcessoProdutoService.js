const { ProcessoProduto, Modelo } = require('../models');

class ProcessoProdutoService {
    async createProcesso(payload) {
        return await ProcessoProduto.create(payload);
    }

    async updateProcesso(id, payload) {
        const processo = await ProcessoProduto.findByPk(id);
        if (!processo) {
            throw new Error('Processo não encontrado');
        }
        return await processo.update(payload);
    }

    async deleteProcesso(id) {
        const processo = await ProcessoProduto.findByPk(id);
        if (!processo) {
            throw new Error('Processo não encontrado');
        }
        await processo.destroy();
        return { message: 'Processo excluído com sucesso' };
    }

    async getAllProcessos() {
        return await ProcessoProduto.findAll();
    }

    async getProcessoById(id) {
        return await ProcessoProduto.findByPk(id);
    }

    async recalculateTempoCentesimo(idModelo) {
        const modelo = await Modelo.findByPk(idModelo);
        if (modelo) {
            const processos = await ProcessoProduto.findAll({ where: { IdModelo: idModelo } });
            for (const processo of processos) {
                await processo.update({ TempoCentesimo: parseFloat(modelo.TempoCentesimo) || 0 });
            }
        }
    }
}

module.exports = new ProcessoProdutoService();