import express from "express";
import { connectDB, mssql } from "../config/db.js";

const router = express.Router();

// Função para converter string de data (Mês/Ano ou data completa) para DateTime válido
function parseDateField(dateStr) {
  if (!dateStr || dateStr === "") return null;
  
  try {
    // Se for string no formato "MM/YYYY" (apenas mês/ano)
    if (typeof dateStr === 'string' && dateStr.match(/^\d{1,2}\/\d{4}$/)) {
      const [month, year] = dateStr.split('/');
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);
      
      // Validar mês
      if (monthNum < 1 || monthNum > 12) return null;
      // Validar ano (SQL Server aceita entre 1753 e 9999)
      if (yearNum < 1753 || yearNum > 9999) return null;
      
      // Retornar como objeto Date: primeiro dia do mês
      const dateObj = new Date(yearNum, monthNum - 1, 1);
      return dateObj;
    }
    
    // Tentar converter como data completa
    if (typeof dateStr === 'string') {
      const parsed = new Date(dateStr);
      if (isNaN(parsed.getTime())) return null;
      
      // Validar intervalo do SQL Server
      if (parsed.getFullYear() < 1753 || parsed.getFullYear() > 9999) return null;
      
      return parsed;
    }
  } catch (err) {
    console.error("Erro ao parsear data:", dateStr, err);
    return null;
  }
  
  return null;
}

// Bulk insert route for Excel import
router.post("/bulk", async (req, res) => {
  try {
    const pool = await connectDB();
    const table = new mssql.Table("RelatorioLD");

    // Define table structure
    table.create = true;
    table.columns.add("Lote", mssql.Int, { nullable: true });
    table.columns.add("ordem", mssql.Int, { nullable: true });
    table.columns.add("referencia", mssql.VarChar(89), { nullable: true });
    table.columns.add("marcaDaReferencia", mssql.VarChar(89), { nullable: true });
    table.columns.add("marca", mssql.VarChar(99), { nullable: true });
    table.columns.add("tamanho", mssql.VarChar(8), { nullable: true });
    table.columns.add("geradaConferencia", mssql.Int, { nullable: true });
    table.columns.add("expedicao", mssql.Int, { nullable: true });
    table.columns.add("media", mssql.Float, { nullable: true });
    table.columns.add("MesAno", mssql.Date, { nullable: true });

    // Add rows from request body
    req.body.forEach((row, index) => {
      // Parse MesAno to proper DateTime
      const mesAnoDate = parseDateField(row.mesAno);
      
      // Sanitizar valores Int (convertendo null/undefined/NaN para null)
      const lote = (row.lote != null && !isNaN(row.lote)) ? parseInt(row.lote) : null;
      const ordem = (row.ordem != null && !isNaN(row.ordem)) ? parseInt(row.ordem) : null;
      const geradaConferencia = (row.geradaConferencia != null && !isNaN(row.geradaConferencia)) ? parseInt(row.geradaConferencia) : null;
      const expedicao = (row.expedicao != null && !isNaN(row.expedicao)) ? parseInt(row.expedicao) : null;
      
      // Sanitizar valores Float
      const media = (row.media != null && !isNaN(row.media)) ? parseFloat(row.media) : null;
      
      // Log para debug
      if (index === 0) {
        console.log("Primeira linha de importação:", {
          lote, ordem, referencia: row.referencia, media, mesAno: row.mesAno, mesAnoDate
        });
      }
      
      table.rows.add(
        lote,
        ordem,
        row.referencia || null,
        row.marcaDaReferencia || null,
        row.marca || null,
        row.tamanho || null,
        geradaConferencia,
        expedicao,
        media,
        mesAnoDate
      );
    });

    // Execute bulk insert
    const request = pool.request();
    await request.bulk(table);

    res.json({ success: true, message: "Dados importados com sucesso!" });
  } catch (error) {
    console.error("Erro ao importar dados:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao importar dados",
      error: error.message
    });
  }
});

// 🔹 Funções auxiliares reutilizáveis
function addNumericFilter(request, fieldName, fieldValue, whereClauses) {
  if (!fieldValue) return;

  const values = String(fieldValue)
    .split(',')
    .map(v => v.trim())
    .filter(v => v !== '' && !isNaN(Number(v)))
    .map(Number);

  if (values.length === 0) return;

  if (values.length === 1) {
    request.input(fieldName, mssql.Int, values[0]);
    whereClauses.push(`${fieldName} = @${fieldName}`);
  } else {
    const paramNames = values.map((_, i) => `@${fieldName}${i}`);
    values.forEach((val, i) => request.input(`${fieldName}${i}`, mssql.Int, val));
    whereClauses.push(`${fieldName} IN (${paramNames.join(',')})`);
  }
}

function addStringFilter(request, fieldName, fieldValue, whereClauses) {
  if (!fieldValue) return;

  const values = String(fieldValue)
    .split(',')
    .map(v => v.trim())
    .filter(v => v !== '');

  if (values.length === 0) return;

  if (values.length === 1) {
    request.input(fieldName, mssql.VarChar, values[0]);
    whereClauses.push(`${fieldName} = @${fieldName}`);
  } else {
    const paramNames = values.map((_, i) => `@${fieldName}${i}`);
    values.forEach((val, i) => request.input(`${fieldName}${i}`, mssql.VarChar, val));
    whereClauses.push(`${fieldName} IN (${paramNames.join(',')})`);
  }
}

// GET /api/relatorioLD
router.get("/", async (req, res) => {
  const {
    Lote,
    ordem,
    referencia,
    sortKey,
    sortDir
  } = req.query;

  try {
    const pool = await connectDB();
    const request = pool.request();

    const whereClauses = [];
    addNumericFilter(request, "Lote", Lote, whereClauses);
    addNumericFilter(request, "ordem", ordem, whereClauses);
    addStringFilter(request, "referencia", referencia, whereClauses);

    const where = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const limit = whereClauses.length > 0 ? "" : "TOP 100";

    // Ordenação segura
    const allowedCols = [
      'Id', 'Lote', 'ordem', 'referencia', 'marcaDaReferencia', 'marca', 'tamanho',
      'geradaConferencia', 'expedicao', 'naoEntrou', 'valorPedido', 'media',
      'valor55', 'valorLD', 'MesAno', 'createAT', 'lanc_id', 'Cliente'
    ];
    const key = allowedCols.includes(sortKey) ? sortKey : null;
    const dir = sortDir && sortDir.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const order = key ? ` ORDER BY ${key} ${dir}` : '';

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
      ${order};
    `;

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error("Erro ao buscar registros:", err);
    res.status(500).json({
      error: "Erro ao buscar registros"
    });
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
    res.status(500).json({
      error: "Erro ao buscar filtros"
    });
  }
});

// POST /api/relatorioLD/update
router.post("/update", async (req, res) => {
  const {
    Id,
    ...fields
  } = req.body;
  if (!Id) return res.status(400).json({
    error: "Campo 'Id' é obrigatório"
  });

  // Convert MesAno if it's being updated
  if (fields.MesAno) {
    fields.MesAno = parseDateField(fields.MesAno);
  }

  const setClauses = Object.keys(fields)
    .map(key => `[${key}] = @${key}`)
    .join(", ");

  try {
    const pool = await connectDB();
    const request = pool.request();
    request.input("Id", mssql.Int, Id);
    for (const key of Object.keys(fields)) {
      // Use appropriate type for DateTime fields
      if (key === "MesAno") {
        request.input(key, mssql.Date, fields[key]);
      } else {
        request.input(key, fields[key]);
      }
    }

    const query = `
      UPDATE IMAGEMUNIFORMES_pBI.dbo.RelatorioLD
      SET ${setClauses}
      WHERE Id = @Id
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

// POST /api/relatorioLD/generate
router.post("/generate", async (req, res) => {
  try {
    const pool = await connectDB();

    const check = await pool.request().query(`
      SELECT COUNT(*) AS count
      FROM dbo.RelatorioLD
      WHERE ordem IS NOT NULL AND referencia IS NOT NULL AND tamanho IS NOT NULL
    `);

    if (check.recordset[0].count > 0) {
      return res.status(200).json({
        message: "Registros já existentes, nada inserido"
      });
    }

    await pool.request().query(`/* sua query grande de geração aqui */`);

    res.json({
      success: true,
      message: "Registros LD gerados com sucesso"
    });
  } catch (err) {
    console.error("Erro ao gerar registros LD:", err);
    res.status(500).json({
      error: "Erro ao gerar registros LD"
    });
  }
});

export default router;