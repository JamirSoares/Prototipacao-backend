const { pool, sql } = require('../db');

exports.createAtividade = async (req, res) => {
    const { Nome, criado_por } = req.body;
    try {
        const ps = await pool;
        const result = await ps.request()
            .input('Nome', sql.VarChar(99), Nome)
            .input('criado_por', sql.Int, criado_por)
            .query('INSERT INTO Atividade (Nome, criado_em, criado_por) VALUES (@Nome, GETDATE(), @criado_por); SELECT SCOPE_IDENTITY() AS id');

        res.json({ id: result.recordset[0].id, Nome });
    } catch (err) {
        console.error('[ERROR][CREATE] Atividade', err.message);
        res.status(500).json({ error: err.message });
    }
};

exports.updateAtividade = async (req, res) => {
    const { id } = req.params;
    const { Nome } = req.body;
    try {
        const ps = await pool;
        await ps.request()
            .input('id', sql.Int, id)
            .input('Nome', sql.VarChar(99), Nome)
            .query('UPDATE Atividade SET Nome=@Nome WHERE id=@id');

        res.json({ message: 'Atividade atualizada' });
    } catch (err) {
        console.error('[ERROR][UPDATE] Atividade', err.message);
        res.status(500).json({ error: err.message });
    }
};

exports.getAllAtividades = async (req, res) => {
    try {
        const ps = await pool;
        const result = await ps.request().query('SELECT * FROM Atividade');
        res.json(result.recordset);
    } catch (err) {
        console.error('[ERROR][GET ALL] Atividade', err.message);
        res.status(500).json({ error: err.message });
    }
};

exports.getAtividadeById = async (req, res) => {
    const { id } = req.params;
    try {
        const ps = await pool;
        const result = await ps.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM Atividade WHERE id=@id');

        if (result.recordset.length === 0) return res.status(404).json({ message: 'Atividade não encontrada' });
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('[ERROR][GET] Atividade', err.message);
        res.status(500).json({ error: err.message });
    }
};
