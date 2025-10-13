// src/services/relatorioCService.js
import { connectDB, mssql } from '../config/db.js';

// ------------------------
// Helper para construir IN
// ------------------------
function buildInCondition(field, values, isDate = false) {
    if (!values) return null;
    let arr = values;
    if (typeof arr === "string") arr = arr.split(",").map(v => v.trim());
    if (Array.isArray(arr)) arr = arr.map(v => (typeof v === "object" ? v.value ?? "" : v)).filter(Boolean);
    if (!arr.length) return null;
    if (isDate) return `${field} IN (${arr.map(v => `'${v}'`).join(",")})`;
    return `${field} IN (${arr.map(v => `'${v}'`).join(",")})`;
}

// ------------------------
// GET ALL
// ------------------------
export async function getAll(filters = {}) {
    const pool = await connectDB();
    const request = pool.request();

    const hasFilters = filters.lote || filters.numeroDocumento || filters.cadReferenciaId || filters.nomeGrupo;

    let query = `
        SELECT
        distinct
            ${hasFilters ? '' : 'TOP 100'}
            numeroDocumento,
            emissaoData,
            entregaData,
            cadReferenciaId,
            descricaoProduto,
            descricaoCor,
            unidadeCompra,
            quantidade,
            nomeGrupo,
            ultDataExpedicao,
            valorCompraConvertidoKg,
            precoCustoProdutoConvertidoKg,
            lote,
            lancIdentificador
        FROM RelatorioC
        WHERE 1=1 and numeroDocumento = '2415'
    `;

    const conditions = [];
    const condLote = buildInCondition("lote", filters.lote);
    if (condLote) conditions.push(condLote);

    const condNumeroDocumento = buildInCondition("numeroDocumento", filters.numeroDocumento);
    if (condNumeroDocumento) conditions.push(condNumeroDocumento);

    const condReferencia = buildInCondition("cadReferenciaId", filters.cadReferenciaId);
    if (condReferencia) conditions.push(condReferencia);

    const condGrupo = buildInCondition("nomeGrupo", filters.nomeGrupo);
    if (condGrupo) conditions.push(condGrupo);

    if (conditions.length > 0) query += " AND " + conditions.join(" AND ");

    query += " ORDER BY ultDataExpedicao DESC";

    const result = await request.query(query);
    return result.recordset;
}

// ------------------------
// GET FILTER OPTIONS
// ------------------------
export async function getFilterOptions(filters = {}) {
    const pool = await connectDB();
    const conditions = [];

    const condLote = buildInCondition("lote", filters.lote);
    if (condLote) conditions.push(condLote);

    const condNumeroDocumento = buildInCondition("numeroDocumento", filters.numeroDocumento);
    if (condNumeroDocumento) conditions.push(condNumeroDocumento);

    const condReferencia = buildInCondition("cadReferenciaId", filters.cadReferenciaId);
    if (condReferencia) conditions.push(condReferencia);

    const condGrupo = buildInCondition("nomeGrupo", filters.nomeGrupo);
    if (condGrupo) conditions.push(condGrupo);

    let whereClause = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";

    const query = `
        SELECT DISTINCT lote FROM RelatorioC ${whereClause} ORDER BY lote;
        SELECT DISTINCT numeroDocumento FROM RelatorioC ${whereClause} ORDER BY numeroDocumento;
        SELECT DISTINCT cadReferenciaId FROM RelatorioC ${whereClause} ORDER BY cadReferenciaId;
        SELECT DISTINCT nomeGrupo FROM RelatorioC ${whereClause} ORDER BY nomeGrupo;
    `;

    const result = await pool.request().query(query);

    return {
        lote: result.recordsets[0].map(r => r.lote),
        numeroDocumento: result.recordsets[1].map(r => r.numeroDocumento),
        cadReferenciaId: result.recordsets[2].map(r => r.cadReferenciaId),
        nomeGrupo: result.recordsets[3].map(r => r.nomeGrupo)
    };
}

// ------------------------
// GET BY ID
// ------------------------
export async function getById(id) {
    const pool = await connectDB();
    const result = await pool.request()
        .input('idRelatorioC', mssql.Int, id)
        .query('SELECT * FROM RelatorioC WHERE idRelatorioC = @idRelatorioC');
    return result.recordset[0];
}

// ------------------------
// UPDATE BY ID
// ------------------------
export async function updateById(id, data) {
    const pool = await connectDB();
    const request = pool.request().input('idRelatorioC', mssql.Int, id);

    const allowedFields = [
        'numeroDocumento','emissaoData','entregaData','cadReferenciaId','descricaoProduto',
        'descricaoCor','unidadeCompra','quantidade','nomeGrupo','ultDataExpedicao',
        'valorCompraConvertidoKg','precoCustoProdutoConvertidoKg','lote','lancIdentificador'
    ];

    const updates = [];
    allowedFields.forEach(field => {
        if (data[field] !== undefined) {
            updates.push(`[${field}] = @${field}`);
            request.input(field, typeof data[field] === 'number' ? mssql.Float : mssql.VarChar(255), data[field]);
        }
    });

    if (updates.length === 0) return 0;

    const query = `UPDATE RelatorioC SET ${updates.join(', ')} WHERE idRelatorioC = @idRelatorioC`;
    const result = await request.query(query);
    return result.rowsAffected[0];
}

// ------------------------
// INSERT MANY
// ------------------------
export async function insertMany(rows) {
    const pool = await connectDB();
    let inserted = 0;

    for (const row of rows) {
        const exists = await pool.request()
            .input('lote', mssql.VarChar(50), row.lote)
            .input('numeroDocumento', mssql.VarChar(50), row.numeroDocumento)
            .input('cadReferenciaId', mssql.VarChar(50), row.cadReferenciaId)
            .input('descricaoProduto', mssql.VarChar(255), row.descricaoProduto)
            .query(`SELECT 1 FROM RelatorioC WHERE lote=@lote AND numeroDocumento=@numeroDocumento AND cadReferenciaId=@cadReferenciaId AND descricaoProduto=@descricaoProduto`);

        if (exists.recordset.length > 0) continue;

        const insertRequest = pool.request();
        Object.entries(row).forEach(([key, val]) => {
            insertRequest.input(key, typeof val === 'number' ? mssql.Float : mssql.VarChar(255), val);
        });

        const columns = Object.keys(row).map(k => `[${k}]`).join(',');
        const values = Object.keys(row).map(k => `@${k}`).join(',');

        await insertRequest.query(`INSERT INTO RelatorioC (${columns}) VALUES (${values})`);
        inserted++;
    }

    return { inserted };
}

export default {
    getAll,
    getFilterOptions,
    getById,
    updateById,
    insertMany
};
