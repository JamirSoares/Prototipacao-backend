// routes/dashboardRoutes.js - Rotas específicas para o Dashboard da Produção
import express from 'express';
import { connectDB } from '../config/db.js';
import mssql from 'mssql';

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
    const { date } = req.query;
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
            AND CAST(rp.criado_em AS DATE) = '${filterDate}'
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
    
    const result = await pool.request().query(query);
    
    console.log('✅ [SELECT] Horários encontrados:', result.recordset.length, 'registros');
    console.log('📊 Resultado:', result.recordset);
    
    res.json(result.recordset);
  } catch (error) {
    console.error('❌ [SELECT] Erro ao buscar horários:', error);
    res.status(500).json({ error: 'Erro ao buscar horários' });
  }
});

/**
 * GET /api/dashboard/registros
 * Busca registros do dashboard com filtros
 */
router.get('/registros', async (req, res) => {
  try {
    const { date } = req.query;
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
      ORDER BY hp.atualizado_em DESC
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
    res.status(500).json({ error: 'Erro ao buscar registros' });
  }
});

/**
 * GET /api/dashboard/referencias
 * Busca todas as referências disponíveis
 */
router.get('/referencias', async (req, res) => {
  try {
    const pool = await connectDB();
    
    const query = `
      SELECT 
        id,
        nome,
        tempoPrevisto,
        tempoRealizado,
        custoFaccao
      FROM IMAGEMUNIFORMES_pBI.dbo.referencia 
      WHERE nome IS NOT NULL 
      ORDER BY nome
    `;
    
    console.log('🔍 [SELECT] Buscando referências disponíveis:');
    console.log('🔧 Query executada:', query);
    
    const result = await pool.request().query(query);
    
    console.log('✅ [SELECT] Referências encontradas:', result.recordset.length, 'registros');
    console.log('📊 Resultado:', result.recordset);
    
    res.json(result.recordset);
  } catch (error) {
    console.error('❌ [SELECT] Erro ao buscar referências:', error);
    res.status(500).json({ error: 'Erro ao buscar referências' });
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
    
    // Gera um novo registro_id
    const maxIdQuery = `
      SELECT ISNULL(MAX(registro_id), 0) + 1 as novo_id 
      FROM IMAGEMUNIFORMES_pBI.dbo.historico_producao
    `;
    
    console.log('🔍 [SELECT] Buscando próximo ID disponível:');
    console.log('🔧 Query executada:', maxIdQuery);
    
    const registroIdResult = await pool.request().query(maxIdQuery);
    const novoRegistroId = registroIdResult.recordset[0].novo_id;
    
    console.log('✅ [SELECT] Próximo ID encontrado:', novoRegistroId);
    
    const insertQuery = `
      INSERT INTO IMAGEMUNIFORMES_pBI.dbo.historico_producao 
      (registro_id, hora, previsto, [real], retrabalho, operacao, referencia, 
       TempoPeca, pessoasCelula, tempoAcabamento, pessoaAcabamento, 
       custoFaccao, tempoPrevisto, tempoRealizado, atualizado_em)
      VALUES (@registro_id, @hora, @previsto, @real, @retrabalho, @operacao, 
              @referencia, @TempoPeca, @pessoasCelula, @tempoAcabamento, 
              @pessoaAcabamento, @custoFaccao, @tempoPrevisto, @tempoRealizado, GETDATE())
    `;
    
    console.log('📝 [INSERT] Inserindo novo registro:');
    console.log('🔧 Query executada:', insertQuery);
    console.log('📊 Parâmetros:', {
      registro_id: novoRegistroId,
      hora,
      previsto,
      real,
      retrabalho,
      referencia,
      tempoPrevisto,
      pessoasCelula,
      custoFaccao,
      tempoRealizado
    });
    
    const result = await pool.request()
      .input('registro_id', mssql.Int, novoRegistroId)
      .input('hora', mssql.DateTime, hora)
      .input('previsto', mssql.Int, previsto)
      .input('real', mssql.Int, real)
      .input('retrabalho', mssql.Int, retrabalho)
      .input('operacao', mssql.NVarChar, 'Produção')
      .input('referencia', mssql.NVarChar, referencia)
      .input('TempoPeca', mssql.Decimal(10, 2), tempoPrevisto)
      .input('pessoasCelula', mssql.Int, pessoasCelula)
      .input('tempoAcabamento', mssql.Decimal(10, 2), 0)
      .input('pessoaAcabamento', mssql.Int, 0)
      .input('custoFaccao', mssql.Decimal(10, 2), custoFaccao)
      .input('tempoPrevisto', mssql.Decimal(10, 2), tempoPrevisto)
      .input('tempoRealizado', mssql.Decimal(10, 2), tempoRealizado)
      .query(insertQuery);

    console.log('✅ [INSERT] Registro criado com sucesso! ID:', novoRegistroId);
    console.log('📊 Resultado da inserção:', result);

    res.json({ 
      success: true, 
      message: 'Registro criado com sucesso!',
      registro_id: novoRegistroId 
    });
  } catch (error) {
    console.error('❌ [INSERT] Erro ao criar registro:', error);
    res.status(500).json({ error: 'Erro ao criar registro' });
  }
});

/**
 * DELETE /api/dashboard/registro/:id
 * Deleta um registro do dashboard
 */
router.delete('/registro/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await connectDB();
    
    const deleteQuery = 'DELETE FROM IMAGEMUNIFORMES_pBI.dbo.historico_producao WHERE historico_id = @id';
    
    console.log('🗑️ [DELETE] Deletando registro:');
    console.log('🆔 ID do registro:', id);
    console.log('🔧 Query executada:', deleteQuery);
    
    const result = await pool.request()
      .input('id', mssql.Int, id)
      .query(deleteQuery);
    
    console.log('✅ [DELETE] Registro deletado com sucesso! ID:', id);
    console.log('📊 Resultado da exclusão:', result);
    
    res.json({ success: true, message: 'Registro deletado com sucesso!' });
  } catch (error) {
    console.error('❌ [DELETE] Erro ao deletar registro:', error);
    res.status(500).json({ error: 'Erro ao deletar registro' });
  }
});

/**
 * GET /api/dashboard/totais
 * Calcula totais do dashboard
 */
router.get('/totais', async (req, res) => {
  try {
    const { date } = req.query;
    const pool = await connectDB();
    
    // Se não foi fornecida uma data, usa a data de hoje
    const filterDate = date || new Date().toISOString().split('T')[0];
    
    // Converte a data para o formato datetime completo (início e fim do dia)
    const startDate = `${filterDate} 00:00:00.000`;
    const endDate = `${filterDate} 23:59:59.999`;
    
    let query = `
      SELECT 
        SUM(previsto) as totalPrevisto,
        SUM([real]) as totalReal,
        SUM(retrabalho) as totalRetrabalho,
        SUM(tempoPrevisto) as totalTempoPrev,
        SUM(tempoRealizado) as totalTempoReal,
        AVG(CASE 
          WHEN tempoPrevisto > 0 AND tempoRealizado > 0 
          THEN (tempoRealizado / tempoPrevisto) * 100 
          ELSE 0 
        END) as produtividadeMedia
      FROM IMAGEMUNIFORMES_pBI.dbo.historico_producao
      WHERE CAST(atualizado_em AS DATE) = '${filterDate}'
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
    res.status(500).json({ error: 'Erro ao calcular totais' });
  }
});

export default router;
