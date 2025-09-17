const ProcessoProdutoService = require('../services/ProcessoProdutoService');

class ProcessoProdutoController {
    async create(req, res) {
        try {
            console.log('Dados recebidos do formulário:', req.body);
            
            const idModeloValue = parseInt(req.body.IdModelo, 10);
            const idModelo = isNaN(idModeloValue) ? null : idModeloValue;
            console.log(idModelo);
            console.log(idModeloValue);
            console.log(req.body.IdModelo);
            if (idModelo === null) {
                return res.status(400).json({ error: 'O ID do Modelo é obrigatório e deve ser um número válido.' });
            }

            const payload = {
                Referencia: req.body.Referencia || null,
                Tecido: req.body.Tecido || null,
                IdModelo: idModelo,
                CriadoPor: req.body.CriadoPor ? parseInt(req.body.CriadoPor) : null,
                CriadoEm: new Date(),
                AlteradoEm: new Date()
            };

            const processo = await ProcessoProdutoService.createProcesso(payload);
            res.status(201).json(processo);
        } catch (err) {
            console.error('Erro no controlador ao criar processo:', err);
            res.status(500).json({ error: err.message });
        }
    }

    async getAll(req, res) {
        try {
            const processos = await ProcessoProdutoService.getAllProcessos();
            res.json(processos);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async getById(req, res) {
        try {
            const processo = await ProcessoProdutoService.getProcessoById(req.params.id);
            if (!processo) return res.status(404).json({ error: 'Processo não encontrado' });
            res.json(processo);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async update(req, res) {
        try {
            const payload = {
                Referencia: req.body.Referencia || null,
                Tecido: req.body.Tecido || null,
                IdModelo: (req.body.IdModelo !== null && req.body.IdModelo !== '') ? parseInt(req.body.IdModelo) : null,
                CriadoPor: req.body.CriadoPor ? parseInt(req.body.CriadoPor) : null,
                AlteradoPor: req.body.AlteradoPor ? parseInt(req.body.AlteradoPor) : null,
                AlteradoEm: new Date()
            };

            const processo = await ProcessoProdutoService.updateProcesso(req.params.id, payload);
            res.json(processo);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async delete(req, res) {
        try {
            await ProcessoProdutoService.deleteProcesso(req.params.id);
            res.status(204).end();
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = new ProcessoProdutoController();