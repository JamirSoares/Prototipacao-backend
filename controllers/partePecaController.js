const { pool, sql } = require('../db');

exports.createPartePeca = async (req, res) => {
    const { Nome, modeloId, criado_por } = req.body;
    try {
        const ps = await pool;
        const result = await ps.request()
            .input('Nome', sql.VarChar(99), Nome)
            .input('modeloId', sql.Int, modeloId)
            .input('criado_por', sql.Int, criado_por)
            .query('INSERT INTO PartePeca (Nome, modeloId, criado_em, criado_por) VALUES (@Nome, @modeloId, GETDATE(), @criado_por); SELECT SCOPE_IDENTITY() AS id');

        res.json({ id: result.recordset[0].id, Nome, modeloId });
    } catch (err) {
        console.error('[ERROR][CREATE] PartePeca', err.message);
        res.status(500).json({ error: err.message });
    }
};

exports.updatePartePeca = async (req, res) => {
    const { id } = req.params;
    const { Nome, modeloId } = req.body;
    try {
        const ps = await pool;
        await ps.request()
            .input('id', sql.Int, id)
            .input('Nome', sql.VarChar(99), Nome)
            .input('modeloId', sql.Int, modeloId)
            .query('UPDATE PartePeca SET Nome=@Nome, modeloId=@modeloId WHERE id=@id');

        res.json({ message: 'PartePeca atualizada' });
    } catch (err) {
        console.error('[ERROR][UPDATE] PartePeca', err.message);
        res.status(500).json({ error: err.message });
    }
};

exports.getAllPartePeca = async (req, res) => {
    try {
        const ps = await pool;
        const result = await ps.request().query('SELECT * FROM PartePeca');
        res.json(result.recordset);
    } catch (err) {
        console.error('[ERROR][GET ALL] PartePeca', err.message);
        res.status(500).json({ error: err.message });
    }
};

exports.getPartePecaById = async (req, res) => {
    const { id } = req.params;
    try {
        const ps = await pool;
        const result = await ps.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM PartePeca WHERE id=@id');

        if (!result.recordset.length) return res.status(404).json({ message: 'PartePeca não encontrada' });
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('[ERROR][GET] PartePeca', err.message);
        res.status(500).json({ error: err.message });
    }
};
