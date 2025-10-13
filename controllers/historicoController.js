import { sql, poolPromise } from '../config/sql.js';

// ==========================
// HELPERS
// ==========================
function handleError(res, error, message = 'Erro interno no servidor') {
  console.error(error);
  res.status(500).json({ success: false, message, error: error.message });
}

// Função genérica para atualizar qualquer campo do histórico
export const updateCampoHistorico = async (req, res, campo) => {
  const { id } = req.params;
  let valor = req.body[campo];

  try {
    let tipoSql;
    let valorPadrao;

    switch (campo) {
      case 'pessoasCelula':
      case 'pessoaAcabamento':
      case 'tempoAcabamento':
        tipoSql = sql.Int;
        valorPadrao = 0;
        break;
      case 'custoFaccao':
        tipoSql = sql.Float;
        valorPadrao = 0.0;
        break;
      case 'referencia':
      case 'TempoPeca':
      default:
        tipoSql = sql.NVarChar;
        valorPadrao = '';
    }

    if (valor === undefined || valor === null) valor = valorPadrao;

    const pool = await poolPromise;
    await pool
      .request()
      .input('id', sql.Int, id)
      .input(campo, tipoSql, valor)
      .query(`UPDATE historico_producao SET ${campo} = @${campo} WHERE historico_id = @id`);

    res.json({ success: true, message: `Campo ${campo} atualizado com sucesso!` });
  } catch (err) {
    handleError(res, err, `Erro ao atualizar ${campo}`);
  }
};

// ==========================
// CONSULTAS
// ==========================
export const getHistorico = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT r.tempoPrevisto, r.tempoRealizado, registro_producao.hora AS horaV, 
             UPPER(registro_producao.referencia) AS R, registro_producao.*, 
             h.tempoAcabamento, h.TempoPeca, h.pessoaAcabamento, h.pessoasCelula
      FROM registro_producao
      LEFT JOIN historico_producao h ON h.registro_id = registro_producao.id
      LEFT JOIN referencia r ON r.nome = registro_producao.referencia
      WHERE status IS NULL OR status = 'A'
      ORDER BY registro_producao.id
    `);
    res.json(result.recordset);
  } catch (err) {
    handleError(res, err, 'Erro ao consultar registros');
  }
};

export const getReferencias = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT id, nome, tempoPrevisto, tempoRealizado, custoFaccao
      FROM referencia
      ORDER BY id
    `);
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    handleError(res, err, 'Erro ao buscar referências');
  }
};

export const getHorarios = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT index_hora AS id, hora, 0 AS ocupado
      FROM horarios
    `);
    res.json(result.recordset);
  } catch (err) {
    handleError(res, err, 'Erro ao consultar horários');
  }
};

// ==========================
// CRUD REFERENCIA
// ==========================
export const createReferencia = async (req, res) => {
  try {
    const { nome, tempoPrevisto, tempoRealizado, custoFaccao } = req.body;
    if (!nome) return res.status(400).json({ success: false, message: "O campo 'nome' é obrigatório." });

    const pool = await poolPromise;
    await pool
      .request()
      .input('nome', sql.NVarChar, nome)
      .input('tempoPrevisto', sql.Float, tempoPrevisto ?? null)
      .input('tempoRealizado', sql.Float, tempoRealizado ?? null)
      .input('custoFaccao', sql.Float, custoFaccao ?? null)
      .query(`INSERT INTO referencia (nome, tempoPrevisto, tempoRealizado, custoFaccao)
              VALUES (UPPER(@nome), @tempoPrevisto, @tempoRealizado, @custoFaccao)`);

    res.json({ success: true, message: 'Referência criada com sucesso!' });
  } catch (err) {
    handleError(res, err, 'Erro ao criar referência');
  }
};

export const updateReferencia = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, tempoPrevisto, tempoRealizado, custoFaccao } = req.body;

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .input('nome', sql.NVarChar, nome ?? null)
      .input('tempoPrevisto', sql.Float, tempoPrevisto ?? null)
      .input('tempoRealizado', sql.Float, tempoRealizado ?? null)
      .input('custoFaccao', sql.Float, custoFaccao ?? null)
      .query(`UPDATE referencia
              SET nome = UPPER(@nome),
                  tempoPrevisto = @tempoPrevisto,
                  tempoRealizado = @tempoRealizado,
                  custoFaccao = @custoFaccao
              WHERE id = @id`);

    if (result.rowsAffected[0] === 0)
      return res.status(404).json({ success: false, message: 'Referência não encontrada.' });

    res.json({ success: true, message: 'Referência atualizada com sucesso!' });
  } catch (err) {
    handleError(res, err, 'Erro ao atualizar referência');
  }
};

export const deleteReferencia = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;
    const result = await pool.request().input('id', sql.Int, id)
      .query(`DELETE FROM referencia WHERE id = @id`);

    if (result.rowsAffected[0] === 0)
      return res.status(404).json({ success: false, message: 'Referência não encontrada.' });

    res.json({ success: true, message: 'Referência deletada com sucesso!' });
  } catch (err) {
    handleError(res, err, 'Erro ao deletar referência');
  }
};

// ==========================
// DELETAR REGISTROS/HISTÓRICO
// ==========================
export const deleteRegistro = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;
    await pool.request().input('id', sql.Int, id)
      .query(`DELETE FROM registro_producao WHERE id = @id`);

    res.json({ success: true, message: 'Registro deletado com sucesso!' });
  } catch (err) {
    handleError(res, err, 'Erro ao deletar registro');
  }
};

export const deleteHistorico = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;
    await pool.request().input('historico_id', sql.Int, id)
      .query(`UPDATE historico_producao SET operacao = 'D' WHERE historico_id = @historico_id`);

    res.json({ success: true, message: 'Histórico marcado como deletado' });
  } catch (err) {
    handleError(res, err, 'Erro ao deletar histórico');
  }
};

// ==========================
// INSERIR NOVO REGISTRO E HISTÓRICO
// ==========================
export const createRegistro = async (req, res) => {
  const { hora, previsto, real, retrabalho, custoFaccao, referencia } = req.body;
  if (!hora || previsto === undefined || real === undefined || retrabalho === undefined) {
    return res.status(400).json({ message: 'Campos hora, previsto, real e retrabalho são obrigatórios.' });
  }

  try {
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input('hora', sql.NVarChar, hora)
      .input('previsto', sql.Int, previsto)
      .input('real', sql.Int, real)
      .input('retrabalho', sql.Int, retrabalho)
      .input('referencia', sql.NVarChar, referencia)
      .input('custoFaccao', sql.Float, custoFaccao)
      .query(`INSERT INTO registro_producao (hora, previsto, real, retrabalho, custoFaccao, referencia)
              VALUES (@hora, @previsto, @real, @retrabalho, @custoFaccao, @referencia);
              SELECT SCOPE_IDENTITY() AS id;`);

    const novoId = result.recordset[0].id;

    await pool
      .request()
      .input('registro_id', sql.Int, novoId)
      .input('hora', sql.NVarChar, hora)
      .input('previsto', sql.Int, previsto)
      .input('real', sql.Int, real)
      .input('retrabalho', sql.Int, retrabalho)
      .input('referencia', sql.NVarChar, referencia)
      .input('custoFaccao', sql.Float, custoFaccao)
      .input('operacao', sql.NVarChar, 'I')
      .query(`INSERT INTO historico_producao (registro_id, hora, previsto, real, retrabalho, referencia, atualizado_em, custoFaccao, operacao)
              VALUES (@registro_id, @hora, @previsto, @real, @retrabalho, @referencia, GETDATE(), @custoFaccao, @operacao);`);

    res.json({ success: true, message: 'Registro inserido com sucesso!' });
  } catch (err) {
    handleError(res, err, 'Erro ao inserir histórico');
  }
};
