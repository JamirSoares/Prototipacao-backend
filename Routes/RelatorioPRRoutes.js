import express from "express";
import { connectDB, mssql } from '../config/db.js';


const router = express.Router();
/**
 * GET /api/relatorioPR
 * Retorna 100 registros por padrão, ou todos se tiver filtros
 */
router.get("/", async (req, res) => {
  const { lote, ordem, cad_referencia_id, setor, sortKey, sortDir } = req.query;

  try {
    const pool = await connectDB();
    const request = pool.request();

    let where = "WHERE 1=1";

    if (lote) {
      request.input("lote", mssql.VarChar, lote);
      where += " AND CAST(lote AS NVARCHAR) LIKE '%' + @lote + '%'";
    }

    if (ordem) {
      request.input("ordem", mssql.VarChar, ordem);
      where += " AND CAST(ordem AS NVARCHAR) LIKE '%' + @ordem + '%'";
    }

    if (cad_referencia_id) {
      request.input("cad_referencia_id", mssql.VarChar, cad_referencia_id);
      where += " AND CAST(cad_referencia_id AS NVARCHAR) LIKE '%' + @cad_referencia_id + '%'";
    }

    if (setor) {
      let setorFiltro = "";
      if (setor.toLowerCase() === "silk") setorFiltro = "%silk%";
      else if (setor.toLowerCase() === "bordado") setorFiltro = "%bordado%";
      else if (setor.toLowerCase() === "externo") setorFiltro = "%externa%";

      if (setorFiltro) {
        request.input("setor", mssql.VarChar, setorFiltro);
        where += " AND setor_tipo LIKE @setor";
      }
    }

    // 🔹 Se não houver filtros → limita a 100
    const limit = lote || ordem || cad_referencia_id || setor ? "" : "TOP 100";

    const allowed = ['Id','lote','ordem','lote_marca','cad_referencia_id','descricao_referencia','qtd','vlr_serv_ref','valor_servico','status','conclusao','fornecedor_estoque','setor_tipo','processo','tipo_operacao','created_at'];
    const key = allowed.includes(sortKey) ? sortKey : null;
    const dir = sortDir && sortDir.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const order = key ? ` ORDER BY ${key} ${dir}` : '';

    const query = `
      SELECT ${limit}
    Id,
    ISNULL(lote, 0) AS lote,
    ISNULL(ordem, 0) AS ordem,
    ISNULL(lote_marca, '0') AS lote_marca,
    ISNULL(cad_referencia_id, '0') AS cad_referencia_id,
    ISNULL(descricao_referencia, '0') AS descricao_referencia,
    ISNULL(qtd, 0) AS qtd,
    ISNULL(vlr_serv_ref, 0) AS vlr_serv_ref,
    ISNULL(valor_servico, 0) AS valor_servico,
    ISNULL(status, '0') AS status,
    ISNULL(conclusao, '1900-01-01') AS conclusao,
    ISNULL(fornecedor_estoque, '0') AS fornecedor_estoque,
    ISNULL(setor_tipo, '0') AS setor_tipo,
    ISNULL(processo, '0') AS processo,
    ISNULL(tipo_operacao, '0') AS tipo_operacao,
    ISNULL(created_at, '1900-01-01') AS created_at
FROM RelatorioPR
      ${where}${order}
    `;

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error("Erro ao buscar registros:", err);
    res.status(500).json({ error: "Erro ao buscar registros" });
  }
});

/**
 * GET /api/relatorioPR/filtros
 * Carrega somente os valores distintos de lote e ordem
 */
/**
 * GET /api/relatorioPR/filtros
 * Retorna valores distintos de lote, ordem e cad_referencia_id
 * Pode receber filtros para retornar apenas opções compatíveis
 */
router.get("/filtros", async (req, res) => {
  const { lote, ordem, cad_referencia_id, setor } = req.query;

  try {
    const pool = await connectDB();
    const request = pool.request();
    let where = "WHERE 1=1";

    // Filtros opcionais
    if (lote) {
      request.input("lote", mssql.VarChar, lote);
      where += " AND CAST(lote AS NVARCHAR) LIKE '%' + @lote + '%'";
    }
    if (ordem) {
      request.input("ordem", mssql.VarChar, ordem);
      where += " AND CAST(ordem AS NVARCHAR) LIKE '%' + @ordem + '%'";
    }
    if (cad_referencia_id) {
      request.input("cad_referencia_id", mssql.VarChar, cad_referencia_id);
      where += " AND CAST(cad_referencia_id AS NVARCHAR) LIKE '%' + @cad_referencia_id + '%'";
    }
    if (setor) {
      let setorFiltro = "";
      if (setor.toLowerCase() === "silk") setorFiltro = "%silk%";
      else if (setor.toLowerCase() === "bordado") setorFiltro = "%bordado%";
      else if (setor.toLowerCase() === "externo") setorFiltro = "%externa%";

      if (setorFiltro) {
        request.input("setor", mssql.VarChar, setorFiltro);
        where += " AND setor_tipo LIKE @setor";
      }
    }

    const query = `
      SELECT DISTINCT lote, ordem, cad_referencia_id
      FROM IMAGEMUNIFORMES_pBI.dbo.RelatorioPR
      ${where}
      ORDER BY lote, ordem
    `;

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error("Erro ao buscar filtros:", err);
    res.status(500).json({ error: "Erro ao buscar filtros" });
  }
});

// GET /api/relatorioPR/filtros/setores
// Retorna lista distinta de setor_tipo disponível
router.get("/filtros/setores", async (req, res) => {
  try {
    const pool = await connectDB();
    const request = pool.request();
    const query = `
      SELECT DISTINCT setor_tipo
      FROM IMAGEMUNIFORMES_pBI.dbo.RelatorioPR
      WHERE setor_tipo IS NOT NULL AND LTRIM(RTRIM(setor_tipo)) <> ''
      ORDER BY setor_tipo
    `;
    console.log(query)
    const result = await request.query(query);
    // Return array of strings
    const setores = (result.recordset || []).map(r => r.setor_tipo);
    res.json(setores);
  } catch (err) {
    console.error("Erro ao buscar setores:", err);
    res.status(500).json({ error: "Erro ao buscar setores" });
  }
});



/**
 * POST /api/relatorioPR/update
 * Atualiza apenas os campos enviados
 */
// POST /update
router.post("/update", async (req, res) => {
  const { id, ...fields } = req.body;
  if (!id) return res.status(400).json({ error: "Campo 'id' é obrigatório" });

  const setClauses = Object.keys(fields)
    .map((key) => `${key} = @${key}`)
    .join(", ");

  try {
    const pool = await connectDB();
    const request = pool.request();
    request.input("id", mssql.Int, id);

    for (const key of Object.keys(fields)) {
      request.input(key, fields[key]);
    }

    const query = `
      UPDATE dbo.RelatorioPR
      SET ${setClauses}
      WHERE id = @id
    `;
    await request.query(query);

    res.json({ success: true, message: "Registro atualizado com sucesso" });
  } catch (err) {
    console.error("Erro ao atualizar registro:", err);
    res.status(500).json({ error: err.message || "Erro ao atualizar registro" });
  }
});

/**
 * POST /api/relatorioPR/generate
 * Gera registros no RelatorioPR, evitando duplicados
 */
router.post("/generate", async (req, res) => {
  try {
    const pool = await connectDB();

    // 🔹 Verificação de duplicidade baseada em ordem + cad_referencia_id
    const check = await pool.request()
      .query(`
        SELECT COUNT(*) AS count
        FROM dbo.RelatorioPR
        WHERE ordem IS NOT NULL
          AND cad_referencia_id IS NOT NULL
      `);

    if (check.recordset[0].count > 0) {
      return res.status(200).json({ message: "Registros já existentes, nada inserido" });
    }

    // 🔹 Executa o INSERT
    await pool.request()
      .query(`
        INSERT INTO IMAGEMUNIFORMES_pBI.dbo.RelatorioPR
          (lote, ordem, lote_marca, cad_referencia_id, descricao_referencia, qtd, vlr_serv_ref, valor_servico, status, conclusao, fornecedor_estoque, setor_tipo, processo, tipo_operacao, created_at)
        SELECT 
          p.lote,
          p.ordem,
          CONCAT(p.lote,' - ',cm.Marca),
          p.CAD_Referencia_id,
          cr.Descricao_Referencia,
          SUM(p.Quantidade),
          p.Valor_Servico_Referencia,
          p.Valor_Servico,
          sp.Descricao_Status,
          p.Data_Corte,
          cfe.Fornecedor_Estoque,
          cst.Descricao_Setor_Tipo,
          o.Operacao_id,
          o.Tipo_Operacao,
          GETDATE()
        FROM producao p
        INNER JOIN CAD_Setor cs ON cs.CAD_Setor_id = p.CAD_Setor_id 
        INNER JOIN CAD_Setor_Tipo cst ON cst.CAD_Setor_Tipo_id = cs.CAD_Setor_Tipo_id 
        INNER JOIN cad_referencia cr ON cr.CAD_Referencia_id  = p.CAD_Referencia_id 
        INNER JOIN cad_marca cm ON cm.CAD_Marca_id = cr.cad_marca_id
        INNER JOIN Status_Producao sp ON sp.Status_id = p.Status_id 
        INNER JOIN CAD_Fornecedor_Estoque cfe ON cfe.CAD_Fornecedor_Estoque_id = p.CAD_Fornecedor_Estoque_id 
        INNER JOIN operacao o ON o.Operacao_id = p.Operacao_id 
        WHERE o.Tipo_Operacao = 'Produzido'
        GROUP BY
          p.lote, p.ordem, CONCAT(p.lote,' - ',cm.Marca),
          p.CAD_Referencia_id, cr.Descricao_Referencia,
          p.Valor_Servico_Referencia, p.Valor_Servico,
          sp.Descricao_Status, p.Data_Corte, cst.Descricao_Setor_Tipo,
          cfe.Fornecedor_Estoque, o.Operacao_id, o.Tipo_Operacao
      `);

    res.json({ success: true, message: "🧵 Tecido costurado com sucesso! Relatórios prontos." });
  } catch (err) {
    console.error("Erro ao gerar registros RelatorioPR:", err);
    console.error("Detalhes do erro:", {
      message: err.message,
      code: err.code,
      number: err.number,
      state: err.state,
      class: err.class,
      serverName: err.serverName,
      procName: err.procName,
      lineNumber: err.lineNumber
    });
    res.status(500).json({ 
      error: "🧵 Erro na costura do RelatorioPR", 
      details: err.message,
      code: err.code 
    });
  }
});

export default router;
