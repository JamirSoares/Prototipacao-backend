const { AtividadeProcesso, VariacaoPeca, PartePeca, Modelo, ProcessoProduto } = require('../models');

class AtividadeProcessoService {
    // Função utilitária para calcular o tempo centesimal
    calcularTempoCentesimal(tempoRelogio) {
        if (!tempoRelogio) return 0;

        // TempoRelogio é armazenado como um DECIMAL(10,2), onde a parte inteira é o minuto e a decimal é o segundo.
        const minutos = Math.floor(tempoRelogio);
        const segundos = (tempoRelogio - minutos) * 100;
        
        return minutos + (segundos / 60);
    }

    // Função para atualizar a hierarquia de forma ascendente
    async updateParentTempo(idVariacao) {
        // Recalcular a variação pai
        const variacao = await VariacaoPeca.findByPk(idVariacao, {
            include: [{
                model: AtividadeProcesso,
            }]
        });

        if (variacao) {
            const tempoTotalAtividades = variacao.AtividadeProcessos.reduce((acc, atividade) => {
                return acc + (parseFloat(atividade.TempoCentesimo) || 0);
            }, 0);

            await variacao.update({ TempoCentesimo: tempoTotalAtividades });

            // Recalcular a peça pai
            const partePeca = await PartePeca.findByPk(variacao.IdPartePeca, {
                include: [{
                    model: VariacaoPeca,
                }]
            });
            
            if (partePeca) {
                const tempoTotalVariacoes = (await partePeca.getVariacaoPecas()).reduce((acc, variacao) => {
                    return acc + (parseFloat(variacao.TempoCentesimo) || 0);
                }, 0);

                await partePeca.update({ TempoCentesimo: tempoTotalVariacoes });

                // Recalcular o modelo pai
                const modelo = await Modelo.findByPk(partePeca.IdModelo, {
                    include: [{
                        model: PartePeca,
                    }]
                });

                if (modelo) {
                    const tempoTotalPecas = (await modelo.getPartePecas()).reduce((acc, parte) => {
                        return acc + (parseFloat(parte.TempoCentesimo) || 0);
                    }, 0);
                    await modelo.update({ TempoCentesimo: tempoTotalPecas });
                    
                    // Recalcular o processo pai
                    const processo = await ProcessoProduto.findOne({ where: { IdModelo: modelo.Id } });
                    if (processo) {
                        await processo.update({ TempoCentesimo: tempoTotalPecas });
                    }
                }
            }
        }
    }

    async createAtividade(data) {
        if (data.TempoRelogio) {
            data.TempoCentesimo = this.calcularTempoCentesimal(data.TempoRelogio);
        }
        
        const novaAtividade = await AtividadeProcesso.create(data);
        await this.updateParentTempo(novaAtividade.IdVariacao);
        return novaAtividade;
    }

    async updateAtividade(id, data) {
        const atividade = await AtividadeProcesso.findByPk(id);
        if (atividade) {
            const oldIdVariacao = atividade.IdVariacao;
            
            if (data.TempoRelogio) {
                data.TempoCentesimo = this.calcularTempoCentesimal(data.TempoRelogio);
            }
            
            const atividadeAtualizada = await atividade.update(data);
            
            // Se a variação pai mudou, recalcule ambas
            if (data.IdVariacao && data.IdVariacao !== oldIdVariacao) {
                await this.updateParentTempo(oldIdVariacao);
            }
            await this.updateParentTempo(atividadeAtualizada.IdVariacao);
            return atividadeAtualizada;
        }
        return null;
    }

    async deleteAtividade(id) {
        const atividade = await AtividadeProcesso.findByPk(id);
        if (atividade) {
            const idVariacaoPai = atividade.IdVariacao;
            await atividade.destroy();
            await this.updateParentTempo(idVariacaoPai);
            return true;
        }
        return false;
    }

    // Funções existentes que não precisam ser alteradas
    async getAllAtividades() {
        return await AtividadeProcesso.findAll();
    }
    
    async getAtividadeById(id) {
        return await AtividadeProcesso.findByPk(id);
    }
}

module.exports = new AtividadeProcessoService();