import express from 'express';
import { connectDB, mssql } from '../config/db.js';
import fetch from 'node-fetch';

const router = express.Router();

// Função para limpar CEP
const cleanCEP = (cep) => {
  return cep.toString().replace(/\D/g, '');
};

// Função para formatar CEP
const formatCEP = (cep) => {
  const cleaned = cleanCEP(cep);
  if (cleaned.length === 8) {
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
  }
  return cleaned;
};

// Função para buscar coordenadas usando API da PBH
const buscarCoordenadasPBH = async (cep, maxRetries = 3) => {
  const cleaned = cleanCEP(cep);
  
  if (cleaned.length !== 8) {
    throw new Error('CEP deve ter 8 dígitos');
  }

  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`🔍 Tentativa ${i + 1}/${maxRetries} - Buscando CEP na API PBH: ${cleaned}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout
      
      const response = await fetch(`https://geocoder.pbh.gov.br/geocoder/v2/address?cep=${cleaned}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.endereco && data.endereco.length > 0) {
        const endereco = data.endereco[0];
        const wkt = endereco.wkt;
        
        // Extrair coordenadas do WKT: "POINT(x y)"
        const match = wkt.match(/POINT\(([\d.]+)\s+([\d.]+)\)/);
        if (match) {
          const [x, y] = match.slice(1).map(parseFloat);
          
          // Converter coordenadas UTM para lat/lng (aproximação)
          // Para BH, usar conversão aproximada
          const lat = -19.9167 + (y - 7800000) / 111000;
          const lng = -43.9345 + (x - 600000) / 111000;
          
          // Montar endereço completo usando logradouro
          const enderecoCompleto = `${endereco.tipologradouro} ${endereco.nomelogradouro}${endereco.numero ? ', ' + endereco.numero : ''}, ${endereco.bairropopular} - ${endereco.nomeregional}`;
          
          console.log(`✅ CEP encontrado na API PBH: ${enderecoCompleto}`);
          console.log(`📍 Coordenadas UTM: ${x}, ${y}`);
          console.log(`📍 Coordenadas convertidas: ${lat}, ${lng}`);
          console.log(`🏠 Logradouro: ${endereco.tipologradouro} ${endereco.nomelogradouro}`);
          console.log(`🏘️ Bairro: ${endereco.bairropopular}`);
          console.log(`🏙️ Regional: ${endereco.nomeregional}`);
          
          return {
            erro: false,
            cep: cleaned,
            endereco: enderecoCompleto,
            logradouro: `${endereco.tipologradouro} ${endereco.nomelogradouro}`,
            bairro: endereco.bairropopular,
            regional: endereco.nomeregional,
            numero: endereco.numero,
            coordenadas: {
              lat: lat,
              lng: lng
            }
          };
        } else {
          throw new Error('Formato WKT inválido');
        }
      } else {
        throw new Error('Endereço não encontrado na resposta da API');
      }
      
    } catch (error) {
      console.error(`❌ Tentativa ${i + 1}/${maxRetries} falhou: ${error.message}`);
      
      if (i === maxRetries - 1) {
        throw new Error(`CEP não encontrado após ${maxRetries} tentativas: ${error.message}`);
      }
      
      // Aguardar antes de tentar novamente
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

// GET - Buscar todas as facções com coordenadas
router.get("/", async (req, res) => {
  try {
    const pool = await connectDB();
    const request = pool.request();
    
            const result = await request.query(`
              SELECT DISTINCT TOP 4
                COD_EMPRESAxx,
                RAZAOSOCIAL,
                NM_FANTASIA,
                CEP
              FROM faccao 
              WHERE NM_FANTASIA LIKE '%fac%'
              ORDER BY RAZAOSOCIAL
            `);

    console.log(`📊 Retornando ${result.recordset.length} facções com consulta específica`);
    
    // Processar os dados para o frontend - LIMITAR para 5 facções para teste
    const faccoes = [];
    const faccoesParaProcessar = result.recordset.slice(0, 5); // Limitar a 5 facções
    
    console.log(`📊 Processando apenas ${faccoesParaProcessar.length} facções para teste`);
    
    for (const faccao of faccoesParaProcessar) {
      try {
        console.log(`🔍 Buscando coordenadas para ${faccao.NM_FANTASIA} - CEP: ${faccao.CEP}`);
        
        const coordenadasInfo = await buscarCoordenadasPBH(faccao.CEP.toString());
        
        faccoes.push({
          id: `temp_${faccoes.length}_${Date.now()}`,
          codigo: faccao.COD_EMPRESAxx,
          razaoSocial: faccao.RAZAOSOCIAL,
          nomeFantasia: faccao.NM_FANTASIA,
          cep: faccao.CEP.toString(),
          cepFormatado: formatCEP(faccao.CEP.toString()),
          cepLimpo: cleanCEP(faccao.CEP.toString()),
          coordenadas: coordenadasInfo.coordenadas,
          endereco: coordenadasInfo.endereco,
          logradouro: coordenadasInfo.logradouro,
          bairro: coordenadasInfo.bairro,
          regional: coordenadasInfo.regional,
          numero: coordenadasInfo.numero
        });
        
        console.log(`✅ Coordenadas encontradas para ${faccao.NM_FANTASIA}:`, coordenadasInfo.coordenadas);
        
      } catch (error) {
        console.error(`❌ Erro ao buscar coordenadas para ${faccao.NM_FANTASIA}:`, error.message);
        
        // Adicionar facção sem coordenadas
        faccoes.push({
          id: `temp_${faccoes.length}_${Date.now()}`,
          codigo: faccao.COD_EMPRESAxx,
          razaoSocial: faccao.RAZAOSOCIAL,
          nomeFantasia: faccao.NM_FANTASIA,
          cep: faccao.CEP.toString(),
          cepFormatado: formatCEP(faccao.CEP.toString()),
          cepLimpo: cleanCEP(faccao.CEP.toString()),
          coordenadas: null,
          endereco: null
        });
      }
    }
    
    console.log(`✅ Dados retornados: ${faccoes.length} facções (com coordenadas da API PBH)`);

    res.json({
      success: true,
      data: faccoes,
      total: faccoes.length
    });

  } catch (error) {
    console.error("Erro ao buscar facções:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: error.message
    });
  }
});

// GET - Buscar facção por ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await connectDB();
    const request = pool.request();
    
    const result = await request.query(`
      SELECT
        id,
        COD_EMPRESAxx,
        RAZAOSOCIAL,
        NM_FANTASIA,
        CEP,
        LATITUDE,
        LONGITUDE
      FROM faccao
      WHERE id = @id
      AND LATITUDE IS NOT NULL 
      AND LONGITUDE IS NOT NULL
      AND LATITUDE != ''
      AND LONGITUDE != ''
    `);
    
    request.input('id', id);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Facção não encontrada"
      });
    }

    const faccao = result.recordset[0];
    const faccaoProcessada = {
      id: faccao.id,
      codigo: faccao.COD_EMPRESAxx,
      razaoSocial: faccao.RAZAOSOCIAL,
      nomeFantasia: faccao.NM_FANTASIA,
      cep: faccao.CEP.toString(),
      cepFormatado: formatCEP(faccao.CEP.toString()),
      cepLimpo: cleanCEP(faccao.CEP.toString()),
      coordenadas: {
        lat: parseFloat(faccao.LATITUDE),
        lng: parseFloat(faccao.LONGITUDE)
      }
    };

    res.json({
      success: true,
      data: faccaoProcessada
    });

  } catch (error) {
    console.error("Erro ao buscar facção:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: error.message
    });
  }
});

// POST - Cadastrar nova facção
router.post("/", async (req, res) => {
  try {
    const { codigo, razaoSocial, nomeFantasia, cep, latitude, longitude } = req.body;

    // Validações
    if (!codigo || !razaoSocial || !nomeFantasia || !cep) {
      return res.status(400).json({
        success: false,
        message: "Campos obrigatórios: codigo, razaoSocial, nomeFantasia, cep"
      });
    }

    const pool = await connectDB();
    const request = pool.request();
    
    const cepLimpo = cleanCEP(cep);
    
    request.input('codigo', codigo);
    request.input('razaoSocial', razaoSocial);
    request.input('nomeFantasia', nomeFantasia);
    request.input('cep', parseInt(cepLimpo));
    request.input('latitude', latitude || null);
    request.input('longitude', longitude || null);

    const result = await request.query(`
      INSERT INTO faccao (COD_EMPRESAxx, RAZAOSOCIAL, NM_FANTASIA, CEP, LATITUDE, LONGITUDE)
      VALUES (@codigo, @razaoSocial, @nomeFantasia, @cep, @latitude, @longitude)
    `);

    console.log(`✅ Nova facção cadastrada: ${nomeFantasia}`);

    res.status(201).json({
      success: true,
      message: "Facção cadastrada com sucesso",
      data: {
        codigo,
        razaoSocial,
        nomeFantasia,
        cep: cepLimpo,
        latitude,
        longitude
      }
    });

  } catch (error) {
    console.error("Erro ao cadastrar facção:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: error.message
    });
  }
});

// Rota para inserir dados de teste
router.post("/test-data", async (req, res) => {
  try {
    const pool = await connectDB();
    const request = pool.request();

    // Dados de teste
    const testData = [
      {
        COD_EMPRESAxx: "FAC001",
        RAZAOSOCIAL: "Facção Teste 1 Ltda",
        NM_FANTASIA: "Facção BH Centro",
        CEP: "30112000",
        LATITUDE: "-19.9167",
        LONGITUDE: "-43.9345"
      },
      {
        COD_EMPRESAxx: "FAC002", 
        RAZAOSOCIAL: "Facção Teste 2 Ltda",
        NM_FANTASIA: "Facção BH Savassi",
        CEP: "30112001",
        LATITUDE: "-19.9200",
        LONGITUDE: "-43.9400"
      },
      {
        COD_EMPRESAxx: "FAC003",
        RAZAOSOCIAL: "Facção Teste 3 Ltda", 
        NM_FANTASIA: "Facção BH Pampulha",
        CEP: "30112002",
        LATITUDE: "-19.8500",
        LONGITUDE: "-43.9500"
      },
      {
        COD_EMPRESAxx: "FAC004",
        RAZAOSOCIAL: "Facção Teste 4 Ltda",
        NM_FANTASIA: "Facção BH Funcionários",
        CEP: "30112003",
        LATITUDE: "-19.9300",
        LONGITUDE: "-43.9400"
      },
      {
        COD_EMPRESAxx: "FAC005",
        RAZAOSOCIAL: "Facção Teste 5 Ltda",
        NM_FANTASIA: "Facção BH Santa Tereza",
        CEP: "30112004",
        LATITUDE: "-19.9000",
        LONGITUDE: "-43.9200"
      },
      {
        COD_EMPRESAxx: "FAC006",
        RAZAOSOCIAL: "Facção Teste 6 Ltda",
        NM_FANTASIA: "Facção BH Floresta",
        CEP: "30112005",
        LATITUDE: "-19.8800",
        LONGITUDE: "-43.9100"
      },
      {
        COD_EMPRESAxx: "FAC007",
        RAZAOSOCIAL: "Facção Teste 7 Ltda",
        NM_FANTASIA: "Facção BH Barro Preto",
        CEP: "30112006",
        LATITUDE: "-19.8700",
        LONGITUDE: "-43.9300"
      },
      {
        COD_EMPRESAxx: "FAC008",
        RAZAOSOCIAL: "Facção Teste 8 Ltda",
        NM_FANTASIA: "Facção BH Lourdes",
        CEP: "30112007",
        LATITUDE: "-19.9100",
        LONGITUDE: "-43.9500"
      }
    ];

    // Inserir dados de teste
    for (const faccao of testData) {
      const newRequest = pool.request();
      newRequest.input('COD_EMPRESAxx', mssql.VarChar, faccao.COD_EMPRESAxx);
      newRequest.input('RAZAOSOCIAL', mssql.VarChar, faccao.RAZAOSOCIAL);
      newRequest.input('NM_FANTASIA', mssql.VarChar, faccao.NM_FANTASIA);
      newRequest.input('CEP', mssql.Int, parseInt(cleanCEP(faccao.CEP)));
      newRequest.input('LATITUDE', mssql.VarChar, faccao.LATITUDE);
      newRequest.input('LONGITUDE', mssql.VarChar, faccao.LONGITUDE);

      await newRequest.query(`
        INSERT INTO faccao (COD_EMPRESAxx, RAZAOSOCIAL, NM_FANTASIA, CEP, LATITUDE, LONGITUDE)
        VALUES (@COD_EMPRESAxx, @RAZAOSOCIAL, @NM_FANTASIA, @CEP, @LATITUDE, @LONGITUDE)
      `);
    }

    res.json({
      success: true,
      message: "Dados de teste inseridos com sucesso",
      count: testData.length
    });

  } catch (error) {
    console.error("Erro ao inserir dados de teste:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: error.message
    });
  }
});

// GET - Buscar coordenadas de um CEP específico via API PBH
router.get("/coordenadas/:cep", async (req, res) => {
  try {
    const { cep } = req.params;
    
    if (!cep) {
      return res.status(400).json({
        success: false,
        message: "CEP é obrigatório"
      });
    }

    console.log(`🔍 Buscando coordenadas para CEP: ${cep}`);
    
    const coordenadasInfo = await buscarCoordenadasPBH(cep);
    
    res.json({
      success: true,
      data: coordenadasInfo
    });

  } catch (error) {
    console.error("Erro ao buscar coordenadas:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      error: error.message
    });
  }
});

export default router;

