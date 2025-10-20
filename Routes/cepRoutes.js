import express from "express";
import { connectDB, mssql } from '../config/db.js';
import fetch from 'node-fetch';

const router = express.Router();

// Token da API CEP Aberto (se necessário)
const CEP_ABERTO_TOKEN = "8700a97d0ba03c75506e1a24e610d50b";

router.get("/:cep", async (req, res) => {
  try {
    const { cep } = req.params;
    
    // Remove caracteres não numéricos do CEP
    const cepLimpo = cep.replace(/\D/g, '');
    
    if (cepLimpo.length !== 8) {
      return res.status(400).json({
        erro: true,
        mensagem: 'CEP deve ter 8 dígitos'
      });
    }

    console.log(`🔍 Buscando CEP: ${cepLimpo}`);

    // Primeira tentativa: Brasil API (mais confiável)
    try {
      const brasilApiUrl = `https://brasilapi.com.br/api/cep/v2/${cepLimpo}`;
      const response = await fetch(brasilApiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        timeout: 10000
      });

      if (response.ok) {
        const dados = await response.json();
        
        if (dados.location && dados.location.coordinates) {
          console.log(`✅ CEP encontrado na Brasil API: ${dados.city}/${dados.state}`);
          
          return res.json({
            erro: false,
            cep: dados.cep,
            logradouro: dados.street || '',
            bairro: dados.neighborhood || '',
            cidade: dados.city || '',
            estado: dados.state || '',
            latitude: dados.location.coordinates.latitude,
            longitude: dados.location.coordinates.longitude,
            altitude: '',
            ddd: '',
            ibge: '',
            fonte: 'Brasil API'
          });
        }
      }
    } catch (error) {
      console.log(`❌ Erro na Brasil API: ${error.message}`);
    }

    // Segunda tentativa: ViaCEP
    try {
      const viaCepUrl = `https://viacep.com.br/ws/${cepLimpo}/json/`;
      const response = await fetch(viaCepUrl, {
        method: 'GET',
        timeout: 10000
      });

      if (response.ok) {
        const dados = await response.json();
        
        if (!dados.erro) {
          console.log(`✅ CEP encontrado no ViaCEP: ${dados.localidade}/${dados.uf}`);
          
          // Tentar obter coordenadas usando Nominatim
          try {
            const enderecoCompleto = `${dados.logradouro}, ${dados.bairro}, ${dados.localidade}, ${dados.uf}`;
            const geocodingUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(enderecoCompleto)}&format=json&limit=1&countrycodes=br`;
            
            const geocodingResponse = await fetch(geocodingUrl, {
              method: 'GET',
              headers: {
                'User-Agent': 'SistemaImagemUniformes/1.0'
              },
              timeout: 10000
            });

            if (geocodingResponse.ok) {
              const geocodingData = await geocodingResponse.json();
              
              if (geocodingData && geocodingData.length > 0) {
                return res.json({
                  erro: false,
                  cep: dados.cep,
                  logradouro: dados.logradouro,
                  bairro: dados.bairro,
                  cidade: dados.localidade,
                  estado: dados.uf,
                  latitude: geocodingData[0].lat,
                  longitude: geocodingData[0].lon,
                  altitude: '',
                  ddd: dados.ddd,
                  ibge: dados.ibge,
                  fonte: 'ViaCEP + Nominatim'
                });
              }
            }
          } catch (geocodingError) {
            console.log(`❌ Erro na geocodificação: ${geocodingError.message}`);
          }

          // Retorna dados sem coordenadas se geocodificação falhar
          return res.json({
            erro: false,
            cep: dados.cep,
            logradouro: dados.logradouro,
            bairro: dados.bairro,
            cidade: dados.localidade,
            estado: dados.uf,
            latitude: '',
            longitude: '',
            altitude: '',
            ddd: dados.ddd,
            ibge: dados.ibge,
            fonte: 'ViaCEP (sem coordenadas)'
          });
        }
      }
    } catch (error) {
      console.log(`❌ Erro no ViaCEP: ${error.message}`);
    }

    // Se todas as APIs falharem
    return res.status(404).json({
      erro: true,
      mensagem: 'CEP não encontrado em nenhuma API'
    });

  } catch (error) {
    console.error('❌ Erro interno na busca de CEP:', error);
    return res.status(500).json({
      erro: true,
      mensagem: `Erro interno: ${error.message}`
    });
  }
});

/**
 * Salva uma consulta de CEP no banco de dados
 * POST /api/cep/consulta
 */
router.post("/consulta", async (req, res) => {
  try {
    const { cep, latitude, longitude, endereco, cidade, estado } = req.body;
    
    if (!cep) {
      return res.status(400).json({
        erro: true,
        mensagem: 'CEP é obrigatório'
      });
    }

    const pool = await connectDB();
    const request = pool.request();

    // Cria tabela de consultas se não existir
    const createTableQuery = `
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='consultas_cep' AND xtype='U')
      CREATE TABLE consultas_cep (
        id INT IDENTITY(1,1) PRIMARY KEY,
        cep VARCHAR(10) NOT NULL,
        latitude FLOAT,
        longitude FLOAT,
        endereco VARCHAR(255),
        cidade VARCHAR(100),
        estado VARCHAR(50),
        data_consulta DATETIME DEFAULT GETDATE()
      )
    `;
    
    await request.query(createTableQuery);

    // Insere a consulta
    request.input('cep', mssql.VarChar, cep);
    request.input('latitude', mssql.Float, latitude);
    request.input('longitude', mssql.Float, longitude);
    request.input('endereco', mssql.VarChar, endereco || '');
    request.input('cidade', mssql.VarChar, cidade || '');
    request.input('estado', mssql.VarChar, estado || '');

    const insertQuery = `
      INSERT INTO consultas_cep (cep, latitude, longitude, endereco, cidade, estado)
      VALUES (@cep, @latitude, @longitude, @endereco, @cidade, @estado)
    `;
    
    await request.query(insertQuery);

    console.log(`✅ Consulta de CEP salva: ${cep}`);

    res.json({
      erro: false,
      mensagem: 'Consulta salva com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao salvar consulta:', error);
    res.status(500).json({
      erro: true,
      mensagem: `Erro ao salvar consulta: ${error.message}`
    });
  }
});

/**
 * Busca todos os CEPs únicos da tabela faccao
 * GET /api/cep/ceps
 */
router.get("/ceps/unicos", async (req, res) => {
  try {
    const pool = await connectDB();
    const request = pool.request();

    const query = `
      SELECT DISTINCT f.cep, COUNT(f.NM_FANTASIA) as total_faccoes
      FROM faccao f 
      WHERE f.cep IS NOT NULL AND f.cep != ''
      GROUP BY f.cep
      ORDER BY f.cep
    `;
    
    const result = await request.query(query);
    
    const ceps = result.recordset.map(row => ({
      cep: row.cep,
      total_faccoes: row.total_faccoes
    }));

    console.log(`📊 CEPs únicos encontrados: ${ceps.length}`);

    res.json({
      erro: false,
      ceps: ceps
    });

  } catch (error) {
    console.error('❌ Erro ao buscar CEPs únicos:', error);
    res.status(500).json({
      erro: true,
      mensagem: `Erro ao buscar CEPs: ${error.message}`
    });
  }
});

/**
 * Health check endpoint
 * GET /api/cep/health
 */
router.get("/health", (req, res) => {
  res.json({
    status: 'ok',
    mensagem: 'API de CEP funcionando corretamente',
    timestamp: new Date().toISOString()
  });
});

export default router;
