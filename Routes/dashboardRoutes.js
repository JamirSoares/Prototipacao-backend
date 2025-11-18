// routes/dashboardRoutes.js - Rotas específicas para o Dashboard da Produção
import express from 'express';
import {
  connectDB
} from '../config/db.js';
import mssql from 'mssql';
import cache from '../utils/cache.js';

// Edit password (move to env in production)
const EDIT_PASSWORD = process.env.IMAGE_EDIT_PASSWORD || 'ImagemProd001!@';

const router = express.Router();

// ==========================================================
// ROTAS DO DASHBOARD DA PRODUÇÃO
// ==========================================================

/**
 * GET /api/dashboard/horarios
 * Busca todos os horários disponíveis
 */
router.get('/horarios', async (req, res) => {
  try {
    const {
      date
    } = req.query;
    const pool = await connectDB();

    // Se não foi fornecida uma data, usa a data de hoje
    const filterDate = date || new Date().toISOString().split('T')[0];

    // Converte a data para o formato datetime completo (início e fim do dia)
    const startDate = `${filterDate} 00:00:00.000`;
    const endDate = `${filterDate} 23:59:59.999`;

    const query = `
      SELECT DISTINCT 
        h.hora,
        CASE 
          WHEN EXISTS (
            SELECT 1 FROM IMAGEMUNIFORMES_pBI.dbo.registro_producao rp 
            WHERE rp.hora = h.hora 
            AND CAST(rp.criado_em AS DATE) = '${filterDate}' and status <> 'I'
          ) THEN 1 
          ELSE 0 
        END as ocupado
      FROM IMAGEMUNIFORMES_pBI.dbo.horarios h
      ORDER BY h.hora
    `;

    console.log('🔍 [SELECT] Buscando horários disponíveis:');
    console.log('📅 Data filtrada:', filterDate);
    console.log('📅 Período:', startDate, 'até', endDate);
    console.log('🔧 Query executada:', query);

    const cacheKey = `horarios_${filterDate}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log('♻️ [CACHE] Retornando horários do cache');
      return res.json(cached);
    }

    const result = await pool.request().query(query);

    console.log('✅ [SELECT] Horários encontrados:', result.recordset.length, 'registros');
    console.log('📊 Resultado:', result.recordset);

    cache.set(cacheKey, result.recordset, 2 * 60 * 1000); // 2 minutos
    res.json(result.recordset);
  } catch (error) {
    console.error('❌ [SELECT] Erro ao buscar horários:', error);
    res.status(500).json({
      error: 'Erro ao buscar horários'
    });
  }
});

// ===================== REGISTROS =====================
router.get('/registros', async (req, res) => {
  try {
    const {
      date
    } = req.query;
    const pool = await connectDB();

    // Se não foi fornecida uma data, usa a data de hoje
    const filterDate = date || new Date().toISOString().split('T')[0];

    // Converte a data para o formato datetime completo (início e fim do dia)
    const startDate = `${filterDate} 00:00:00.000`;
    const endDate = `${filterDate} 23:59:59.999`;

    let query = `
      SELECT 
        hp.historico_id,
        hp.registro_id,
        hp.hora,
        hp.previsto,
        hp.[real],
        hp.retrabalho,
        hp.operacao,
        hp.referencia,
        hp.TempoPeca,
        hp.pessoasCelula,
        hp.tempoAcabamento,
        hp.pessoaAcabamento,
        hp.custoFaccao,
        hp.tempoPrevisto,
        hp.tempoRealizado,
        hp.atualizado_em
      FROM IMAGEMUNIFORMES_pBI.dbo.historico_producao hp
      INNER JOIN REGISTRO_PRODUCAO rp ON rp.id = hp.registro_id
      WHERE CAST(RP.criado_em AS DATE) = '${filterDate}'
      ORDER BY hp.hora ASC
    `;

    console.log('🔍 [SELECT] Buscando registros do dashboard:');
    console.log('📅 Data filtrada:', filterDate);
    console.log('📅 Período:', startDate, 'até', endDate);
    console.log('🔧 Query executada:', query);

    const result = await pool.request().query(query);

    console.log('✅ [SELECT] Registros encontrados:', result.recordset.length, 'registros');
    console.log('📊 Resultado:', result.recordset);

    res.json(result.recordset);
  } catch (error) {
    console.error('❌ [SELECT] Erro ao buscar registros:', error);
    res.status(500).json({
      error: 'Erro ao buscar registros'
    });
  }
});

router.post('/referencias', async (req, res) => {
  try {
    const {
      nome,
      custoFaccao,
      tempoPrevisto,
      tempoRealizado
    } = req.body;
    const pool = await connectDB();
    const query = `
      insert into referencia (custoFaccao, nome, tempoPrevisto, tempoRealizado)
      values (@custoFaccao, @nome, @tempoPrevisto, @tempoRealizado)
    `;

    console.log('📝 [INSERT] Inserindo nova referência:');
    console.log('🔧 Query executada:', query);
    console.log('📊 Parâmetros:', {
      custoFaccao,
      nome,
      tempoPrevisto,
      tempoRealizado
    });

    await pool.request()
      .input('custoFaccao', mssql.Decimal(18, 2), custoFaccao)
      .input('nome', mssql.NVarChar(255), nome)
      .input('tempoPrevisto', mssql.Int, tempoPrevisto)
      .input('tempoRealizado', mssql.Int, tempoRealizado)
      .query(query);

    console.log('✅ [INSERT] Nova referência criada com sucesso');
    res.status(201).json({
      message: 'Nova referência criada com sucesso'
    });
  } catch (error) {
    console.error('❌ [INSERT] Erro ao criar referência:', error);
    res.status(500).json({
      error: 'Erro ao criar referência'
    });
  }
});

// ===================== TOTAIS =====================
router.get('/totais', async (req, res) => {
  try {
    const {
      date
    } = req.query;
    const pool = await connectDB();

    // Se não foi fornecida uma data, usa a data de hoje
    const filterDate = date || new Date().toISOString().split('T')[0];

    // Converte a data para o formato datetime completo (início e fim do dia)
    const startDate = `${filterDate} 00:00:00.000`;
    const endDate = `${filterDate} 23:59:59.999`;

    let query = `
      SELECT 
        SUM(RP.previsto) as totalPrevisto,
        SUM(RP.[real]) as totalReal,
        SUM(RP.retrabalho) as totalRetrabalho,
        SUM(tempoPrevisto) as totalTempoPrev,
        SUM(tempoRealizado) as totalTempoReal,
        AVG(CASE 
          WHEN tempoPrevisto > 0 AND tempoRealizado > 0 
          THEN (tempoRealizado / tempoPrevisto) * 100 
          ELSE 0 
        END) as produtividadeMedia
      FROM IMAGEMUNIFORMES_pBI.dbo.REGISTRO_PRODUCAO RP
      INNER JOIN HISTORICO_PRODUCAO HP ON HP.registro_id = RP.ID
      WHERE CAST(RP.criado_em AS DATE) = '${filterDate}' AND STATUS <> 'I'
    `;

    console.log('🔍 [SELECT] Calculando totais do dashboard:');
    console.log('📅 Data filtrada:', filterDate);
    console.log('📅 Período:', startDate, 'até', endDate);
    console.log('🔧 Query executada:', query);

    const result = await pool.request().query(query);

    console.log('✅ [SELECT] Totais calculados com sucesso!');
    console.log('📊 Resultado:', result.recordset[0]);

    res.json(result.recordset[0]);
  } catch (error) {
    console.error('❌ [SELECT] Erro ao calcular totais:', error);
    res.status(500).json({
      error: 'Erro ao calcular totais'
    });
  }
});

// ===================== REFERENCIAS =====================
router.get('/referencias', async (req, res) => {
  try {
    const pool = await connectDB();
    const filterDate = req.query.date || new Date().toISOString().split('T')[0];
    // Calcula intervalo de 3 dias (data selecionada e 2 anteriores)
    const endDate = filterDate;
    const startDate = new Date(filterDate);
    startDate.setDate(startDate.getDate() - 2);
    const startDateStr = startDate.toISOString().split('T')[0];
    const query = `
      SELECT DISTINCT r.id, r.nome, r.tempoPrevisto, r.tempoRealizado, r.custoFaccao
      FROM IMAGEMUNIFORMES_pBI.dbo.referencia r
      INNER JOIN IMAGEMUNIFORMES_pBI.dbo.registro_producao rp ON rp.referencia = r.nome
      WHERE CAST(rp.criado_em AS DATE) BETWEEN '${startDateStr}' AND '${endDate}'
      ORDER BY r.nome
    `;

    console.log('🔍 [SELECT] Buscando referências dos últimos 3 dias:');
    console.log('🔧 Query executada:', query);

    const result = await pool.request().query(query);

    console.log('✅ [SELECT] Referências encontradas:', result.recordset.length, 'registros');
    console.log('📊 Resultado:', result.recordset);

    res.json(result.recordset);
  } catch (error) {
    console.error('❌ [SELECT] Erro ao buscar referências:', error);
    res.status(500).json({
      error: 'Erro ao buscar referências'
    });
  }
});

/**
 * POST /api/dashboard/registro
 * Cria um novo registro no dashboard
 */
router.post('/registro', async (req, res) => {
  try {
    const {
      hora,
      referencia,
      tempoPrevisto,
      tempoRealizado,
      custoFaccao,
      previsto,
      real,
      retrabalho,
      pessoasCelula
    } = req.body;

    console.log('📝 [INSERT] Criando novo registro:');
    console.log('📊 Dados recebidos:', req.body);

    const pool = await connectDB();

    const insertQuery = `
DECLARE @novoId INT;

INSERT INTO IMAGEMUNIFORMES_pBI.dbo.registro_producao
(hora, previsto, [real], retrabalho, criado_em, status, referencia, custoFaccao)
VALUES (@hora, @previsto, @real, @retrabalho, GETDATE(), 'A', @referencia, @custoFaccao);

SET @novoId = SCOPE_IDENTITY();

-- Inserir no historico como inclusão (I)
INSERT INTO IMAGEMUNIFORMES_pBI.dbo.historico_producao
(registro_id, hora, previsto, [real], retrabalho, operacao, referencia, TempoPeca, pessoasCelula, tempoAcabamento, pessoaAcabamento, custoFaccao, tempoPrevisto, tempoRealizado, atualizado_em)
VALUES (@novoId, @hora, @previsto, @real, @retrabalho, 'I', @referencia, @TempoPeca, @pessoasCelula, @tempoAcabamento, @pessoaAcabamento, @custoFaccao, @tempoPrevisto, @tempoRealizado, GETDATE());

-- Inserir referencia se não existir
IF NOT EXISTS (SELECT 1 FROM IMAGEMUNIFORMES_pBI.dbo.referencia WHERE nome = @referencia)
BEGIN
  INSERT INTO IMAGEMUNIFORMES_pBI.dbo.referencia (custoFaccao, tempoRealizado, tempoPrevisto, nome, [data])
  VALUES (@custoFaccao, @tempoRealizado, @tempoPrevisto, @referencia, GETDATE());
END

SELECT @novoId as novoRegistroId;
    `;

    console.log('📝 [INSERT] Inserindo novo registro (registro_producao + historico + referencia se necessário):');
    console.log('🔧 Query executada:', insertQuery);
    console.log('📊 Parâmetros:', { hora, previsto, real, retrabalho, referencia, tempoPrevisto, custoFaccao, tempoRealizado });

    const result = await pool.request()
      .input('hora', mssql.NVarChar(20), hora)
      .input('previsto', mssql.Float, previsto)
      .input('real', mssql.Float, real)
      .input('retrabalho', mssql.Float, retrabalho)
      .input('referencia', mssql.NVarChar(99), referencia)
      .input('TempoPeca', mssql.Decimal(10, 2), tempoPrevisto || null)
      .input('pessoasCelula', mssql.Int, pessoasCelula || null)
      .input('tempoAcabamento', mssql.Decimal(10, 2), 0)
      .input('pessoaAcabamento', mssql.Int, 0)
      .input('custoFaccao', mssql.Float, custoFaccao || null)
      .input('tempoPrevisto', mssql.NVarChar(99), tempoPrevisto !== undefined && tempoPrevisto !== null ? String(tempoPrevisto) : null)
      .input('tempoRealizado', mssql.NVarChar(99), tempoRealizado !== undefined && tempoRealizado !== null ? String(tempoRealizado) : null)
      .query(insertQuery);

    const novoRegistroId = result.recordset && result.recordset[0] ? result.recordset[0].novoRegistroId : null;

    console.log('✅ [INSERT] Registro criado com sucesso! ID:', novoRegistroId);
    console.log('📊 Resultado da inserção:', result);

    res.json({
      success: true,
      message: 'Registro criado com sucesso!',
      registro_id: novoRegistroId
    });
  } catch (error) {
    console.error('❌ [INSERT] Erro ao criar registro:', error);
    res.status(500).json({
      error: 'Erro ao criar registro'
    });
  }
});

// ===================== BATCH =====================
router.post('/registro/batch', async (req, res) => {
  const { operations } = req.body;
  const batchPassword = req.body.password || null;
  if (!Array.isArray(operations) || operations.length === 0) {
    return res.status(400).json({ error: 'Nenhuma operação fornecida' });
  }

  const pool = await connectDB();
  const transaction = new mssql.Transaction(pool);
  try {
    await transaction.begin();
    const tr = transaction.request();

    for (let i = 0; i < operations.length; i++) {
      const op = operations[i];
      // Ignora deletes de registros temporários
      if (op.type === 'delete' && typeof op.data.id === 'string' && op.data.id.startsWith('temp_')) {
        continue;
      }
      // Validação de id para update/delete
      if ((op.type === 'update' || op.type === 'delete')) {
        const { id } = op.data;
        if (id === undefined || id === null || isNaN(Number(id))) {
          throw new Error(`ID inválido na operação batch. Valor recebido: ${id}`);
        }
      }
      if (op.type === 'insert') {
        // use same insertQuery as single insert
        const { hora, referencia, tempoPrevisto, tempoRealizado, custoFaccao, previsto, real, retrabalho, pessoasCelula } = op.data;
        const insertQuery = `
DECLARE @novoId INT;
INSERT INTO IMAGEMUNIFORMES_pBI.dbo.registro_producao
(hora, previsto, [real], retrabalho, criado_em, status, referencia, custoFaccao)
VALUES (@hora, @previsto, @real, @retrabalho, GETDATE(), 'A', @referencia, @custoFaccao);
SET @novoId = SCOPE_IDENTITY();
INSERT INTO IMAGEMUNIFORMES_pBI.dbo.historico_producao
(registro_id, hora, previsto, [real], retrabalho, operacao, referencia, TempoPeca, pessoasCelula, tempoAcabamento, pessoaAcabamento, custoFaccao, tempoPrevisto, tempoRealizado, atualizado_em)
VALUES (@novoId, @hora, @previsto, @real, @retrabalho, 'I', @referencia, @TempoPeca, @pessoasCelula, 0, 0, @custoFaccao, @tempoPrevisto, @tempoRealizado, GETDATE());
IF NOT EXISTS (SELECT 1 FROM IMAGEMUNIFORMES_pBI.dbo.referencia WHERE nome = @referencia)
BEGIN
  INSERT INTO IMAGEMUNIFORMES_pBI.dbo.referencia (custoFaccao, tempoRealizado, tempoPrevisto, nome, [data])
  VALUES (@custoFaccao, @tempoRealizado, @tempoPrevisto, @referencia, GETDATE());
END
        `;
        await tr
          .input('hora', mssql.NVarChar(20), hora)
          .input('previsto', mssql.Float, previsto)
          .input('real', mssql.Float, real)
          .input('retrabalho', mssql.Float, retrabalho)
          .input('referencia', mssql.NVarChar(99), referencia)
          .input('TempoPeca', mssql.Decimal(10, 2), tempoPrevisto || null)
          .input('pessoasCelula', mssql.Int, pessoasCelula || null)
          .input('custoFaccao', mssql.Float, custoFaccao || null)
          .input('tempoPrevisto', mssql.NVarChar(99), tempoPrevisto !== undefined && tempoPrevisto !== null ? String(tempoPrevisto) : null)
          .input('tempoRealizado', mssql.NVarChar(99), tempoRealizado !== undefined && tempoRealizado !== null ? String(tempoRealizado) : null)
          .query(insertQuery);
      } else if (op.type === 'update') {
        // validate edit password: either per-op or batch-level
        const providedPwd = op.password || batchPassword;
        if (!providedPwd || providedPwd !== EDIT_PASSWORD) {
          const err = new Error('Senha de edição inválida para operação de update');
          err.status = 401;
          throw err;
        }
        const { id, fields } = op.data;
        let updateFields = [];
        if (fields.previsto !== undefined) updateFields.push('previsto = @previsto');
        if (fields.real !== undefined) updateFields.push('[real] = @real');
        if (fields.retrabalho !== undefined) updateFields.push('retrabalho = @retrabalho');
        if (fields.pessoasCelula !== undefined) updateFields.push('pessoasCelula = @pessoasCelula');
        if (updateFields.length === 0) continue;
        const updateQuery = `UPDATE IMAGEMUNIFORMES_pBI.dbo.registro_producao SET ${updateFields.join(', ')} WHERE id = @id`;
        const q = tr.input('id', mssql.Int, id);
        if (fields.previsto !== undefined) q.input('previsto', mssql.Float, fields.previsto);
        if (fields.real !== undefined) q.input('real', mssql.Float, fields.real);
        if (fields.retrabalho !== undefined) q.input('retrabalho', mssql.Float, fields.retrabalho);
        if (fields.pessoasCelula !== undefined) q.input('pessoasCelula', mssql.Int, fields.pessoasCelula);
        await q.query(updateQuery);

        // insert history
        const selectRes = await tr.input('id', mssql.Int, id).query('SELECT hora, previsto, [real], retrabalho, referencia, TempoPeca, pessoasCelula, custoFaccao FROM IMAGEMUNIFORMES_pBI.dbo.registro_producao WHERE id = @id');
        const current = selectRes.recordset[0] || {};
        const insertHist = `INSERT INTO IMAGEMUNIFORMES_pBI.dbo.historico_producao (registro_id, hora, previsto, [real], retrabalho, operacao, referencia, TempoPeca, pessoasCelula, custoFaccao, atualizado_em) VALUES (@id, @hora, @previsto, @real, @retrabalho, 'U', @referencia, @TempoPeca, @pessoasCelula, @custoFaccao, GETDATE())`;
        await tr
          .input('hora', mssql.NVarChar(20), current.hora || null)
          .input('previsto', mssql.Float, current.previsto || null)
          .input('real', mssql.Float, current.real || null)
          .input('retrabalho', mssql.Float, current.retrabalho || null)
          .input('referencia', mssql.NVarChar(99), current.referencia || null)
          .input('TempoPeca', mssql.Decimal(10,2), current.TempoPeca || null)
          .input('pessoasCelula', mssql.Int, current.pessoasCelula || null)
          .input('custoFaccao', mssql.Float, current.custoFaccao || null)
          .query(insertHist);
      } else if (op.type === 'delete') {
        const { id } = op.data;
        await tr.input('id', mssql.Int, id).query("UPDATE IMAGEMUNIFORMES_pBI.dbo.registro_producao SET status = 'I' WHERE id = @id");
        const selectRes = await tr.input('id', mssql.Int, id).query('SELECT hora, previsto, [real], retrabalho, referencia, TempoPeca, pessoasCelula, custoFaccao FROM IMAGEMUNIFORMES_pBI.dbo.registro_producao WHERE id = @id');
        const current = selectRes.recordset[0] || {};
        const insertHist = `INSERT INTO IMAGEMUNIFORMES_pBI.dbo.historico_producao (registro_id, hora, previsto, [real], retrabalho, operacao, referencia, TempoPeca, pessoasCelula, custoFaccao, atualizado_em) VALUES (@id, @hora, @previsto, @real, @retrabalho, 'D', @referencia, @TempoPeca, @pessoasCelula, @custoFaccao, GETDATE())`;
        await tr
          .input('hora', mssql.NVarChar(20), current.hora || null)
          .input('previsto', mssql.Float, current.previsto || null)
          .input('real', mssql.Float, current.real || null)
          .input('retrabalho', mssql.Float, current.retrabalho || null)
          .input('referencia', mssql.NVarChar(99), current.referencia || null)
          .input('TempoPeca', mssql.Decimal(10,2), current.TempoPeca || null)
          .input('pessoasCelula', mssql.Int, current.pessoasCelula || null)
          .input('custoFaccao', mssql.Float, current.custoFaccao || null)
          .query(insertHist);
      }
    }

    await transaction.commit();
    res.json({ success: true, message: 'Operações em lote executadas com sucesso' });
  } catch (err) {
    console.error('❌ [BATCH] Erro ao executar operações em lote:', err);
    try { await transaction.rollback(); } catch (e) { console.error('Erro ao dar rollback', e); }
    const statusCode = err && err.status ? err.status : 500;
    res.status(statusCode).json({ error: err && err.message ? err.message : 'Erro ao executar operações em lote', details: err && err.stack ? err.stack : undefined });
  }
});

/**
 * DELETE /api/dashboard/registro/:id
 * Deleta um registro do dashboard
 */
router.delete('/registro/:id', async (req, res) => {
  try {
    let { id } = req.params;
    const pool = await connectDB();
    console.log('🗑️ [DELETE] Solicitado delete para ID:', id);

    // First, try to delete assuming id is registro_producao.id
    let deleteResult = await pool.request()
      .input('id', mssql.Int, id)
      .query('DELETE FROM IMAGEMUNIFORMES_pBI.dbo.registro_producao WHERE id = @id');

    let rowsAffected = deleteResult.rowsAffected && deleteResult.rowsAffected[0] ? deleteResult.rowsAffected[0] : 0;
    if (rowsAffected > 0) {
      console.log('✅ [DELETE] Registro removido de registro_producao. ID:', id);
      return res.json({ success: true, message: 'Registro removido com sucesso.', deletedId: id });
    }

    // If nothing was deleted, maybe the provided id is a historico_id. Try to find registro_id.
    console.log('⚠️ [DELETE] Nenhum registro_producao com esse ID. Tentando interpretar como historico_id...');
    const histRes = await pool.request()
      .input('hid', mssql.Int, id)
      .query('SELECT TOP 1 registro_id FROM IMAGEMUNIFORMES_pBI.dbo.historico_producao WHERE historico_id = @hid');

    const histRow = histRes.recordset[0];
    if (!histRow || !histRow.registro_id) {
      console.warn('⚠️ [DELETE] Nenhum registro encontrado nem historico correspondente para ID:', id);
      return res.status(404).json({ success: false, message: 'Registro não encontrado' });
    }

    const registroId = histRow.registro_id;
    console.log('ℹ️ [DELETE] Encontrado registro_id via historico_producao:', registroId, '(a partir do historico_id:', id, ')');

    // Attempt to delete using the registro_id
    deleteResult = await pool.request()
      .input('id', mssql.Int, registroId)
      .query('DELETE FROM IMAGEMUNIFORMES_pBI.dbo.registro_producao WHERE id = @id');

    rowsAffected = deleteResult.rowsAffected && deleteResult.rowsAffected[0] ? deleteResult.rowsAffected[0] : 0;
    if (rowsAffected === 0) {
      console.warn('⚠️ [DELETE] Não foi possível deletar registro_producao para registro_id:', registroId);
      return res.status(404).json({ success: false, message: 'Registro não encontrado' });
    }

    console.log('✅ [DELETE] Registro removido de registro_producao. registro_id:', registroId, ' (origem historico_id:', id, ')');
    return res.json({ success: true, message: 'Registro removido com sucesso.', deletedId: registroId, sourceHistoricoId: id });
  } catch (error) {
    console.error('❌ [DELETE] Erro ao deletar registro:', error);
    // If there is a foreign key constraint preventing deletion, return a specific code
    if (error && error.number === 547) {
      return res.status(409).json({ success: false, error: 'Registro referenciado em histórico. Não foi possível deletar.' });
    }
    return res.status(500).json({ success: false, error: 'Erro ao deletar registro' });
  }
});

/**
 * POST /api/dashboard/registro/:id/sofDelete
 * Realiza soft delete (marca como inativo) de um registro
 */
router.post('/registro/:id/sofDelete', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await connectDB();
    console.log('🔄 [SOFT DELETE] Marcando registro_producao como inativo e inserindo historico:');
    console.log('🆔 ID do registro:', id);

    // Marca como inativo
    const updateResult = await pool.request()
      .input('id', mssql.Int, id)
      .query("UPDATE IMAGEMUNIFORMES_pBI.dbo.registro_producao SET status = 'I' WHERE id = @id");

    // Busca os valores atuais para inserir no historico
    const selectRes = await pool.request()
      .input('id', mssql.Int, id)
      .query('SELECT hora, previsto, [real], retrabalho, referencia, custoFaccao FROM IMAGEMUNIFORMES_pBI.dbo.registro_producao WHERE id = @id');

    const current = selectRes.recordset[0];
    
    if (!current) {
      return res.status(404).json({ error: 'Registro não encontrado' });
    }

    const insertHist = `
      INSERT INTO IMAGEMUNIFORMES_pBI.dbo.historico_producao
      (registro_id, hora, previsto, [real], retrabalho, operacao, referencia, custoFaccao, atualizado_em)
      VALUES (@id, @hora, @previsto, @real, @retrabalho, 'D', @referencia, @custoFaccao, GETDATE())
    `;

    const histRes = await pool.request()
      .input('id', mssql.Int, id)
      .input('hora', mssql.NVarChar(20), current.hora || null)
      .input('previsto', mssql.Float, current.previsto || null)
      .input('real', mssql.Float, current.real || null)
      .input('retrabalho', mssql.Float, current.retrabalho || null)
      .input('referencia', mssql.NVarChar(99), current.referencia || null)
      .input('custoFaccao', mssql.Float, current.custoFaccao || null)
      .query(insertHist);

    console.log('✅ [SOFT DELETE] Registro em registro_producao marcado como inativo e histórico inserido. ID:', id);

    res.json({ success: true, message: 'Registro marcado como inativo e histórico criado.' });
  } catch (error) {
    console.error('❌ [SOFT DELETE] Erro ao marcar registro como inativo:', error);
    res.status(500).json({
      error: 'Erro ao marcar registro como inativo'
    });
  }
});

/**
 * POST /api/dashboard/registro/:id/update
 * Atualiza campos específicos de um registro
 */
router.post('/registro/:id/update', async (req, res) => {
  try {
    const { id } = req.params;
    const { previsto, real, retrabalho, password } = req.body;
    // Validate password
    if (password !== EDIT_PASSWORD) {
      console.warn('⚠️ [UPDATE] Senha de edição inválida para ID:', id);
      return res.status(401).json({ error: 'Senha de edição inválida' });
    }
    const pool = await connectDB();
    // Atualiza apenas a tabela registro_producao e insere um novo historico com operacao 'U'
    let updateFields = [];
    if (previsto !== undefined) updateFields.push('previsto = @previsto');
    if (real !== undefined) updateFields.push('[real] = @real');
    if (retrabalho !== undefined) updateFields.push('retrabalho = @retrabalho');

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar foi fornecido' });
    }

    const updateQuery = `UPDATE IMAGEMUNIFORMES_pBI.dbo.registro_producao SET ${updateFields.join(', ')} WHERE id = @id`;

    console.log('✏️ [UPDATE] Atualizando registro_producao:');
    console.log('🆔 ID do registro:', id);
    console.log('📝 Campos a atualizar:', { previsto, real, retrabalho });
    console.log('🔧 Query executada:', updateQuery);

    const request = pool.request().input('id', mssql.Int, id);
    if (previsto !== undefined) request.input('previsto', mssql.Float, previsto);
    if (real !== undefined) request.input('real', mssql.Float, real);
    if (retrabalho !== undefined) request.input('retrabalho', mssql.Float, retrabalho);

    const updateResult = await request.query(updateQuery);

    // Busca o registro atualizado para inserir no historico
    const selectRes = await pool.request().input('id', mssql.Int, id).query('SELECT hora, previsto, [real], retrabalho, referencia, custoFaccao FROM IMAGEMUNIFORMES_pBI.dbo.registro_producao WHERE id = @id');
    const current = selectRes.recordset[0];
    
    if (!current) {
      return res.status(404).json({ error: 'Registro não encontrado' });
    }

    const insertHist = `
      INSERT INTO IMAGEMUNIFORMES_pBI.dbo.historico_producao
      (registro_id, hora, previsto, [real], retrabalho, operacao, referencia, custoFaccao, atualizado_em)
      VALUES (@id, @hora, @previsto, @real, @retrabalho, 'U', @referencia, @custoFaccao, GETDATE())
    `;

    const histRes = await pool.request()
      .input('id', mssql.Int, id)
      .input('hora', mssql.NVarChar(20), current.hora || null)
      .input('previsto', mssql.Float, current.previsto || null)
      .input('real', mssql.Float, current.real || null)
      .input('retrabalho', mssql.Float, current.retrabalho || null)
      .input('referencia', mssql.NVarChar(99), current.referencia || null)
      .input('custoFaccao', mssql.Float, current.custoFaccao || null)
      .query(insertHist);

    console.log('✅ [UPDATE] Registro atualizado e histórico inserido com sucesso! ID:', id);

    res.json({ success: true, message: 'Registro atualizado com sucesso!' });
  } catch (error) {
    console.error('❌ [UPDATE] Erro ao atualizar registro:', error);
    res.status(500).json({
      error: 'Erro ao atualizar registro'
    });
  }
});

export default router;