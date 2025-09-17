const AtividadeProcessoService = require('../services/AtividadeProcessoService');

class AtividadeProcessoController {
    async create(req, res) {
        try {
            console.log('Dados recebidos no backend:', req.body);
            
            const payload = {
                IdVariacao: parseInt(req.body.IdVariacao),
                Operacao: req.body.Operacao ? parseInt(req.body.Operacao) : null,
                Atividade: req.body.Atividade || null,
                Maquina: req.body.Maquina || null,
                TempoRelogio: req.body.TempoRelogio ? parseFloat(req.body.TempoRelogio) : null,
                ColaboradorCronometrado: req.body.ColaboradorCronometrado || null,
                Tamanho: req.body.Tamanho || null,
                CriadoPor: req.body.CriadoPor ? parseInt(req.body.CriadoPor) : null,
            };

            console.log('Payload a ser enviado para o service:', payload);

            const atividade = await AtividadeProcessoService.createAtividade(payload);
            res.status(201).json(atividade);
        } catch (err) {
            console.error('Erro no controlador ao criar atividade:', err);
            res.status(500).json({ error: err.message });
        }
    }

    async getAll(req, res) {
        try {
            const atividades = await AtividadeProcessoService.getAllAtividades();
            res.json(atividades);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async getById(req, res) {
        try {
            const atividade = await AtividadeProcessoService.getAtividadeById(req.params.id);
            if (!atividade) return res.status(404).json({ error: 'Atividade não encontrada' });
            res.json(atividade);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async update(req, res) {
        try {
            const payload = {
                IdVariacao: parseInt(req.body.IdVariacao),
                Operacao: req.body.Operacao ? parseInt(req.body.Operacao) : null,
                Atividade: req.body.Atividade || null,
                Maquina: req.body.Maquina || null,
                TempoRelogio: req.body.TempoRelogio ? parseFloat(req.body.TempoRelogio) : null,
                ColaboradorCronometrado: req.body.ColaboradorCronometrado || null,
                Tamanho: req.body.Tamanho || null,
                CriadoPor: req.body.CriadoPor ? parseInt(req.body.CriadoPor) : null,
            };

            const atividade = await AtividadeProcessoService.updateAtividade(req.params.id, payload);
            res.json(atividade);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async delete(req, res) {
        try {
            await AtividadeProcessoService.deleteAtividade(req.params.id);
            res.status(204).send();
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = new AtividadeProcessoController();