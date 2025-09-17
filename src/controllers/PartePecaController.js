const PartePecaService = require('../services/PartePecaService');

class PartePecaController {
    async create(req, res) {
        try {
            const payload = {
                Nome: req.body.Nome,
                IdModelo: parseInt(req.body.IdModelo),
                CriadoPor: req.body.CriadoPor ? parseInt(req.body.CriadoPor) : null,
            };

            const parte = await PartePecaService.createParte(payload);
            res.status(201).json(parte);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async getAll(req, res) {
        try {
            const partes = await PartePecaService.getAllPartes();
            res.json(partes);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async getById(req, res) {
        try {
            const parte = await PartePecaService.getParteById(req.params.id);
            if (!parte) return res.status(404).json({ error: 'Parte não encontrada' });
            res.json(parte);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async update(req, res) {
        try {
            const payload = {
                Nome: req.body.Nome,
                IdModelo: parseInt(req.body.IdModelo),
                CriadoPor: req.body.CriadoPor ? parseInt(req.body.CriadoPor) : null,
            };

            const parte = await PartePecaService.updateParte(req.params.id, payload);
            res.json(parte);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async delete(req, res) {
        try {
            await PartePecaService.deleteParte(req.params.id);
            res.status(204).send();
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = new PartePecaController();