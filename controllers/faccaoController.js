import { connectDB } from '../config/db.js';
import mssql from 'mssql';

// Toggle favorito de uma facção
export const toggleFavorite = async (req, res) => {
  try {
    const { id, fav } = req.body;
    
    if (!id) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID da facção é obrigatório' 
      });
    }

    const pool = await connectDB();
    
    // Atualizar o campo fav na tabela faccao
    const result = await pool.request()
      .input('id', id)
      .input('fav', fav)
      .query(`
        UPDATE faccao 
        SET fav = @fav 
        WHERE id = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Facção não encontrada' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Favorito atualizado com sucesso',
      data: { id, fav }
    });

  } catch (error) {
    console.error('Erro ao atualizar favorito:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor',
      error: error.message 
    });
  }
};

// Obter todas as facções com status de favorito
export const getFaccoes = async (req, res) => {
  try {
    const pool = await connectDB();
    
    const result = await pool.request()
      .query(`
        SELECT id, NM_FANTASIA as nome, cep, LATITUDE as latitude, LONGITUDE as longitude, fav
        FROM faccao 
        WHERE LATITUDE IS NOT NULL AND LONGITUDE IS NOT NULL
        ORDER BY fav DESC, NM_FANTASIA ASC
      `);

    res.json({ 
      success: true, 
      data: result.recordset 
    });

  } catch (error) {
    console.error('Erro ao buscar facções:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor',
      error: error.message 
    });
  }
};

// Obter todas as facções para o mapa (formato compatível com o frontend)
export const getFaccoesForMap = async (req, res) => {
  try {
    console.log('🔄 Iniciando busca de facções para o mapa...');
    const pool = await connectDB();
    console.log('✅ Conexão com banco estabelecida');

    const result = await pool.request()
      .query(`
        SELECT
          id,
          NM_FANTASIA as nome,
          cep,
          LATITUDE as latitude,
          LONGITUDE as longitude,
          fav,
          Tipo
        FROM faccao
        WHERE LATITUDE IS NOT NULL
          AND LONGITUDE IS NOT NULL
          AND LATITUDE != ''
          AND LONGITUDE != ''
          AND status = 1
        ORDER BY fav DESC, NM_FANTASIA ASC
      `);

    console.log(`📊 Query executada. Registros encontrados: ${result.recordset.length}`);

    // Formatar os dados para compatibilidade com o frontend
    const formattedData = result.recordset.map(item => ({
      id: item.id,
      nome: item.nome,
      cep: item.cep,
      latitude: parseFloat(item.latitude),
      longitude: parseFloat(item.longitude),
      fav: item.fav === 1 || item.fav === true,
      Tipo: item.Tipo || 'faccao'
    }));

    console.log(`✅ Dados formatados: ${formattedData.length} facções`);
    console.log('📋 Primeiras 3 facções:', formattedData.slice(0, 3).map(f => f.nome));

    res.json({
      success: true,
      data: formattedData,
      total: formattedData.length
    });

  } catch (error) {
    console.error('❌ Erro ao buscar facções para o mapa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Obter apenas facções para o mapa
export const getFaccoesOnly = async (req, res) => {
  try {
    console.log('🔄 Buscando apenas facções para o mapa...');
    const pool = await connectDB();

    const result = await pool.request()
      .query(`
        SELECT
          id,
          NM_FANTASIA as nome,
          cep,
          LATITUDE as latitude,
          LONGITUDE as longitude,
          fav,
          Tipo
        FROM faccao
        WHERE LATITUDE IS NOT NULL
          AND LONGITUDE IS NOT NULL
          AND LATITUDE != ''
          AND LONGITUDE != ''
          AND status = 1
          AND (Tipo = 'faccao' OR Tipo IS NULL)
        ORDER BY fav DESC, NM_FANTASIA ASC
      `);

    const formattedData = result.recordset.map(item => ({
      id: item.id,
      nome: item.nome,
      cep: item.cep,
      latitude: parseFloat(item.latitude),
      longitude: parseFloat(item.longitude),
      fav: item.fav === 1 || item.fav === true,
      Tipo: item.Tipo || 'faccao'
    }));

    console.log(`✅ ${formattedData.length} facções carregadas`);

    res.json({
      success: true,
      data: formattedData,
      total: formattedData.length
    });

  } catch (error) {
    console.error('❌ Erro ao buscar facções:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Obter apenas funcionários para o mapa
export const getFuncionariosOnly = async (req, res) => {
  try {
    console.log('🔄 Buscando apenas funcionários para o mapa...');
    const pool = await connectDB();

    const result = await pool.request()
      .query(`
        SELECT
          id,
          NM_FANTASIA as nome,
          cep,
          LATITUDE as latitude,
          LONGITUDE as longitude,
          fav,
          Tipo
        FROM faccao
        WHERE LATITUDE IS NOT NULL
          AND LONGITUDE IS NOT NULL
          AND LATITUDE != ''
          AND LONGITUDE != ''
          AND status = 1
          AND Tipo = 'funcionario'
        ORDER BY fav DESC, NM_FANTASIA ASC
      `);

    const formattedData = result.recordset.map(item => ({
      id: item.id,
      nome: item.nome,
      cep: item.cep,
      latitude: parseFloat(item.latitude),
      longitude: parseFloat(item.longitude),
      fav: item.fav === 1 || item.fav === true,
      Tipo: item.Tipo
    }));

    console.log(`✅ ${formattedData.length} funcionários carregados`);

    res.json({
      success: true,
      data: formattedData,
      total: formattedData.length
    });

  } catch (error) {
    console.error('❌ Erro ao buscar funcionários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Obter todas as facções para gerenciamento (CRUD)
export const getAllFaccoes = async (req, res) => {
  try {
    console.log('🔄 Buscando todas as facções para gerenciamento...');
    const pool = await connectDB();

    const result = await pool.request()
      .query(`
        SELECT
          id,
          COD_EMPRESAxx,
          RAZAOSOCIAL,
          NM_FANTASIA,
          cep,
          LATITUDE,
          LONGITUDE,
          fav,
          Tipo,
          status
        FROM faccao
        ORDER BY NM_FANTASIA ASC
      `);

    console.log(`📊 ${result.recordset.length} facções encontradas`);

    res.json({
      success: true,
      data: result.recordset,
      total: result.recordset.length
    });

  } catch (error) {
    console.error('❌ Erro ao buscar facções:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Criar nova facção
export const createFaccao = async (req, res) => {
  try {
    const { COD_EMPRESAxx, RAZAOSOCIAL, NM_FANTASIA, cep, LATITUDE, LONGITUDE, Tipo, status } = req.body;
    
    console.log('🔄 Criando nova facção:', { NM_FANTASIA, RAZAOSOCIAL, cep, Tipo, status });
    
    const pool = await connectDB();

    const result = await pool.request()
      .input('COD_EMPRESAxx', mssql.VarChar, COD_EMPRESAxx)
      .input('RAZAOSOCIAL', mssql.VarChar, RAZAOSOCIAL)
      .input('NM_FANTASIA', mssql.VarChar, NM_FANTASIA)
      .input('cep', mssql.Int, cep)
      .input('LATITUDE', mssql.VarChar, LATITUDE)
      .input('LONGITUDE', mssql.VarChar, LONGITUDE)
      .input('Tipo', mssql.VarChar, Tipo)
      .input('status', mssql.Bit, status !== undefined ? status : 1)
      .query(`
        INSERT INTO faccao (COD_EMPRESAxx, RAZAOSOCIAL, NM_FANTASIA, cep, LATITUDE, LONGITUDE, Tipo, status)
        VALUES (@COD_EMPRESAxx, @RAZAOSOCIAL, @NM_FANTASIA, @cep, @LATITUDE, @LONGITUDE, @Tipo, @status)
      `);

    console.log('✅ Facção criada com sucesso');

    res.json({
      success: true,
      message: 'Facção criada com sucesso',
      data: { id: result.recordset }
    });

  } catch (error) {
    console.error('❌ Erro ao criar facção:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Atualizar facção
export const updateFaccao = async (req, res) => {
  try {
    const { id } = req.params;
    const { COD_EMPRESAxx, RAZAOSOCIAL, NM_FANTASIA, cep, LATITUDE, LONGITUDE, Tipo, status } = req.body;
    
    console.log('🔄 Atualizando facção ID:', id);
    
    const pool = await connectDB();

    const result = await pool.request()
      .input('id', mssql.Int, id)
      .input('COD_EMPRESAxx', mssql.VarChar, COD_EMPRESAxx)
      .input('RAZAOSOCIAL', mssql.VarChar, RAZAOSOCIAL)
      .input('NM_FANTASIA', mssql.VarChar, NM_FANTASIA)
      .input('cep', mssql.Int, cep)
      .input('LATITUDE', mssql.VarChar, LATITUDE)
      .input('LONGITUDE', mssql.VarChar, LONGITUDE)
      .input('Tipo', mssql.VarChar, Tipo)
      .input('status', mssql.Bit, status !== undefined ? status : 1)
      .query(`
        UPDATE faccao 
        SET COD_EMPRESAxx = @COD_EMPRESAxx,
            RAZAOSOCIAL = @RAZAOSOCIAL,
            NM_FANTASIA = @NM_FANTASIA,
            cep = @cep,
            LATITUDE = @LATITUDE,
            LONGITUDE = @LONGITUDE,
            Tipo = @Tipo,
            status = @status
        WHERE id = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        success: false,
        message: 'Facção não encontrada'
      });
    }

    console.log('✅ Facção atualizada com sucesso');

    res.json({
      success: true,
      message: 'Facção atualizada com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar facção:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};

// Excluir facção
export const deleteFaccao = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🔄 Excluindo facção ID:', id);
    
    const pool = await connectDB();

    const result = await pool.request()
      .input('id', mssql.Int, id)
      .query('DELETE FROM faccao WHERE id = @id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({
        success: false,
        message: 'Facção não encontrada'
      });
    }

    console.log('✅ Facção excluída com sucesso');

    res.json({
      success: true,
      message: 'Facção excluída com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao excluir facção:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
};
