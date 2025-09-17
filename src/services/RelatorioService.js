const ProcessoProduto = require('../models/ProcessoProduto');
const Modelo = require('../models/Modelo');
const PartePeca = require('../models/PartePeca');
const VariacaoPeca = require('../models/VariacaoPeca');
const AtividadeProcesso = require('../models/AtividadeProcesso');

class RelatorioService {
    async getRelatorioCompletoByModeloId(modeloId) {
        try {
            const processo = await ProcessoProduto.findOne({
                where: { IdModelo: modeloId },
                include: [
                    {
                        model: Modelo,
                        include: [
                            {
                                model: PartePeca,
                                include: [
                                    {
                                        model: VariacaoPeca,
                                        include: [
                                            {
                                                model: AtividadeProcesso
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });

            return processo;
        } catch (err) {
            console.error('Erro ao buscar relatório completo:', err);
            throw new Error('Erro ao buscar dados do relatório.');
        }
    }
}

module.exports = new RelatorioService();