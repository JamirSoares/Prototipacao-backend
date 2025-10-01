const { pool, sql } = require('../db');

exports.createPosicao = async (req, res) => {
    const { Nome, criado_por } = req.body;
    try {
        const ps = await pool;
        const result = await ps.request()
            .input('Nome', sql.VarChar(99), Nome)
            .input('criado_por', sql.Int, criado_por)
            .query('INSERT INTO Posicao (Nome, criado_em, criado_por) VALUES (@Nome, GETDATE(), @criado_por); SELECT SCOPE_IDENTITY() AS id');

        res.json({ id: result.recordset[0].id, Nome });
    } catch (err) {
        console.error('[ERROR][CREATE] Posicao', err.message);
        res.status(500).json({ error: err.message });
    }
};

exports.updatePosicao = async (req, res) => {
    const { id } = req.params;
    const { Nome } = req.body;
    try {
        const ps = await pool;
        await ps.request()
            .input('id', sql.Int, id)
            .input('Nome', sql.VarChar(99), Nome)
            .query('UPDATE Posicao SET Nome=@Nome WHERE id=@id');

        res.json({ message: 'Posicao atualizada' });
    } catch (err) {
        console.error('[ERROR][UPDATE] Posicao', err.message);
        res.status(500).json({ error: err.message });
    }
};

exports.getAllPosicoes = async (req, res) => {
    try {
        const ps = await pool;
        const result = await ps.request().query('SELECT * FROM Posicao');
        res.json(result.recordset);
    } catch (err) {
        console.error('[ERROR][GET ALL] Posicao', err.message);
        res.status(500).json({ error: err.message });
    }
};

exports.getPosicaoById = async (req, res) => {
    const { id } = req.params;
    try {
        const ps = await pool;
        const result = await ps.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM Posicao WHERE id=@id');

        if (result.recordset.length === 0) return res.status(404).json({ message: 'Posicao não encontrada' });
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('[ERROR][GET] Posicao', err.message);
        res.status(500).json({ error: err.message });
    }
};
