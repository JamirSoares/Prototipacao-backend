// src/controllers/RelatorioComprasController.js
import service from '../services/relatorioComprasService.js';

// ------------------------
// GET ALL
// ------------------------
export async function getAll(req, res) {
    try {
        const filters = req.query;
        const data = await service.getAll(filters);
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar dados.', details: err.message });
    }
}

// ------------------------
// GET FILTER OPTIONS
// ------------------------
export async function getFilterOptions(req, res) {
    try {
        const filters = req.query;
        const options = await service.getFilterOptions(filters);
        res.json(options);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar opções de filtro.', details: err.message });
    }
}

// ------------------------
// GET BY ID
// ------------------------
export async function getById(req, res) {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });
        const data = await service.getById(id);
        res.json(data || {});
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar registro.', details: err.message });
    }
}

// ------------------------
// UPDATE BY ID
// ------------------------
export async function updateById(req, res) {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });
        const updated = await service.updateById(id, req.body);
        if (updated === 0) return res.status(404).json({ message: 'Registro não encontrado.' });
        res.json({ updated, id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao atualizar registro.', details: err.message });
    }
}

// ------------------------
// INSERT MANY
// ------------------------
export async function insertBulk(req, res) {
    try {
        const rows = req.body;
        if (!Array.isArray(rows) || rows.length === 0) {
            return res.status(400).json({ error: 'Array de objetos vazio.' });
        }
        const result = await service.insertMany(rows);
        res.status(201).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao inserir registros.', details: err.message });
    }
}

// ------------------------
// GENERATE DATA
// ------------------------
export async function generateData(req, res) {
    try {
        const result = await service.generateData();
        res.json({ success: true, message: "Dados gerados com sucesso", result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao gerar dados.', details: err.message });
    }
}

// ------------------------
// EXPORT DEFAULT
// ------------------------
export default {
    getAll,
    getFilterOptions,
    getById,
    updateById,
    insertBulk,
    generateData
};
