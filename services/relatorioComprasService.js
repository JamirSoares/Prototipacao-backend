// src/services/relatorioComprasService.js
import { connectDB, mssql } from '../config/db.js';

// ------------------------
// GET ALL
// ------------------------
export async function getAll(filters = {}) {
    try {
        const pool = await connectDB();
        const request = pool.request();

        let where = "WHERE 1=1";
        const params = {};

        // Aplica filtros
        if (filters.numeroDocumento) {
            where += " AND numeroDocumento = @numeroDocumento";
            request.input("numeroDocumento", mssql.NVarChar, filters.numeroDocumento);
        }
        if (filters.fornecedor) {
            where += " AND fornecedor = @fornecedor";
            request.input("fornecedor", mssql.NVarChar, filters.fornecedor);
        }
        if (filters.cadReferenciaId) {
            where += " AND cadReferenciaId = @cadReferenciaId";
            request.input("cadReferenciaId", mssql.NVarChar, filters.cadReferenciaId);
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
                ISNULL(unidadeCompra, '') AS unidadeCompra,
                CAST(ISNULL(quantidade, 0) AS DECIMAL(18,4)) AS quantidade,
                ISNULL(nomeGrupo, '') AS nomeGrupo,
                ISNULL(ultDataExpedicao, '1900-01-01') AS ultDataExpedicao,
                CAST(ISNULL(valorCompraConvertidoKg, 0) AS DECIMAL(18,4)) AS valorCompraConvertidoKg,
                CAST(ISNULL(precoCustoProdutoConvertidoKg, 0) AS DECIMAL(18,4)) AS precoCustoProdutoConvertidoKg,
                ISNULL(lote, '') AS lote,
                ISNULL(lancIdentificador, 0) AS lancIdentificador,
                CAST(ISNULL(fator, 1) AS DECIMAL(18,4)) AS fator,
                CAST(ISNULL(custoPreco, 0) AS DECIMAL(18,4)) AS custoPreco
            FROM IMAGEMUNIFORMES_pBI.dbo.RelatorioCompras
            ${where}
            ORDER BY numeroDocumento, cadReferenciaId
        `;

        const result = await request.query(query);
        return result.recordset;
    } catch (err) {
        console.error('Erro ao buscar dados:', err);
        throw err;
    }
}

// ------------------------
// GET FILTER OPTIONS
// ------------------------
export async function getFilterOptions(filters = {}) {
    try {
        const pool = await connectDB();
        const request = pool.request();

        let where = "WHERE 1=1";
        
        // Aplica filtros para opções
        if (filters.numeroDocumento) {
            where += " AND numeroDocumento = @numeroDocumento";
            request.input("numeroDocumento", mssql.NVarChar, filters.numeroDocumento);
        }
        if (filters.fornecedor) {
            where += " AND fornecedor = @fornecedor";
            request.input("fornecedor", mssql.NVarChar, filters.fornecedor);
        }
        if (filters.cadReferenciaId) {
            where += " AND cadReferenciaId = @cadReferenciaId";
            request.input("cadReferenciaId", mssql.NVarChar, filters.cadReferenciaId);
        }

        const query = `
            SELECT DISTINCT 
                numeroDocumento, 
                fornecedor, 
                cadReferenciaId
            FROM IMAGEMUNIFORMES_pBI.dbo.RelatorioCompras
            ${where}
            ORDER BY numeroDocumento, cadReferenciaId
        `;

        const result = await request.query(query);
        return result.recordset;
    } catch (err) {
        console.error('Erro ao buscar opções de filtro:', err);
        throw err;
    }
}

// ------------------------
// GET BY ID
// ------------------------
export async function getById(id) {
    try {
        const pool = await connectDB();
        const request = pool.request();
        request.input("id", mssql.Int, id);

        const query = `
            SELECT 
                idRelatorioC,
                numeroDocumento,
                emissaoData,
                entregaData,
                fornecedor,
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
                lancIdentificador,
                fator,
                custoPreco
            FROM IMAGEMUNIFORMES_pBI.dbo.RelatorioCompras
            WHERE idRelatorioC = @id
        `;

        const result = await request.query(query);
        return result.recordset[0];
    } catch (err) {
        console.error('Erro ao buscar registro por ID:', err);
        throw err;
    }
}

// ------------------------
// UPDATE BY ID
// ------------------------
export async function updateById(id, data) {
    try {
        const pool = await connectDB();
        const request = pool.request();
        
        request.input("id", mssql.Int, id);

        // Constrói a query de update dinamicamente
        const updateFields = [];
        Object.keys(data).forEach(key => {
            if (data[key] !== undefined) {
                updateFields.push(`[${key}] = @${key}`);
                request.input(key, mssql.NVarChar, data[key]);
            }
        });

        if (updateFields.length === 0) {
            throw new Error('Nenhum campo para atualizar');
        }

        const query = `
            UPDATE IMAGEMUNIFORMES_pBI.dbo.RelatorioCompras
            SET ${updateFields.join(', ')}
            WHERE idRelatorioC = @id
        `;

        const result = await request.query(query);
        return result.rowsAffected[0];
    } catch (err) {
        console.error('Erro ao atualizar registro:', err);
        throw err;
    }
}

// ------------------------
// INSERT MANY
// ------------------------
export async function insertMany(rows) {
    try {
        const pool = await connectDB();
        const transaction = pool.transaction();
        await transaction.begin();

        try {
            for (const row of rows) {
                const request = transaction.request();
                
                // Mapeia os campos do objeto para os parâmetros
                Object.keys(row).forEach(key => {
                    request.input(key, mssql.NVarChar, row[key]);
                });

                const query = `
                    INSERT INTO IMAGEMUNIFORMES_pBI.dbo.RelatorioCompras (
                        numeroDocumento, emissaoData, entregaData, fornecedor,
                        cadReferenciaId, descricaoProduto, descricaoCor, unidadeCompra,
                        quantidade, nomeGrupo, ultDataExpedicao, valorCompraConvertidoKg,
                        precoCustoProdutoConvertidoKg, lote, lancIdentificador, fator, custoPreco
                    ) VALUES (
                        @numeroDocumento, @emissaoData, @entregaData, @fornecedor,
                        @cadReferenciaId, @descricaoProduto, @descricaoCor, @unidadeCompra,
                        @quantidade, @nomeGrupo, @ultDataExpedicao, @valorCompraConvertidoKg,
                        @precoCustoProdutoConvertidoKg, @lote, @lancIdentificador, @fator, @custoPreco
                    )
                `;

                await request.query(query);
            }

            await transaction.commit();
            return { inserted: rows.length };
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (err) {
        console.error('Erro ao inserir registros:', err);
        throw err;
    }
}

// ------------------------
// GENERATE DATA
// ------------------------
export async function generateData() {
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
            return { message: "Registros já existentes, nada inserido" };
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
                    cadGrupoId
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
                    cr.CAD_Grupo_Id AS cadGrupoId
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
                WHERE VPDC.numero_documento = 70178
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

        return { 
            message: "Registros de Compras gerados com sucesso",
            rowsAffected: result.rowsAffected[0]
        };
    } catch (err) {
        console.error('Erro ao gerar dados:', err);
        throw err;
    }
}

export default {
    getAll,
    getFilterOptions,
    getById,
    updateById,
    insertMany,
    generateData
};
