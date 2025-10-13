import express from "express";
import { connectDB, mssql } from "../config/db.js";

const router = express.Router();

const tables = [
  {
    name: "modelo",
    fields: ["nome", "criadoEM", "idModelo"],
    filtros: ["idModelo", "nome"]
  },
  {
    name: "peca",
    fields: ["nome", "criadoEm", "idModelo"],
    filtros: ["idModelo", "nome"]
  },
  {
    name: "composicao",
    fields: ["Nome", "idPeca", "imagem"],
    filtros: ["idPeca", "Nome"]
  },
  {
    name: "referenciaTP",
    fields: [
      "referencia", "Nome", "tempo", "custoMO", "observacao",
      "valorAReceber", "idDescritivo", "idValidacao", "idPostotrabalho",
      "idPlanejamento", "idCliente"
    ],
    filtros: ["referencia", "Nome"]
  },
  {
    name: "planejamento",
    fields: [
      "eficiencia", "quantPecas", "inicio", "producaoDiaria",
      "diasNecessarios", "termino", "max", "pecasHora", "pecasCaixa"
    ],
    filtros: ["eficiencia", "inicio"]
  },
  {
    name: "postoTrabalho",
    fields: [
      "qtdCostura", "qtdPreparo", "Acabamento", "referencial",
      "ideal", "porcentagem", "floatCol"
    ],
    filtros: ["referencial", "ideal"]
  },
  {
    name: "valicao",
    fields: [
      "componentes", "idMaquinarios", "jornada", "minFac",
      "DiaIndividual", "horasIndividual", "minIndividual"
    ],
    filtros: ["idMaquinarios", "jornada"]
  },
  {
    name: "calculadora",
    fields: [
      "idModelo", "idTecido", "idPeca", "idVariacao",
      "tempoPadrao", "valorDescontado"
    ],
    filtros: ["idModelo", "idTecido"]
  },
  {
    name: "descritivo",
    fields: [
      "idModelo", "idTecido", "nomeAtividade",
      "tempoRelogio", "tempoCent", "postoDeTrabalho"
    ],
    filtros: ["idModelo", "nomeAtividade"]
  },
  {
    name: "tecido",
    fields: ["nome"],
    filtros: ["nome"]
  },
  {
    name: "maquinarios",
    fields: ["idFacao", "nome"],
    filtros: ["idFacao", "nome"]
  }
];

// GET all
tables.forEach(({ name }) => {
  router.get(`/${name}`, async (req, res) => {
    try {
      const pool = await connectDB();
      const result = await pool.request().query(`SELECT * FROM ${name}`);
      res.json(result.recordset);
    } catch (err) {
      res.status(500).json({ error: `Erro ao buscar registros de ${name}` });
    }
  });
});


tables.forEach(({ name, filtros }) => {
  router.get(`/${name}/filtros`, async (req, res) => {
    try {
      const pool = await connectDB();
      const query = `
        SELECT DISTINCT ${filtros.join(", ")}
        FROM ${name}
        ORDER BY ${filtros.join(", ")}
      `;
      const result = await pool.request().query(query);
      res.json(result.recordset);
    } catch (err) {
      res.status(500).json({ error: `Erro ao buscar filtros de ${name}` });
    }
  });
});

// POST (insert)
tables.forEach(({ name, fields }) => {
  router.post(`/${name}`, async (req, res) => {
    try {
      const pool = await connectDB();
      const request = pool.request();
      fields.forEach(field => request.input(field, req.body[field]));
      const query = `
        INSERT INTO ${name} (${fields.join(", ")})
        VALUES (${fields.map(f => "@" + f).join(", ")})
      `;
      await request.query(query);
      res.json({ success: true, message: "Registro inserido com sucesso" });
    } catch (err) {
      res.status(500).json({ error: `Erro ao inserir registro em ${name}` });
    }
  });
});

// PUT (update)
tables.forEach(({ name, fields }) => {
  router.put(`/${name}/:id`, async (req, res) => {
    const { id } = req.params;
    const fieldsBody = req.body;
    const setClauses = Object.keys(fieldsBody)
      .map(key => `[${key}] = @${key}`)
      .join(", ");
    try {
      const pool = await connectDB();
      const request = pool.request();
      request.input("id", mssql.Int, id);
      Object.keys(fieldsBody).forEach(key => request.input(key, fieldsBody[key]));
      const query = `
        UPDATE ${name}
        SET ${setClauses}
        WHERE id = @id
      `;
      await request.query(query);
      res.json({ success: true, message: "Registro atualizado com sucesso" });
    } catch (err) {
      res.status(500).json({ error: `Erro ao atualizar registro em ${name}` });
    }
  });
});

// DELETE
tables.forEach(({ name }) => {
  router.delete(`/${name}/:id`, async (req, res) => {
    const { id } = req.params;
    try {
      const pool = await connectDB();
      const request = pool.request();
      request.input("id", mssql.Int, id);
      await request.query(`DELETE FROM ${name} WHERE id = @id`);
      res.json({ success: true, message: "Registro excluído com sucesso" });
    } catch (err) {
      res.status(500).json({ error: `Erro ao excluir registro em ${name}` });
    }
  });
});

export default router;