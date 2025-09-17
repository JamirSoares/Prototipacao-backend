const { PartePeca, VariacaoPeca, Modelo } = require('../models');

class PartePecaService {
    async createParte(data) {
        return await PartePeca.create(data);
    }

    async updateParte(id, data) {
        const parte = await PartePeca.findByPk(id);
        if (parte) {
            const parteAtualizada = await parte.update(data);

            // Chamada para atualizar o TempoCentesimo do modelo pai
            if (parteAtualizada.IdModelo) {
                const ModeloService = require('./ModeloService');
                await ModeloService.recalculateTempoCentesimo(parteAtualizada.IdModelo);
            }
            return parteAtualizada;
        }
        return null;
    }

    async deleteParte(id) {
        const parte = await PartePeca.findByPk(id);
        if (parte) {
            const idModeloPai = parte.IdModelo;
            await parte.destroy();
            // Recalcula o tempo centesimal do modelo pai após a deleção
            if (idModeloPai) {
                const ModeloService = require('./ModeloService');
                await ModeloService.recalculateTempoCentesimo(idModeloPai);
            }
            return true;
        }
        return false;
    }
    
    async getAllPartes() {
        return await PartePeca.findAll();
    }
    
    async getParteById(id) {
        return await PartePeca.findByPk(id);
    }

    async recalculateTempoCentesimo(idPartePeca) {
        const partePeca = await PartePeca.findByPk(idPartePeca, {
            include: [{ model: VariacaoPeca }],
        });

        if (partePeca) {
            const tempoTotalVariacoes = partePeca.VariacaoPecas.reduce((acc, variacao) => {
                return acc + (parseFloat(variacao.TempoCentesimo) || 0);
            }, 0);

            await partePeca.update({ TempoCentesimo: tempoTotalVariacoes });

            // Propagar a atualização para o modelo pai
            const ModeloService = require('./ModeloService');
            await ModeloService.recalculateTempoCentesimo(partePeca.IdModelo);
        }
    }
}

module.exports = new PartePecaService();