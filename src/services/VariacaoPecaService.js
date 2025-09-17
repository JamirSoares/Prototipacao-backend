const { VariacaoPeca, AtividadeProcesso, PartePeca } = require('../models');

class VariacaoPecaService {
    async createVariacao(data) {
        const novaVariacao = await VariacaoPeca.create(data);
        return novaVariacao;
    }

    async updateVariacao(id, data) {
        const variacao = await VariacaoPeca.findByPk(id);
        if (variacao) {
            const variacaoAtualizada = await variacao.update(data);

            // Chamada para atualizar o TempoCentesimo da peca pai
            if (variacaoAtualizada.IdPartePeca) {
                 const PartePecaService = require('./PartePecaService');
                 await PartePecaService.recalculateTempoCentesimo(variacaoAtualizada.IdPartePeca);
            }
            return variacaoAtualizada;
        }
        return null;
    }

    async deleteVariacao(id) {
        const variacao = await VariacaoPeca.findByPk(id);
        if (variacao) {
            const idPartePecaPai = variacao.IdPartePeca;
            await variacao.destroy();
            // Recalcula o tempo centesimal da peça pai após a deleção
            if (idPartePecaPai) {
                const PartePecaService = require('./PartePecaService');
                await PartePecaService.recalculateTempoCentesimo(idPartePecaPai);
            }
            return true;
        }
        return false;
    }

    // Funções existentes que não precisam ser alteradas
    async getAllVariacoes() {
        return await VariacaoPeca.findAll();
    }

    async getVariacaoById(id) {
        return await VariacaoPeca.findByPk(id, {
            include: [{ model: AtividadeProcesso }],
        });
    }

    async recalculateTempoCentesimo(idVariacao) {
        const variacao = await VariacaoPeca.findByPk(idVariacao, {
            include: [{ model: AtividadeProcesso }],
        });

        if (variacao) {
            const tempoTotalAtividades = variacao.AtividadeProcessos.reduce((acc, atividade) => {
                return acc + (parseFloat(atividade.TempoCentesimo) || 0);
            }, 0);

            await variacao.update({ TempoCentesimo: tempoTotalAtividades });
            
            // Propagar a atualização para a peca pai
            const PartePecaService = require('./PartePecaService');
            await PartePecaService.recalculateTempoCentesimo(variacao.IdPartePeca);
        }
    }
}

module.exports = new VariacaoPecaService();