const ModeloService = require('../services/ModeloService');
const fs = require('fs');
const path = require('path');

class ModeloController {
    // Criar modelo com upload de imagem
    async create(req, res) {
        try {
            const payload = {
                Nome: req.body.Nome,
                ImagemUrl: req.file ? `/config/assets/imagem/${req.file.filename}` : null,
            };
            const modelo = await ModeloService.createModelo(payload);
            res.status(201).json(modelo);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err.message });
        }
    }

    // Buscar todos os modelos
    async getAll(req, res) {
        try {
            const modelos = await ModeloService.getAllModelos();
            res.json(modelos);
        } catch (err) {
            console.error('Erro ao buscar modelos:', err);
            res.status(500).json({ error: err.message });
        }
    }

    // Buscar modelo por ID
    async getById(req, res) {
        try {
            const modelo = await ModeloService.getModeloById(req.params.id);
            if (!modelo) return res.status(404).json({ error: 'Modelo não encontrado' });
            res.json(modelo);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    // Buscar detalhes completos do modelo
    async getModeloDetails(req, res) {
        try {
            const modelo = await ModeloService.getModeloWithDetails(req.params.id);
            if (!modelo) return res.status(404).json({ error: 'Modelo não encontrado.' });
            res.json(modelo);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    // Atualizar modelo com possível atualização de imagem
    async update(req, res) {
        try {
            const modelo = await ModeloService.getModeloById(req.params.id);
            if (!modelo) return res.status(404).json({ error: 'Modelo não encontrado.' });

            const payload = {
                Nome: req.body.Nome,
                AlteradoPor: parseInt(req.body.AlteradoPor) || null,
            };

            if (req.file) {
                if (modelo.ImagemUrl) {
                    const oldImagePath = path.join(__dirname, '..', modelo.ImagemUrl);
                    if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
                }
                payload.ImagemUrl = `/config/assets/imagem/${req.file.filename}`;
            } else if (req.body.ImagemUrl) {
                payload.ImagemUrl = req.body.ImagemUrl;
            }

            const updatedModelo = await ModeloService.updateModelo(req.params.id, payload);
            res.json(updatedModelo);

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err.message });
        }
    }

    // Excluir modelo e remover imagem do servidor
    async delete(req, res) {
        try {
            const modelo = await ModeloService.getModeloById(req.params.id);
            if (!modelo) return res.status(404).json({ error: 'Modelo não encontrado.' });

            if (modelo.ImagemUrl) {
                const imagePath = path.join(__dirname, '..', modelo.ImagemUrl);
                if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
            }

            await ModeloService.deleteModelo(req.params.id);
            res.status(200).json({ message: 'Modelo excluído com sucesso.' });

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Erro interno ao excluir o modelo.' });
        }
    }
}

module.exports = new ModeloController();