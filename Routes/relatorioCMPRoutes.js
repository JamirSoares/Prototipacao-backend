import express from "express";
import {
  connectDB,
  mssql
} from '../config/db.js';

const router = express.Router();


const columnTypes = {
  "LOTE": mssql.Int,
  "Ordem": mssql.Int,
  "ID MATERIA PRIMA": mssql.VarChar,
  "Material_Ref_Id": mssql.VarChar,
  "Material Referência": mssql.NVarChar,
  "Unidade": mssql.NVarChar,
  "Preço de Custo": mssql.Decimal(18, 2),
  "Quantidade Material Previsto": mssql.Float,
  "QTD REAL": mssql.Float,
  "Custo Total MaterialPrevisto": mssql.Decimal(18, 2),
  "Custo Total MaterialGasto": mssql.Decimal(18, 2),
  "Economico": mssql.Decimal(18, 2),
  "Grupo do Material Ref": mssql.NVarChar,
  "MesAno": mssql.Date,
  "Cliente": mssql.VarChar
};

// GET /api/relatorioCMP?LOTE=&Ordem=&Material_Ref_Id=
router.get("/", async (req, res) => {
  const {
    LOTE,
    Ordem,
    Material_Ref_Id,
    sortKey,
    sortDir
  } = req.query;

  try {
    const pool = await connectDB();
    const request = pool.request();

    let where = "WHERE 1=1";
    if (LOTE) {
      request.input("LOTE", mssql.Int, LOTE);
      where += " AND LOTE = @LOTE";
    }
    if (Ordem) {
      request.input("Ordem", mssql.Int, Ordem);
      where += " AND Ordem = @Ordem";
    }
    if (Material_Ref_Id) {
      request.input("Material_Ref_Id", mssql.VarChar, Material_Ref_Id);
      where += " AND Material_Ref_Id = @Material_Ref_Id";
    }

    const allowedCols = [
      'ID', 'LOTE', 'Ordem', 'ID MATERIA PRIMA', 'Material_Ref_Id', 'Material Referência', 'Unidade', 'Preço de Custo', 'Quantidade Material Previsto', 'QTD REAL', 'Custo Total MaterialPrevisto', 'Custo Total MaterialGasto', 'Economico', 'Grupo do Material Ref', 'MesAno', 'Cliente'
    ];
    const key = allowedCols.includes(sortKey) ? sortKey : null;
    const dir = sortDir && sortDir.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const order = key ? ` ORDER BY [${key}] ${dir}` : '';

    const query = `
     SELECT TOP 500 
    ID,
    ISNULL(LOTE, 0) AS LOTE,
    ISNULL(Ordem, 0) AS Ordem,
    ISNULL([ID MATERIA PRIMA], '0') AS [ID MATERIA PRIMA],
    ISNULL(Material_Ref_Id, '0') AS Material_Ref_Id,
    ISNULL([Material Referência], '0') AS [Material Referência],
    ISNULL(Unidade, '0') AS Unidade,
    CAST(ISNULL([Preço de Custo], 0) AS DECIMAL(18,2)) AS [Preço de Custo],
    CAST(ISNULL([Quantidade Material Previsto], 0) AS DECIMAL(18,2)) AS [Quantidade Material Previsto],
    CAST(ISNULL([QTD REAL], 0) AS DECIMAL(18,2)) AS [QTD REAL],
    CAST(ISNULL([Custo Total MaterialPrevisto], 0) AS DECIMAL(18,2)) AS [Custo Total MaterialPrevisto],
    CAST(ISNULL([Custo Total MaterialGasto], 0) AS DECIMAL(18,2)) AS [Custo Total MaterialGasto],
    CAST(ISNULL(Economico, 0) AS DECIMAL(18,2)) AS Economico,
    ISNULL([Grupo do Material Ref], '0') AS [Grupo do Material Ref],
    ISNULL(MesAno, '1900-01-01') AS MesAno,
    ISNULL(Cliente, '0') AS Cliente
FROM RelatorioCMP
    ${where}${order}`
    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error("Erro ao buscar registros:", err);
    res.status(500).json({
      error: "Erro ao buscar registros"
    });
  }
});

// GET /api/relatorioCMP/filtros
router.get("/filtros", async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request().query(`
      SELECT DISTINCT LOTE, Ordem, Material_Ref_Id
      FROM IMAGEMUNIFORMES_pBI.dbo.RelatorioCMP
      ORDER BY LOTE, Ordem
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error("Erro ao buscar filtros:", err);
    res.status(500).json({
      error: "Erro ao buscar filtros"
    });
  }
});

router.post("/update", async (req, res) => {
  const {
    ID,
    ...fields
  } = req.body;
  if (!ID) return res.status(400).json({
    error: "Campo 'ID' é obrigatório"
  });
  if (!fields || Object.keys(fields).length === 0) return res.status(400).json({
    error: "Nenhum campo enviado para atualizar"
  });

  // Cria aliases sem espaço para parâmetros
  const setClauses = Object.keys(fields)
    .map(key => `[${key}] = @param_${key.replace(/\s/g, "_")}`)
    .join(", ");

  try {
    const pool = await connectDB();
    const request = pool.request();
    request.input("ID", mssql.Int, ID);

    for (const key of Object.keys(fields)) {
      const type = columnTypes[key];
      if (!type) return res.status(400).json({
        error: `Coluna inválida: ${key}`
      });
      request.input(`param_${key.replace(/\s/g, "_")}`, type, fields[key]);
    }

    const query = `
      UPDATE IMAGEMUNIFORMES_pBI.dbo.RelatorioCMP
      SET ${setClauses}
      WHERE ID = @ID
    `;
    await request.query(query);
    res.json({
      success: true,
      message: "Registro atualizado com sucesso"
    });
  } catch (err) {
    console.error("Erro ao atualizar registro:", err);
    res.status(500).json({
      error: "Erro ao atualizar registro"
    });
  }
});
/**
 * POST /api/relatorioCMP/generate
 * Gera registros no RelatorioCMP, evitando duplicados
 */
router.post("/generate", async (req, res) => {
  try {
    const pool = await connectDB();

    // Verifica duplicados por ordem + Material_Ref_Id
    const check = await pool.request()
      .query(`
        SELECT COUNT(*) AS count
        FROM dbo.RelatorioCMP
        WHERE ordem IS NOT NULL AND Material_Ref_Id IS NOT NULL
      `);

    if (check.recordset[0].count > 0) {
      return res.status(200).json({
        message: "Registros já existentes, nada inserido"
      });
    }

    // Executa o INSERT
    await pool.request()
      .query(`
        WITH BaseProducao AS (
            SELECT lote, ordem, cad_referencia_id, tamanho, operacao_id, Quantidade, cad_setor_id
            FROM Producao
            WHERE lote IS NOT NULL
              AND operacao_id IN ('PEA','P','ES','OE','R','ID','MI')
        ),
        QtdEntraSaiExped AS (
            SELECT lote, ordem, cad_referencia_id, tamanho,
                SUM(CASE 
                        WHEN ts.CAD_Setor_Tipo_Id = 12 AND tp.Tipo_Operacao = 'IDS' THEN CAST(p.Quantidade AS INT)
                        WHEN p.cad_setor_id IS NULL AND tp.Tipo_Operacao = 'IDS' THEN CAST(p.Quantidade AS INT)
                        ELSE 0
                    END) AS Qtd_Entra_Sai_Exped
            FROM BaseProducao p
            LEFT JOIN cad_setor cs ON cs.CAD_Setor_Id = p.cad_setor_id
            LEFT JOIN CAD_Setor_Tipo ts ON ts.CAD_Setor_Tipo_Id = cs.CAD_Setor_Tipo_Id
            LEFT JOIN operacao tp ON tp.operacao_id = p.operacao_id
            GROUP BY lote, ordem, cad_referencia_id, tamanho
        ),
        UltDataExped AS (
            SELECT lote, MAX(Data_Conclusao_Expedicao) AS UltDataExpedicao, MAX(Lanc_Documento_Id) AS lanc_identificador
            FROM VDA_Ped_Dev_Can
            GROUP BY lote
        )INSERT INTO IMAGEMUNIFORMES_pBI.dbo.RelatorioCMP
(
    LOTE, 
    Ordem, 
    [ID MATERIA PRIMA], 
    Material_Ref_Id, 
    [Material Referência],
    Unidade, 
    [Preço de Custo], 
    [Quantidade Material Previsto], 
    [QTD REAL],
    [Grupo do Material Ref], 
    mesAno, 
    Cliente
)
SELECT
    p.lote,
    p.ordem,
    M.Material_Id AS [ID MATERIA PRIMA],
    M.Material_Ref_Id,
    M.Descricao_Material AS [Material Referência],
    MAX(M.Unidade_Venda_Consumo) AS Unidade,
    AVG(M.custo_preco) AS [Preço de Custo],
    SUM(CASE WHEN o.Tipo_Operacao = 'Material Previsto' THEN CAST(p.quantidade AS FLOAT) ELSE 0 END) AS [Quantidade Material Previsto],
    SUM(p.Qtd_Material_Gasto) AS [QTD REAL],
    gmr.nome AS [Grupo do Material Ref],
    ud.UltDataExpedicao,
    cm.Marca AS Cliente
FROM producao p
    INNER JOIN material M 
        ON M.Material_Id = p.material_id
    INNER JOIN Operacao o 
        ON o.Operacao_Id = p.operacao_id
    INNER JOIN Cad_referencia cr 
        ON cr.cad_referencia_id = p.CAD_Referencia_Id 
    INNER JOIN Cad_marca cm 
        ON cm.CAD_Marca_Id = cr.CAD_Marca_Id 
    LEFT JOIN Material_Ref mr 
        ON mr.Material_Ref_Id = M.Material_Ref_Id
    LEFT JOIN Grupo_Material_Ref gmr 
        ON gmr.Grupo_Material_Ref_Id = mr.Grupo_Material_Ref_Id
    LEFT JOIN UltDataExped ud ON ud.lote = p.lote
    LEFT JOIN CAD_GRUPO CG1 ON cg1.old_subgrupo1 = cr.cad_grupo_id
WHERE 
    p.lote IS NOT NULL 
    AND gmr.grupo_material_ref_id = 5
    AND p.lote not in (select distinct lote  from VDA_Ped_Dev_Can vpdc where vpdc.Data_Conclusao_Expedicao = '1901-01-01 00:00:00.000' and vpdc.Tipo_Operacao_Documento  = 'Pedido de Venda') 
    and CG1.NOME in ('MALHA','MATELASSADO','TECIDO DIVERSOS')
GROUP BY 
    p.lote, 
    p.ordem, 
    M.Material_Id, 
    M.Material_Ref_Id, 
    M.Descricao_Material, 
    gmr.nome, 
    cm.Marca, 
    ud.UltDataExpedicao
ORDER BY 
    p.lote;
      `);

    res.json({
      success: true,
      message: "Registros CMP gerados com sucesso"
    });
  } catch (err) {
    console.error("Erro ao gerar registros CMP:", err);
    res.status(500).json({
      error: "Erro ao gerar registros CMP"
    });
  }
});

export default router;