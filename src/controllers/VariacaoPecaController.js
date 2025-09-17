const VariacaoPecaService = require('../services/VariacaoPecaService');

class VariacaoPecaController {
    async create(req, res) {
        try {
            const payload = {
                Nome: req.body.Nome,
                IdPartePeca: parseInt(req.body.IdPartePeca),
                CriadoPor: req.body.CriadoPor ? parseInt(req.body.CriadoPor) : null,
            };

            const variacao = await VariacaoPecaService.createVariacao(payload);
            res.status(201).json(variacao);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async getAll(req, res) {
        try {
            const variacoes = await VariacaoPecaService.getAllVariacoes();
            res.json(variacoes);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async getById(req, res) {
        try {
            const variacao = await VariacaoPecaService.getVariacaoById(req.params.id);
            if (!variacao) return res.status(404).json({ error: 'Variação não encontrada' });
            res.json(variacao);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async update(req, res) {
        try {
            const payload = {
                Nome: req.body.Nome,
                IdPartePeca: parseInt(req.body.IdPartePeca),
                CriadoPor: req.body.CriadoPor ? parseInt(req.body.CriadoPor) : null,
            };

            const variacao = await VariacaoPecaService.updateVariacao(req.params.id, payload);
            res.json(variacao);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async delete(req, res) {
        try {
            await VariacaoPecaService.deleteVariacao(req.params.id);
            res.status(204).send();
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = new VariacaoPecaController();