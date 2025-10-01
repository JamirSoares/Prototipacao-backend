const { pool, sql } = require('../db');

exports.createProcesso = async (req, res) => {
    const { codigo, criado_por } = req.body;
    try {
        const ps = await pool;
        const result = await ps.request()
            .input('codigo', sql.VarChar(99), Nome)
            .input('criado_por', sql.Int, criado_por)
            .query('INSERT INTO ProcessoReferenciaTP (codigo, criado_em, criado_por) VALUES (@codigo, GETDATE(), @criado_por); SELECT SCOPE_IDENTITY() AS id');

        res.json({ id: result.recordset[0].id, codigo });
    } catch (err) {
        console.error('[ERROR][CREATE] Processo', err.message);
        res.status(500).json({ error: err.message });
    }
};

exports.updateProcesso = async (req, res) => {
    const { id } = req.params;
    const { Nome } = req.body;
    try {
        const ps = await pool;
        await ps.request()
            .input('id', sql.Int, id)
            .input('Nome', sql.VarChar(99), Nome)
            .query('UPDATE ProcessoReferenciaTP SET Nome=@Nome WHERE id=@id');

        res.json({ message: 'ProcessoReferenciaTP atualizado' });
    } catch (err) {
        console.error('[ERROR][UPDATE] Processo', err.message);
        res.status(500).json({ error: err.message });
    }
};

exports.getAllProcessos = async (req, res) => {
    try {
        const ps = await pool;
        const result = await ps.request().query('SELECT * FROM ProcessoReferenciaTP');
        res.json(result.recordset);
    } catch (err) {
        console.error('[ERROR][GET ALL] ProcessoReferenciaTP', err.message);
        res.status(500).json({ error: err.message });
    }
};

exports.getProcessoById = async (req, res) => {
    const { id } = req.params;
    try {
        const ps = await pool;
        const result = await ps.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM ProcessoReferenciaTP WHERE id=@id');

        if (!result.recordset.length) return res.status(404).json({ message: 'Processo não encontrado' });
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('[ERROR][GET] Processo', err.message);
        res.status(500).json({ error: err.message });
    }
};
