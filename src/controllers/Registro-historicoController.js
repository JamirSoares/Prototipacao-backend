const { historicoService, registroService, horariosService } = require('../services/RegistroHistoricoService');

class HistoricoController {
    async create(req, res) {
        try {
            const payload = {
                registro_id: req.body.registro_id,
                hora: req.body.hora,
                previsto: parseFloat(req.body.previsto) || null,
                real: parseFloat(req.body.real) || null,
                retrabalho: parseFloat(req.body.retrabalho) || null,
                operacao: req.body.operacao,
                atualizado_em: new Date(),
                referencia: req.body.referencia,
                TempoPeca: req.body.TempoPeca,
                pessoasCelula: parseInt(req.body.pessoasCelula) || null,
                tempoAcabamento: req.body.tempoAcabamento,
                pessoaAcabamento: req.body.pessoaAcabamento,
            };
            const historico = await historicoService.createHistorico(payload);
            res.status(201).json(historico);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async getAll(req, res) {
        try {
            const historicos = await historicoService.getAllHistorico();
            res.json(historicos);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async getById(req, res) {
        try {
            const historico = await historicoService.getHistorico(req.params.id);
            if (!historico) return res.status(404).json({ error: 'Histórico não encontrado' });
            res.json(historico);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async update(req, res) {
        try {
            const payload = {
                registro_id: req.body.registro_id,
                hora: req.body.hora,
                previsto: parseFloat(req.body.previsto) || null,
                real: parseFloat(req.body.real) || null,
                retrabalho: parseFloat(req.body.retrabalho) || null,
                operacao: req.body.operacao,
                atualizado_em: new Date(),
                referencia: req.body.referencia,
                TempoPeca: req.body.TempoPeca,
                pessoasCelula: parseInt(req.body.pessoasCelula) || null,
                tempoAcabamento: req.body.tempoAcabamento,
                pessoaAcabamento: req.body.pessoaAcabamento,
            };
            const historico = await historicoService.updateHistorico(req.params.id, payload);
            res.json(historico);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async delete(req, res) {
        try {
            await historicoService.deleteHistorico(req.params.id);
            res.status(204).send();
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

class RegistroController {
    async create(req, res) {
        try {
            const payload = {
                hora: req.body.hora,
                previsto: parseFloat(req.body.previsto) || null,
                real: parseFloat(req.body.real) || null,
                retrabalho: parseFloat(req.body.retrabalho) || null,
                status: req.body.status,
            };
            const registro = await registroService.createRegistro(payload);
            res.status(201).json(registro);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async getAll(req, res) {
        try {
            const registros = await registroService.getAllRegistro();
            res.json(registros);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async getById(req, res) {
        try {
            const registro = await registroService.getRegistro(req.params.id);
            if (!registro) return res.status(404).json({ error: 'Registro não encontrado' });
            res.json(registro);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async update(req, res) {
        try {
            const payload = {
                hora: req.body.hora,
                previsto: parseFloat(req.body.previsto) || null,
                real: parseFloat(req.body.real) || null,
                retrabalho: parseFloat(req.body.retrabalho) || null,
                status: req.body.status,
            };
            const registro = await registroService.updateRegistro(req.params.id, payload);
            res.json(registro);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async delete(req, res) {
        try {
            await registroService.deleteRegistro(req.params.id);
            res.status(204).send();
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

class horariosController {
    async getAll(req, res) {
        try {
            const horarios = await horariosService.getAllHorarios();
            res.json(horarios);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = {
    HistoricoController: new HistoricoController(),
    RegistroController: new RegistroController(),
    horariosController: new horariosController()
};