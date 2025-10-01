const { pool, sql } = require('../db');

exports.createVariacao = async (req, res) => {
    const { Nome, modeloId, criado_por } = req.body;
    try {
        const ps = await pool;
        const result = await ps.request()
            .input('Nome', sql.VarChar(99), Nome)
            .input('modeloId', sql.Int, modeloId)
            .input('criado_por', sql.Int, criado_por)
            .query('INSERT INTO Variacao (Nome, modeloId, criado_em, criado_por) VALUES (@Nome, @modeloId, GETDATE(), @criado_por); SELECT SCOPE_IDENTITY() AS id');

        res.json({ id: result.recordset[0].id, Nome, modeloId });
    } catch (err) {
        console.error('[ERROR][CREATE] Variacao', err.message);
        res.status(500).json({ error: err.message });
    }
};

exports.updateVariacao = async (req, res) => {
    const { id } = req.params;
    const { Nome, modeloId } = req.body;
    try {
        const ps = await pool;
        await ps.request()
            .input('id', sql.Int, id)
            .input('Nome', sql.VarChar(99), Nome)
            .input('modeloId', sql.Int, modeloId)
            .query('UPDATE Variacao SET Nome=@Nome, modeloId=@modeloId WHERE id=@id');

        res.json({ message: 'Variacao atualizada' });
    } catch (err) {
        console.error('[ERROR][UPDATE] Variacao', err.message);
        res.status(500).json({ error: err.message });
    }
};

exports.getAllVariacoes = async (req, res) => {
    try {
        const ps = await pool;
        const result = await ps.request().query('SELECT * FROM Variacao');
        res.json(result.recordset);
    } catch (err) {
        console.error('[ERROR][GET ALL] Variacao', err.message);
        res.status(500).json({ error: err.message });
    }
};

exports.getVariacaoById = async (req, res) => {
    const { id } = req.params;
    try {
        const ps = await pool;
        const result = await ps.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM Variacao WHERE id=@id');

        if (!result.recordset.length) return res.status(404).json({ message: 'Variacao não encontrada' });
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('[ERROR][GET] Variacao', err.message);
        res.status(500).json({ error: err.message });
    }
};

exports.deleteVariacao = async (req, res) => {
    const { id } = req.params;
    try {
        const ps = await pool;
        await ps.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Variacao WHERE id=@id');

        res.json({ message: 'Variacao deletada' });
    } catch (err) {
        console.error('[ERROR][DELETE] Variacao', err.message);
        res.status(500).json({ error: err.message });
    }
};
