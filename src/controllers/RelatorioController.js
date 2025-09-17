const { Modelo, ProcessoProduto, PartePeca, VariacaoPeca, AtividadeProcesso } = require('../models');

class RelatorioController {

    // Buscar relatório completo de um modelo específico
    async getRelatorioPorModelo(req, res) {
        const { id } = req.params;

        try {
            // Busca o modelo com todas as associações corretas
            const modelo = await Modelo.findByPk(id, {
                include: [
                    {
                        model: ProcessoProduto,
                        as: 'ProcessoProdutos' // deve bater com o alias definido na associação
                    },
                    {
                        model: PartePeca,
                        as: 'PartePecas', // associações diretas do modelo
                        include: [
                            {
                                model: VariacaoPeca,
                                as: 'VariacaoPecas',
                                include: [
                                    {
                                        model: AtividadeProcesso,
                                        as: 'AtividadeProcessos'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });

            if (!modelo) {
                return res.status(404).json({ error: 'Modelo não encontrado.' });
            }
            var imagem = modelo.ImagemUrl.replace('..//', '').replace('/config', 'src/config')
            // Monta o retorno do relatório
            const report = {
                Modelo: {
                    Id: modelo.id,
                    Nome: modelo.Nome,
                    TempoCentesimo: modelo.TempoCentesimo,
                    ImagemUrl: modelo.ImagemUrl
                        ? `http://localhost:15995/${imagem}`
                        : null,
                    ProcessoProdutos: modelo.ProcessoProdutos,
                    PartePecas: modelo.PartePecas
                }
            };

            res.json(report);
        } catch (err) {
            console.error('Erro ao gerar relatório:', err);
            res.status(500).json({ error: 'Erro interno ao gerar relatório.' });
        }
    }
}

module.exports = new RelatorioController();
