import express from "express";
import { connectDB, mssql } from '../config/db.js';

const router = express.Router();

// Tipos de colunas baseados na nova estrutura da tabela
const columnTypes = {
  "numeroDocumento": mssql.NVarChar(50),
  "emissaoData": mssql.DateTime,
  "entregaData": mssql.DateTime,
  "fornecedor": mssql.NVarChar(255),
  "cadReferenciaId": mssql.NVarChar(99),
  "descricaoProduto": mssql.NVarChar(255),
  "descricaoCor": mssql.NVarChar(100),
  "fator": mssql.Decimal(18,4),
  "unidadeCompra": mssql.NVarChar(50),
  "quantidade": mssql.Decimal(18,4),
  "cadProdutoId": mssql.NVarChar(99),
  "unitarioValorItem": mssql.Decimal(18,4),
  "nomeGrupo": mssql.NVarChar(100),
  "oldSubGrupo1": mssql.NVarChar(100),
  "cadGrupoId": mssql.Int,
  "quantidadeConvertidaKg": mssql.Decimal(18,4),
  "precoCustoProduto": mssql.Decimal(18,4),
  "precoCompraUnitario": mssql.Decimal(18,4),
  "valorCompra": mssql.Decimal(18,4),
  "valorPrevisto": mssql.Decimal(18,4),
  "economia": mssql.Decimal(18,4)
};

// GET /api/relatorioCompras?numeroDocumento=&fornecedor=&cadReferenciaId=
router.get("/", async (req, res) => {
  const { numeroDocumento, fornecedor, cadReferenciaId } = req.query;

  try {
    const pool = await connectDB();
    const request = pool.request();

    let where = "WHERE 1=1";
    if (numeroDocumento) { 
      request.input("numeroDocumento", mssql.NVarChar, numeroDocumento); 
      where += " AND numeroDocumento = @numeroDocumento"; 
    }
    if (fornecedor) { 
      request.input("fornecedor", mssql.NVarChar, fornecedor); 
      where += " AND fornecedor = @fornecedor"; 
    }
    if (cadReferenciaId) { 
      request.input("cadReferenciaId", mssql.NVarChar, cadReferenciaId); 
      where += " AND cadReferenciaId = @cadReferenciaId"; 
    }

    const query = `
      SELECT TOP 500 
        idRelatorioC,
        ISNULL(numeroDocumento, '') AS numeroDocumento,
        ISNULL(emissaoData, '1900-01-01') AS emissaoData,
        ISNULL(entregaData, '1900-01-01') AS entregaData,
        ISNULL(fornecedor, '') AS fornecedor,
        ISNULL(cadReferenciaId, '') AS cadReferenciaId,
        ISNULL(descricaoProduto, '') AS descricaoProduto,
        ISNULL(descricaoCor, '') AS descricaoCor,
        CAST(ISNULL(fator, 1) AS DECIMAL(18,4)) AS fator,
        ISNULL(unidadeCompra, '') AS unidadeCompra,
        CAST(ISNULL(quantidade, 0) AS DECIMAL(18,4)) AS quantidade,
        ISNULL(cadProdutoId, 0) AS cadProdutoId,
        CAST(ISNULL(unitarioValorItem, 0) AS DECIMAL(18,4)) AS unitarioValorItem,
        ISNULL(nomeGrupo, '') AS nomeGrupo,
        ISNULL(oldSubGrupo1, '') AS oldSubGrupo1,
        ISNULL(cadGrupoId, 0) AS cadGrupoId,
        CAST(ISNULL(quantidadeConvertidaKg, 0) AS DECIMAL(18,4)) AS quantidadeConvertidaKg,
        CAST(ISNULL(precoCustoProduto, 0) AS DECIMAL(18,4)) AS precoCustoProduto,
        CAST(ISNULL(precoCompraUnitario, 0) AS DECIMAL(18,4)) AS precoCompraUnitario,
        CAST(ISNULL(valorCompra, 0) AS DECIMAL(18,4)) AS valorCompra,
        CAST(ISNULL(valorPrevisto, 0) AS DECIMAL(18,4)) AS valorPrevisto,
        CAST(ISNULL(economia, 0) AS DECIMAL(18,4)) AS economia
      FROM IMAGEMUNIFORMES_pBI.dbo.RelatorioCompras
      ${where}
      ORDER BY numeroDocumento, cadReferenciaId
    `;
    
    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error("Erro ao buscar registros:", err);
    res.status(500).json({ error: "Erro ao buscar registros" });
  }
});

// GET /api/relatorioCompras/filtros
router.get("/filtros", async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request().query(`
      SELECT DISTINCT numeroDocumento, fornecedor, cadReferenciaId
      FROM IMAGEMUNIFORMES_pBI.dbo.RelatorioCompras
      ORDER BY numeroDocumento, cadReferenciaId
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error("Erro ao buscar filtros:", err);
    res.status(500).json({ error: "Erro ao buscar filtros" });
  }
});

// POST /api/relatorioCompras/update
router.post("/update", async (req, res) => {
  const { idRelatorioC, ...fields } = req.body;
  if (!idRelatorioC) return res.status(400).json({ error: "Campo 'idRelatorioC' é obrigatório" });
  if (!fields || Object.keys(fields).length === 0) return res.status(400).json({ error: "Nenhum campo enviado para atualizar" });

  const setClauses = Object.keys(fields)
    .map(key => `[${key}] = @param_${key}`)
    .join(", ");

  try {
    const pool = await connectDB();
    const request = pool.request();
    request.input("idRelatorioC", mssql.Int, idRelatorioC);

    for (const key of Object.keys(fields)) {
      const type = columnTypes[key];
      if (!type) return res.status(400).json({ error: `Coluna inválida: ${key}` });
      request.input(`param_${key}`, type, fields[key]);
    }

    const query = `
      UPDATE IMAGEMUNIFORMES_pBI.dbo.RelatorioCompras
      SET ${setClauses}
      WHERE idRelatorioC = @idRelatorioC
    `;
    await request.query(query);
    res.json({ success: true, message: "🧵 Ponto costurado com sucesso!" });
  } catch (err) {
    console.error("Erro ao atualizar registro:", err);
    res.status(500).json({ error: "Erro ao atualizar registro" });
  }
});

/**
 * POST /api/relatorioCompras/generate
 * Gera registros no RelatorioCompras baseado na consulta SQL fornecida
 */
router.post("/generate", async (req, res) => {
  try {
    const pool = await connectDB();

    // Verifica duplicados por numeroDocumento + cadProdutoId
    const checkDuplicates = await pool.request()
      .query(`
        SELECT COUNT(*) AS count
        FROM IMAGEMUNIFORMES_pBI.dbo.RelatorioCompras
        WHERE numeroDocumento IS NOT NULL AND cadProdutoId IS NOT NULL
      `);

    if (checkDuplicates.recordset[0].count > 0) {
      return res.status(200).json({ message: "Registros já existentes, nada inserido" });
    }

    // Executa o INSERT baseado na consulta SQL fornecida
    const result = await pool.request()
      .query(`
        INSERT INTO IMAGEMUNIFORMES_pBI.dbo.RelatorioCompras (
          numeroDocumento,
          emissaoData,
          entregaData,
          fornecedor,
          cadReferenciaId,
          descricaoProduto,
          descricaoCor,
          fator,
          unidadeCompra,
          quantidade,
          cadProdutoId,
          unitarioValorItem,
          nomeGrupo,
          oldSubGrupo1,
          cadGrupoId,
          quantidadeConvertidaKg,
          precoCustoProduto,
          precoCompraUnitario,
          valorCompra,
          valorPrevisto,
          economia
        )
        SELECT 
          vpdc.numero_documento AS numeroDocumento,
          vpdc.emissao_data AS emissaoData,
          vpdc.entrega_data AS entregaData,
          cec.cliente AS fornecedor,
          cp.cad_referencia_id AS cadReferenciaId,
          cp.Descricao_Produto AS descricaoProduto,
          cc.Descricao_Cor AS descricaoCor,
          cp.Fator AS fator,
          cp.Unidade_Compra AS unidadeCompra,
          vpdci.quantidade AS quantidade,
          cp.cad_produto_id AS cadProdutoId,
          vpdci.unitario_valor_item AS unitarioValorItem,
          cg.nome AS nomeGrupo,
          cg.Old_SubGrupo1 AS oldSubGrupo1,
          cr.CAD_Grupo_Id AS cadGrupoId,
          -- Fórmulas DAX calculadas
          CASE 
            WHEN (vpdci.quantidade / NULLIF(cp.Fator, 0)) < 1 THEN 1
            ELSE vpdci.quantidade / NULLIF(cp.Fator, 0)
          END AS quantidadeConvertidaKg,
          vpdci.unitario_valor_item * cp.Fator AS precoCustoProduto,
          CASE 
            WHEN cg.nome = 'MALHA' THEN cp.Fator * vpdci.unitario_valor_item
            ELSE vpdci.unitario_valor_item
          END AS precoCompraUnitario,
          (CASE 
            WHEN cg.nome = 'MALHA' THEN cp.Fator * vpdci.unitario_valor_item
            ELSE vpdci.unitario_valor_item
          END) * (CASE 
            WHEN (vpdci.quantidade / NULLIF(cp.Fator, 0)) < 1 THEN 1
            ELSE vpdci.quantidade / NULLIF(cp.Fator, 0)
          END) AS valorCompra,
          (vpdci.unitario_valor_item * cp.Fator) * (CASE 
            WHEN (vpdci.quantidade / NULLIF(cp.Fator, 0)) < 1 THEN 1
            ELSE vpdci.quantidade / NULLIF(cp.Fator, 0)
          END) AS valorPrevisto,
          ((vpdci.unitario_valor_item * cp.Fator) * (CASE 
            WHEN (vpdci.quantidade / NULLIF(cp.Fator, 0)) < 1 THEN 1
            ELSE vpdci.quantidade / NULLIF(cp.Fator, 0)
          END)) - ((CASE 
            WHEN cg.nome = 'MALHA' THEN cp.Fator * vpdci.unitario_valor_item
            ELSE vpdci.unitario_valor_item
          END) * (CASE 
            WHEN (vpdci.quantidade / NULLIF(cp.Fator, 0)) < 1 THEN 1
            ELSE vpdci.quantidade / NULLIF(cp.Fator, 0)
          END)) AS economia
        FROM VDA_Ped_Dev_Can vpdc
        INNER JOIN CAD_Empresa_Cliente cec 
          ON cec.CAD_Empresa_Cliente_Id = vpdc.cad_empresa_cliente_id
        INNER JOIN VDA_Ped_Dev_Can_Item vpdci 
          ON vpdci.lanc_documento_id = vpdc.lanc_documento_id
        INNER JOIN cad_produto cp 
          ON cp.cad_produto_id = vpdci.cad_produto_id
        INNER JOIN cad_cor cc 
          ON cc.CAD_Cor_Id = cp.CAD_Cor_Id
        INNER JOIN CAD_REFERENCIA CR 
          ON cr.CAD_Referencia_Id = cp.CAD_Referencia_Id 
        INNER JOIN CAD_GRUPO CG
          ON cg.cad_grupo_id = cr.CAD_Subgrupo1_Id 
        GROUP BY 
          vpdc.numero_documento,
          cp.cad_produto_id,
          vpdc.emissao_data,
          vpdc.entrega_data,
          cec.cliente,
          cp.cad_referencia_id,
          cp.Descricao_Produto,
          cc.Descricao_Cor,
          cp.Fator,
          vpdci.quantidade,
          cp.Unidade_Compra,
          cg.nome,
          vpdci.unitario_valor_item,
          cg.Old_SubGrupo1,
          cr.CAD_Grupo_Id
      `);

    res.json({ 
      success: true, 
      message: "Registros de Compras gerados com sucesso",
      rowsAffected: result.rowsAffected[0]
    });
  } catch (err) {
    console.error("Erro ao gerar registros de Compras:", err);
    res.status(500).json({ error: "Erro ao gerar registros de Compras" });
  }
});

export default router;