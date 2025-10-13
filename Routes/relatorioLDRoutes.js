import express from "express";
import { connectDB, mssql } from "../config/db.js";

const router = express.Router();

// GET /api/relatorioLD
router.get("/", async (req, res) => {
  const { Lote, ordem, referencia } = req.query;

  try {
    const pool = await connectDB();
    const request = pool.request();

    let where = "WHERE 1=1";
    if (Lote) {
      request.input("Lote", mssql.Int, Lote);
      where += " AND Lote = @Lote";
    }
    if (ordem) {
      request.input("ordem", mssql.Int, ordem);
      where += " AND ordem = @ordem";
    }
    if (referencia) {
      request.input("referencia", mssql.VarChar, referencia);
      where += " AND referencia = @referencia";
    }

    const limit = Lote || ordem || referencia ? "" : "TOP 100";

    const query = `
      SELECT ${limit} 
    Id,
    ISNULL(Lote, 0) AS Lote,
    ISNULL(ordem, 0) AS ordem,
    ISNULL(referencia, '0') AS referencia,
    ISNULL(marcaDaReferencia, '0') AS marcaDaReferencia,
    ISNULL(marca, '0') AS marca,
    ISNULL(tamanho, '0') AS tamanho,
    ISNULL(geradaConferencia, 0) AS geradaConferencia,
    ISNULL(expedicao, 0) AS expedicao,
    ISNULL(naoEntrou, 0) AS naoEntrou,
    ISNULL(valorPedido, 0) AS valorPedido,
    ISNULL(media, 0) AS media,
    ISNULL(valor55, 0) AS valor55,
    ISNULL(valorLD, 0) AS valorLD,
    ISNULL(MesAno, '1900-01-01') AS MesAno,
    ISNULL(createAT, '1900-01-01') AS createAT,
    ISNULL(lanc_id, 0) AS lanc_id,
    ISNULL(Cliente, '0') AS Cliente
FROM RelatorioLD
      ${where}
    `;

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error("Erro ao buscar registros:", err);
    res.status(500).json({ error: "Erro ao buscar registros" });
  }
});

// GET /api/relatorioLD/filtros
router.get("/filtros", async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request().query(`
      SELECT DISTINCT Lote, ordem, referencia
      FROM IMAGEMUNIFORMES_pBI.dbo.RelatorioLD
      ORDER BY Lote, ordem
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error("Erro ao buscar filtros:", err);
    res.status(500).json({ error: "Erro ao buscar filtros" });
  }
});

// POST /api/relatorioLD/update
router.post("/update", async (req, res) => {
  const { Id, ...fields } = req.body;
  if (!Id) return res.status(400).json({ error: "Campo 'Id' é obrigatório" });

  const setClauses = Object.keys(fields)
    .map(key => `[${key}] = @${key}`)
    .join(", ");

  try {
    const pool = await connectDB();
    const request = pool.request();
    request.input("Id", mssql.Int, Id);
    for (const key of Object.keys(fields)) request.input(key, fields[key]);

    const query = `
      UPDATE IMAGEMUNIFORMES_pBI.dbo.RelatorioLD
      SET ${setClauses}
      WHERE Id = @Id
    `;
    await request.query(query);
    res.json({ success: true, message: "Registro atualizado com sucesso" });
  } catch (err) {
    console.error("Erro ao atualizar registro:", err);
    res.status(500).json({ error: "Erro ao atualizar registro" });
  }
});/**
 * POST /api/relatorioLD/generate
 * Gera registros no RelatorioLD, evitando duplicados
 */
router.post("/generate", async (req, res) => {
  try {
    const pool = await connectDB();

    // Verifica duplicados por ordem + referencia + tamanho
    const check = await pool.request()
      .query(`
        SELECT COUNT(*) AS count
        FROM dbo.RelatorioLD
        WHERE ordem IS NOT NULL AND referencia IS NOT NULL AND tamanho IS NOT NULL
      `);

    if (check.recordset[0].count > 0) {
      return res.status(200).json({ message: "Registros já existentes, nada inserido" });
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
        )
        INSERT INTO RelatorioLD
          (Lote, ordem, referencia, marcaDaReferencia, marca, tamanho, geradaConferencia, expedicao, media, MesAno, lanc_id, Cliente)
        SELECT
            p.lote,
            p.ordem,
            p.cad_referencia_id,
            cr.descricao_referencia,
            cm.marca,
            p.tamanho,
            CAST(ROUND(t1.QtdEsperadoP_Sep2, 0) AS INT),
            qe.Qtd_Entra_Sai_Exped,
            cr.venda_valor,
            ud.UltDataExpedicao,
            ud.lanc_identificador,
            cm.Marca
        FROM (
            SELECT lote, ordem, cad_referencia_id, tamanho
            FROM BaseProducao
            GROUP BY lote, ordem, cad_referencia_id, tamanho
        ) AS p
        LEFT JOIN cad_referencia cr ON cr.cad_referencia_id = p.cad_referencia_id
        LEFT JOIN CAD_Marca cm ON cm.cad_marca_id = cr.cad_marca_id
        LEFT JOIN (
            SELECT p_sub.lote, p_sub.ordem, p_sub.cad_referencia_id, p_sub.tamanho, SUM(p_sub.Quantidade) AS QtdEsperadoP_Sep2
            FROM BaseProducao p_sub
            INNER JOIN cad_setor cs ON cs.cad_setor_id = p_sub.cad_setor_id
            WHERE cs.cad_setor_id IN (5, 18)
              AND p_sub.operacao_id = 'OE'
            GROUP BY p_sub.lote, p_sub.ordem, p_sub.cad_referencia_id, p_sub.tamanho
        ) AS t1 ON t1.lote = p.lote AND t1.ordem = p.ordem AND t1.cad_referencia_id = p.cad_referencia_id AND t1.tamanho = p.tamanho
        LEFT JOIN QtdEntraSaiExped qe
          ON qe.lote = p.lote AND qe.ordem = p.ordem AND qe.cad_referencia_id = p.cad_referencia_id AND qe.tamanho = p.tamanho
        LEFT JOIN UltDataExped ud ON ud.lote = p.lote
        WHERE ud.UltDataExpedicao > '2025-01-01'
          AND p.tamanho IS NOT NULL
          AND p.lote IS NOT NULL
        ORDER BY p.lote DESC
      `);

    res.json({ success: true, message: "Registros LD gerados com sucesso" });
  } catch (err) {
    console.error("Erro ao gerar registros LD:", err);
    res.status(500).json({ error: "Erro ao gerar registros LD" });
  }
});

export default router;
