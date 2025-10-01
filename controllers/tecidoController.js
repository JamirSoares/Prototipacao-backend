const { pool, sql } = require('../db');

exports.createTecido = async (req, res) => {
    const { Nome, criado_por } = req.body;
    try {
        const ps = await pool;
        const result = await ps.request()
            .input('Nome', sql.VarChar(99), Nome)
            .input('criado_por', sql.Int, criado_por)
            .query('INSERT INTO Tecido (Nome, criado_em, criado_por) VALUES (@Nome, GETDATE(), @criado_por); SELECT SCOPE_IDENTITY() AS id');

        res.json({ id: result.recordset[0].id, Nome });
    } catch (err) {
        console.error('[ERROR][CREATE] Tecido', err.message);
        res.status(500).json({ error: err.message });
    }
};

exports.updateTecido = async (req, res) => {
    const { id } = req.params;
    const { Nome } = req.body;
    try {
        const ps = await pool;
        await ps.request()
            .input('id', sql.Int, id)
            .input('Nome', sql.VarChar(99), Nome)
            .query('UPDATE Tecido SET Nome=@Nome WHERE id=@id');

        res.json({ message: 'Tecido atualizado' });
    } catch (err) {
        console.error('[ERROR][UPDATE] Tecido', err.message);
        res.status(500).json({ error: err.message });
    }
};

exports.getAllTecidos = async (req, res) => {
    try {
        const ps = await pool;
        const result = await ps.request().query('SELECT * FROM Tecido');
        res.json(result.recordset);
    } catch (err) {
        console.error('[ERROR][GET ALL] Tecido', err.message);
        res.status(500).json({ error: err.message });
    }
};

exports.getTecidoById = async (req, res) => {
    const { id } = req.params;
    try {
        const ps = await pool;
        const result = await ps.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM Tecido WHERE id=@id');

        if (result.recordset.length === 0) return res.status(404).json({ message: 'Tecido não encontrado' });
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('[ERROR][GET] Tecido', err.message);
        res.status(500).json({ error: err.message });
    }
};
