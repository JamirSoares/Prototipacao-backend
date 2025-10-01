const { pool, sql } = require('../db');

exports.createModelo = async (req, res) => {
    const { Nome, processoId, criado_por } = req.body;
    try {
        const ps = await pool;
        const result = await ps.request()
            .input('Nome', sql.VarChar(99), Nome)
            .input('processoId', sql.Int, processoId)
            .input('criado_por', sql.Int, criado_por)
            .query('INSERT INTO Modelo (Nome, processoId, criado_em, criado_por) VALUES (@Nome, @processoId, GETDATE(), @criado_por); SELECT SCOPE_IDENTITY() AS id');

        res.json({ id: result.recordset[0].id, Nome, processoId });
    } catch (err) {
        console.error('[ERROR][CREATE] Modelo', err.message);
        res.status(500).json({ error: err.message });
    }
};

exports.updateModelo = async (req, res) => {
    const { id } = req.params;
    const { Nome, processoId } = req.body;
    try {
        const ps = await pool;
        await ps.request()
            .input('id', sql.Int, id)
            .input('Nome', sql.VarChar(99), Nome)
            .input('processoId', sql.Int, processoId)
            .query('UPDATE Modelo SET Nome=@Nome, processoId=@processoId WHERE id=@id');

        res.json({ message: 'Modelo atualizado' });
    } catch (err) {
        console.error('[ERROR][UPDATE] Modelo', err.message);
        res.status(500).json({ error: err.message });
    }
};

exports.getAllModelos = async (req, res) => {
    try {
        const ps = await pool;
        const result = await ps.request().query('SELECT * FROM Modelo');
        res.json(result.recordset);
    } catch (err) {
        console.error('[ERROR][GET ALL] Modelo', err.message);
        res.status(500).json({ error: err.message });
    }
};

exports.getModeloById = async (req, res) => {
    const { id } = req.params;
    try {
        const ps = await pool;
        const result = await ps.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM Modelo WHERE id=@id');

        if (!result.recordset.length) return res.status(404).json({ message: 'Modelo não encontrado' });
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('[ERROR][GET] Modelo', err.message);
        res.status(500).json({ error: err.message });
    }
};
