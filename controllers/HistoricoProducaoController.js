// controllers/historico.controller.js (Usando Módulos ES)
import { mssql, connectDB } from '../config/db.js'; // Importação ajustada para 'mssql'

const TABLE_NAME = 'IMAGEMUNIFORMES_pBI.dbo.historico_producao';
const ID_FIELD = 'historico_id';

// --- CREATE (Criar novo registro) ---
export const create = async (req, res) => {
    try {
        const { registro_id, hora, previsto, real, retrabalho, operacao, referencia, TempoPeca, pessoasCelula, tempoAcabamento, pessoaAcabamento, custoFaccao } = req.body;
        const pool = await connectDB();

        const result = await pool.request()
            .input('registro_id', mssql.Int, registro_id)
            .input('hora', mssql.DateTime, hora) // Ajuste o tipo se necessário (ex: Time)
            .input('previsto', mssql.Int, previsto)
            .input('real', mssql.Int, real)
            .input('retrabalho', mssql.Int, retrabalho)
            .input('operacao', mssql.NVarChar, operacao)
            .input('referencia', mssql.NVarChar, referencia)
            .input('TempoPeca', mssql.Decimal(10, 2), TempoPeca) // Usando mssql
            .input('pessoasCelula', mssql.Int, pessoasCelula)
            .input('tempoAcabamento', mssql.Decimal(10, 2), tempoAcabamento)
            .input('pessoaAcabamento', mssql.Int, pessoaAcabamento)
            .input('custoFaccao', mssql.Decimal(10, 2), custoFaccao)
            .query(`
                INSERT INTO ${TABLE_NAME} (registro_id, hora, previsto, [real], retrabalho, operacao, referencia, TempoPeca, pessoasCelula, tempoAcabamento, pessoaAcabamento, custoFaccao, atualizado_em)
                OUTPUT INSERTED.${ID_FIELD}
                VALUES (@registro_id, @hora, @previsto, @real, @retrabalho, @operacao, @referencia, @TempoPeca, @pessoasCelula, @tempoAcabamento, @pessoaAcabamento, @custoFaccao, GETDATE())
            `);

        const newId = result.recordset[0][ID_FIELD];
        res.status(201).send({ message: "Registro criado com sucesso!", historico_id: newId });

    } catch (err) {
        console.error("Erro ao criar registro:", err.message);
        res.status(500).send({ message: "Erro ao criar registro", error: err.message });
    }
};

// --- READ ALL (Ler todos os registros) ---
export const findAll = async (req, res) => {
    try {
        const pool = await connectDB();
        const result = await pool.request().query(`SELECT * FROM ${TABLE_NAME}`);
        res.status(200).send(result.recordset);
    } catch (err) {
        console.error("Erro ao buscar registros:", err.message);
        res.status(500).send({ message: "Erro ao buscar registros", error: err.message });
    }
};


// --- READ ONE (Ler registro por ID) ---
export const findOne = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(400).send({ message: "O ID do histórico é obrigatório." });
        }

        const pool = await connectDB();
        const result = await pool.request()
            .input('historico_id', mssql.Int, id)
            .query(`SELECT * FROM ${TABLE_NAME} WHERE ${ID_FIELD} = @historico_id`);

        if (result.recordset.length === 0) {
            return res.status(404).send({ message: `Registro com id=${id} não encontrado.` });
        }

        res.status(200).send(result.recordset[0]);

    } catch (err) {
        console.error("Erro ao buscar registro:", err.message);
        res.status(500).send({ message: "Erro ao buscar registro", error: err.message });
    }
};

// --- UPDATE (Atualizar registro) ---
export const update = async (req, res) => {
    try {
        const id = req.params.id;
        const data = req.body;
        
        if (!id) {
            return res.status(400).send({ message: "O ID do histórico é obrigatório para atualização." });
        }

        const pool = await connectDB();
        const request = pool.request().input('historico_id', mssql.Int, id);
        
        let setClauses = [];
        const updatableFields = ['registro_id', 'hora', 'previsto', 'real', 'retrabalho', 'operacao', 'referencia', 'TempoPeca', 'pessoasCelula', 'tempoAcabamento', 'pessoaAcabamento', 'custoFaccao'];
        let updatedCount = 0;

        for (const field of updatableFields) {
            if (data[field] !== undefined) {
                let type;
                if (['registro_id', 'previsto', 'real', 'retrabalho', 'pessoasCelula', 'pessoaAcabamento'].includes(field)) {
                    type = mssql.Int;
                } else if (['TempoPeca', 'tempoAcabamento', 'custoFaccao'].includes(field)) {
                    type = mssql.Decimal(10, 2); 
                } else if (field === 'hora') {
                    type = mssql.DateTime; 
                } else {
                    type = mssql.NVarChar;
                }
                
                request.input(field, type, data[field]);
                setClauses.push(`[${field}] = @${field}`);
                updatedCount++;
            }
        }
        
        if (updatedCount === 0) {
            return res.status(400).send({ message: "Nenhum campo válido para atualização fornecido." });
        }

        setClauses.push(`atualizado_em = GETDATE()`);

        const query = `
            UPDATE ${TABLE_NAME} 
            SET ${setClauses.join(', ')} 
            WHERE ${ID_FIELD} = @historico_id
        `;

        const result = await request.query(query);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).send({ message: `Registro com id=${id} não encontrado.` });
        }

        res.status(200).send({ message: "Registro atualizado com sucesso!", rowsAffected: result.rowsAffected[0] });

    } catch (err) {
        console.error("Erro ao atualizar registro:", err.message);
        res.status(500).send({ message: "Erro ao atualizar registro", error: err.message });
    }
};

// --- DELETE (Deletar registro) ---
export const deleteRegistro = async (req, res) => { 
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(400).send({ message: "O ID do histórico é obrigatório para exclusão." });
        }

        const pool = await connectDB();
        const result = await pool.request()
            .input('historico_id', mssql.Int, id)
            .query(`DELETE FROM ${TABLE_NAME} WHERE ${ID_FIELD} = @historico_id`);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).send({ message: `Registro com id=${id} não encontrado.` });
        }

        res.status(200).send({ message: "Registro excluído com sucesso!" });

    } catch (err) {
        console.error("Erro ao excluir registro:", err.message);
        res.status(500).send({ message: "Erro ao excluir registro", error: err.message });
    }
};