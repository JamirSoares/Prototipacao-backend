import express from "express";
import { connectDB, mssql } from "../config/db.js";
import multer from "multer";
import path from "path";

const router = express.Router();
// Upload configuration for variation images
const assetsDir = path.resolve(process.cwd(), 'config', 'assets');
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, assetsDir),
  filename: (req, file, cb) => {
    try {
      const nomeVar = String(req.body.nome || 'variacao').replace(/[^a-z0-9-_]/gi, '_');
      const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
      cb(null, `${nomeVar}${ext}`);
    } catch {
      cb(null, `variacao_${Date.now()}.jpg`);
    }
  }
});
const upload = multer({ storage });

// Helpers
const ok = (res, data) => res.json(data);
const err500 = (res, msg, err) => {
  console.error(msg, err);
  res.status(500).json({ error: msg });
};

// ===== imagem_modelo_tp =====
router.get("/modelo", async (_req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request().query(
      "SELECT id, nome, id_modelo FROM dbo.imagem_modelo_tp ORDER BY id DESC"
    );
    ok(res, result.recordset);
  } catch (e) {
    err500(res, "Erro ao listar modelos", e);
  }
});

router.get("/modelo/:id", async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input("id", mssql.Int, Number(req.params.id))
      .query("SELECT id, nome, id_modelo FROM dbo.imagem_modelo_tp WHERE id=@id");
    if (result.recordset.length === 0) return res.status(404).json({ error: "Modelo não encontrado" });
    ok(res, result.recordset[0]);
  } catch (e) {
    err500(res, "Erro ao buscar modelo", e);
  }
});

router.post("/modelo", async (req, res) => {
  const { nome, id_modelo } = req.body;
  try {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input("nome", mssql.VarChar(99), nome ?? null)
      .input("id_modelo", mssql.Int, id_modelo ?? null)
      .query("INSERT IntO dbo.imagem_modelo_tp (nome, id_modelo) OUTPUT INSERTED.* VALUES (@nome, @id_modelo)");
    ok(res, result.recordset[0]);
  } catch (e) {
    err500(res, "Erro ao criar modelo", e);
  }
});

router.put("/modelo/:id", async (req, res) => {
  const { nome, id_modelo } = req.body;
  try {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input("id", mssql.Int, Number(req.params.id))
      .input("nome", mssql.VarChar(99), nome ?? null)
      .input("id_modelo", mssql.Int, id_modelo ?? null)
      .query("UPDATE dbo.imagem_modelo_tp SET nome=@nome, id_modelo=@id_modelo WHERE id=@id; SELECT * FROM dbo.imagem_modelo_tp WHERE id=@id");
    ok(res, result.recordset[0] ?? null);
  } catch (e) {
    err500(res, "Erro ao atualizar modelo", e);
  }
});

router.delete("/modelo/:id", async (req, res) => {
  try {
    const pool = await connectDB();
    await pool.request().input("id", mssql.Int, Number(req.params.id)).query("DELETE FROM dbo.imagem_modelo_tp WHERE id=@id");
    ok(res, { success: true });
  } catch (e) {
    err500(res, "Erro ao remover modelo", e);
  }
});

// ===== imagem_peca_tp =====
router.get("/peca", async (req, res) => {
  try {
    const pool = await connectDB();
    const request = pool.request();
    const { modeloId } = req.query;
    let query =
      "SELECT id, nome, tempo_padrao, valor_desconto, id_peca, id_modelo FROM dbo.imagem_peca_tp";
    if (modeloId) {
      request.input("modeloId", mssql.Int, Number(modeloId));
      query += " WHERE id_modelo=@modeloId";
    }
    query += " ORDER BY id DESC";
    const result = await request.query(query);
    ok(res, result.recordset);
  } catch (e) {
    err500(res, "Erro ao listar peças", e);
  }
});

router.get("/peca/:id", async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input("id", mssql.Int, Number(req.params.id))
      .query("SELECT id, nome, tempo_padrao, valor_desconto, id_peca, id_modelo FROM dbo.imagem_peca_tp WHERE id=@id");
    if (result.recordset.length === 0) return res.status(404).json({ error: "Peça não encontrada" });
    ok(res, result.recordset[0]);
  } catch (e) {
    err500(res, "Erro ao buscar peça", e);
  }
});

router.post("/peca", async (req, res) => {
  const { nome, tempo_padrao, valor_desconto, id_peca, id_modelo } = req.body;
  try {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input("nome", mssql.VarChar(99), nome ?? null)
      .input("tempo_padrao", mssql.Float, tempo_padrao ?? null)
      .input("valor_desconto", mssql.Float, valor_desconto ?? null)
      .input("id_peca", mssql.Int, id_peca ?? null)
      .input("id_modelo", mssql.Int, id_modelo ?? null)
      .query(
        "INSERT IntO dbo.imagem_peca_tp (nome, tempo_padrao, valor_desconto, id_peca, id_modelo) OUTPUT INSERTED.* VALUES (@nome, @tempo_padrao, @valor_desconto, @id_peca, @id_modelo)"
      );
    ok(res, result.recordset[0]);
  } catch (e) {
    err500(res, "Erro ao criar peça", e);
  }
});

router.put("/peca/:id", async (req, res) => {
  const { nome, tempo_padrao, valor_desconto, id_peca, id_modelo } = req.body;
  try {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input("id", mssql.Int, Number(req.params.id))
      .input("nome", mssql.VarChar(99), nome ?? null)
      .input("tempo_padrao", mssql.Float, tempo_padrao ?? null)
      .input("valor_desconto", mssql.Float, valor_desconto ?? null)
      .input("id_peca", mssql.Int, id_peca ?? null)
      .input("id_modelo", mssql.Int, id_modelo ?? null)
      .query(
        "UPDATE dbo.imagem_peca_tp SET nome=@nome, tempo_padrao=@tempo_padrao, valor_desconto=@valor_desconto, id_peca=@id_peca, id_modelo=@id_modelo WHERE id=@id; SELECT * FROM dbo.imagem_peca_tp WHERE id=@id"
      );
    ok(res, result.recordset[0] ?? null);
  } catch (e) {
    err500(res, "Erro ao atualizar peça", e);
  }
});

router.delete("/peca/:id", async (req, res) => {
  try {
    const pool = await connectDB();
    await pool.request().input("id", mssql.Int, Number(req.params.id)).query("DELETE FROM dbo.imagem_peca_tp WHERE id=@id");
    ok(res, { success: true });
  } catch (e) {
    err500(res, "Erro ao remover peça", e);
  }
});

// ===== imagem_variacao_tp =====
router.get("/variacao", async (req, res) => {
  try {
    const pool = await connectDB();
    const request = pool.request();
    const { pecaId } = req.query;
    let query = "SELECT id, nome, id_peca, img_path FROM dbo.imagem_variacao_tp";
    if (pecaId) {
      request.input("pecaId", mssql.Int, Number(pecaId));
      query += " WHERE id_peca=@pecaId";
    }
    query += " ORDER BY id DESC";
    const result = await request.query(query);
    ok(res, result.recordset);
  } catch (e) {
    err500(res, "Erro ao listar variações", e);
  }
});

router.get("/variacao/:id", async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input("id", mssql.Int, Number(req.params.id))
      .query("SELECT id, nome, id_peca, img_path FROM dbo.imagem_variacao_tp WHERE id=@id");
    if (result.recordset.length === 0) return res.status(404).json({ error: "Variação não encontrada" });
    ok(res, result.recordset[0]);
  } catch (e) {
    err500(res, "Erro ao buscar variação", e);
  }
});

router.post("/variacao", upload.single('imagem'), async (req, res) => {
  const { nome, id_peca } = req.body;
  try {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input("nome", mssql.VarChar(99), nome ?? null)
      .input("id_peca", mssql.Int, id_peca ?? null)
      .input("img_path", mssql.VarChar(255), req.file ? `/assets/${req.file.filename}` : null)
      .query("INSERT IntO dbo.imagem_variacao_tp (nome, id_peca, img_path) OUTPUT INSERTED.* VALUES (@nome, @id_peca, @img_path)");
    ok(res, result.recordset[0]);
  } catch (e) {
    err500(res, "Erro ao criar variação", e);
  }
});

router.put("/variacao/:id", upload.single('imagem'), async (req, res) => {
  const { nome, id_peca } = req.body;
  try {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input("id", mssql.Int, Number(req.params.id))
      .input("nome", mssql.VarChar(99), nome ?? null)
      .input("id_peca", mssql.Int, id_peca ?? null)
      .input("img_path", mssql.VarChar(255), req.file ? `/assets/${req.file.filename}` : null)
      .query("UPDATE dbo.imagem_variacao_tp SET nome=@nome, id_peca=@id_peca, img_path=COALESCE(@img_path, img_path) WHERE id=@id; SELECT * FROM dbo.imagem_variacao_tp WHERE id=@id");
    ok(res, result.recordset[0] ?? null);
  } catch (e) {
    err500(res, "Erro ao atualizar variação", e);
  }
});

router.delete("/variacao/:id", async (req, res) => {
  try {
    const pool = await connectDB();
    await pool.request().input("id", mssql.Int, Number(req.params.id)).query("DELETE FROM dbo.imagem_variacao_tp WHERE id=@id");
    ok(res, { success: true });
  } catch (e) {
    err500(res, "Erro ao remover variação", e);
  }
});

// ===== imagem_planejamento_tp =====
router.get("/planejamento", async (_req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request().query(
      "SELECT id, costura, preparo, acabamento, ideal, func, ideal_func, carga FROM dbo.imagem_planejamento_tp ORDER BY id DESC"
    );
    ok(res, result.recordset);
  } catch (e) {
    err500(res, "Erro ao listar planejamentos", e);
  }
});

router.get("/planejamento/:id", async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input("id", mssql.Int, Number(req.params.id))
      .query(
        "SELECT id, costura, preparo, acabamento, ideal, func, ideal_func, carga FROM dbo.imagem_planejamento_tp WHERE id=@id"
      );
    if (result.recordset.length === 0) return res.status(404).json({ error: "Planejamento não encontrado" });
    ok(res, result.recordset[0]);
  } catch (e) {
    err500(res, "Erro ao buscar planejamento", e);
  }
});

router.post("/planejamento", async (req, res) => {
  const { costura, preparo, acabamento, ideal, func, ideal_func, carga } = req.body;
  console.log('🔵 [POST /planejamento] Iniciando criação de planejamento');
  console.log('📥 Body recebido:', JSON.stringify(req.body, null, 2));
  
  try {
    const pool = await connectDB();
    const query = "INSERT IntO dbo.imagem_planejamento_tp (costura, preparo, acabamento, ideal, func, ideal_func, carga) OUTPUT INSERTED.* VALUES (@costura, @preparo, @acabamento, @ideal, @func, @ideal_func, @carga)";
    console.log('📝 SQL Query:', query);
    console.log('🔍 Parâmetros:', { costura, preparo, acabamento, ideal, func, ideal_func, carga });
    
    // Helpers para parse
    const toInt = (v) => (v === undefined || v === null || v === "" ? null : Number.parseInt(v, 10));
    const toFloat = (v) => (v === undefined || v === null || v === "" ? null : Number.parseFloat(v));

    const result = await pool
      .request()
      .input("costura", mssql.Int, toInt(costura))
      .input("preparo", mssql.Int, toInt(preparo))
      .input("acabamento", mssql.Int, toInt(acabamento))
      .input("ideal", mssql.Float, toFloat(ideal))
      .input("func", mssql.Int, toInt(func))
      .input("ideal_func", mssql.Float, toFloat(ideal_func))
      .input("carga", mssql.Float, toFloat(carga))
      .query(query);
    
    console.log('✅ Planejamento criado com sucesso:', result.recordset[0]);
    ok(res, result.recordset[0]);
  } catch (e) {
    console.log('❌ [POST /planejamento] Erro ao criar planejamento:', e.message);
    console.log('🔍 Detalhes do erro:', e);
    err500(res, "Erro ao criar planejamento", e);
  }
});

router.put("/planejamento/:id", async (req, res) => {
  const { costura, preparo, acabamento, ideal, func, ideal_func, carga } = req.body;
  console.log('🔵 [PUT /planejamento/:id] Atualizando planejamento');
  console.log('📥 Body recebido:', JSON.stringify(req.body, null, 2));
  
  try {
    const pool = await connectDB();
    
    // Helpers para parse
    const toInt = (v) => (v === undefined || v === null || v === "" ? null : Number.parseInt(v, 10));
    const toFloat = (v) => (v === undefined || v === null || v === "" ? null : Number.parseFloat(v));
    
    const query = "UPDATE dbo.imagem_planejamento_tp SET costura=@costura, preparo=@preparo, acabamento=@acabamento, ideal=@ideal, func=@func, ideal_func=@ideal_func, carga=@carga WHERE id=@id; SELECT * FROM dbo.imagem_planejamento_tp WHERE id=@id";
    console.log('📝 SQL Query:', query);
    console.log('🔍 Parâmetros:', { id: Number(req.params.id), costura, preparo, acabamento, ideal, func, ideal_func, carga });
    
    const result = await pool
      .request()
      .input("id", mssql.Int, Number(req.params.id))
      .input("costura", mssql.Int, toInt(costura))
      .input("preparo", mssql.Int, toInt(preparo))
      .input("acabamento", mssql.Int, toInt(acabamento))
      .input("ideal", mssql.Float, toFloat(ideal))
      .input("func", mssql.Int, toInt(func))
      .input("ideal_func", mssql.Float, toFloat(ideal_func))
      .input("carga", mssql.Float, toFloat(carga))
      .query(query);
    
    console.log('✅ Planejamento atualizado com sucesso:', result.recordset[0]);
    ok(res, result.recordset[0] ?? null);
  } catch (e) {
    console.log('❌ [PUT /planejamento/:id] Erro ao atualizar planejamento:', e.message);
    console.log('🔍 Detalhes do erro:', e);
    err500(res, "Erro ao atualizar planejamento", e);
  }
});

router.delete("/planejamento/:id", async (req, res) => {
  try {
    const pool = await connectDB();
    await pool.request().input("id", mssql.Int, Number(req.params.id)).query("DELETE FROM dbo.imagem_planejamento_tp WHERE id=@id");
    ok(res, { success: true });
  } catch (e) {
    err500(res, "Erro ao remover planejamento", e);
  }
});

// ===== imagem_processo_tp =====
// For simplicity, we expose full CRUD; due to many columns, keep 1:1 mapping.

router.get("/processo", async (_req, res) => {
  console.log('🔵 [GET /processo] Listando processos');
  try {
    const pool = await connectDB();
    const query = `SELECT id, nome_ref, cliente_id, tempo, custo_mo, plan_tipo_plan, plan_eficiencia, plan_qtd_pecas, plan_incio, plan_prod_diarias, plan_dias_necessarios, plan_termino, plan_max, plan_pecas_hora, plan_pecas_caixa, val_nome, val_componentes, val_maquinarios_id, val_jornada, val_total_ind, val_total_fac, val_dia_ind, val_dia_fac, val_horas_ind, val_horas_fac, val_min_ind, val_min_fac, val_descricao_modelo, val_modelo_id, val_tecido_id, val_parte_peca_id, val_variacao_id FROM dbo.imagem_processo_tp ORDER BY id DESC`;
    console.log('📝 SQL Query:', query);
    const result = await pool.request().query(query);
    console.log('✅ Processos listados com sucesso:', result.recordset.length, 'registros');
    ok(res, result.recordset);
  } catch (e) {
    console.log('❌ [GET /processo] Erro ao listar processos:', e.message);
    console.log('🔍 Detalhes do erro:', e);
    err500(res, "Erro ao listar processos", e);
  }
});

router.get("/processo/:id", async (req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool
      .request()
      .input("id", mssql.Int, Number(req.params.id))
      .query(
        `SELECT id, nome_ref, cliente_id, tempo, custo_mo, plan_tipo_plan, plan_eficiencia, plan_qtd_pecas, plan_incio, plan_prod_diarias, plan_dias_necessarios, plan_termino, plan_max, plan_pecas_hora, plan_pecas_caixa, val_nome, val_componentes, val_maquinarios_id, val_jornada, val_total_ind, val_total_fac, val_dia_ind, val_dia_fac, val_horas_ind, val_horas_fac, val_min_ind, val_min_fac, val_descricao_modelo, val_modelo_id, val_tecido_id, val_parte_peca_id, val_variacao_id FROM dbo.imagem_processo_tp WHERE id=@id`
      );
    if (result.recordset.length === 0) return res.status(404).json({ error: "Processo não encontrado" });
    ok(res, result.recordset[0]);
  } catch (e) {
    err500(res, "Erro ao buscar processo", e);
  }
});

router.post("/processo", async (req, res) => {
  const body = req.body ?? {};
  console.log('🔵 [POST /processo] Iniciando criação de processo');
  console.log('📥 Body recebido:', JSON.stringify(body, null, 2));
  try {
    const pool = await connectDB();
    const r = pool.request();

    // Helpers para parse
    const toInt = (v) => (v === undefined || v === null || v === "" ? null : Number.parseInt(v, 10));
    const toFloat = (v) => {
      if (v === undefined || v === null || v === "") return null;
      const s = typeof v === "string" ? v.replace(/,/g, ".") : v;
      const n = Number.parseFloat(s);
      return Number.isNaN(n) ? null : n;
    };
    const toDate = (v) => {
      if (!v) return null;
      const d = new Date(v);
      return Number.isNaN(d.getTime()) ? null : d;
    };

    const plan_incio = toFloat(body.plan_inicio ?? body.plan_incio);

    // ===== Cálculos de fórmulas (autoritativo no backend)
    const CUSTO_MINUTO = body.custo_minuto ? Number(String(body.custo_minuto).replace(',', '.')) : 0.37;
    const JORNADA_MINUTOS = body.jornada_minutos ? Number(body.jornada_minutos) : 513; // 08:33
    const tempoMinPorPeca = toFloat(body.tempo) ?? 0;
    const eficiencia = (toFloat(body.plan_eficiencia) ?? 0) / 100;
    const tipoPlano = String(body.plan_tipo_plan ?? "1"); // 1 Interna, 2 Externa
    const qtdPecas = toFloat(body.plan_qtd_pecas) ?? 0;
    const pecasPorCaixaDia = toFloat(body.plan_pecas_caixa) ?? 0;
    const funcColab = toInt(body.func) ?? toInt(body.plan_func) ?? 1;

    let custo_mo = null;
    if (tempoMinPorPeca > 0) custo_mo = tempoMinPorPeca * CUSTO_MINUTO;

    let plan_pecas_hora = null;
    if (tempoMinPorPeca > 0) {
      const ph = (60 / tempoMinPorPeca) * (eficiencia > 0 ? eficiencia : 1);
      plan_pecas_hora = Math.round(ph);
    }

    let plan_prod_diarias = null;
    if (tipoPlano === "2") {
      plan_prod_diarias = pecasPorCaixaDia ? Math.round(pecasPorCaixaDia) : null;
    } else if (plan_pecas_hora) {
      const prod = plan_pecas_hora * (JORNADA_MINUTOS / 60) * (funcColab || 1);
      plan_prod_diarias = Math.round(prod);
    }

    let plan_dias_necessarios = null;
    if (plan_prod_diarias && plan_prod_diarias > 0 && qtdPecas && qtdPecas > 0) {
      plan_dias_necessarios = Math.ceil(qtdPecas / plan_prod_diarias);
    }

    let plan_termino = null;
    if (plan_dias_necessarios && (body.plan_inicio || body.plan_incio)) {
      const raw = body.plan_inicio ?? body.plan_incio;
      let baseDate = new Date(raw);
      if (Number.isNaN(baseDate.getTime())) {
        const m = String(raw).match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (m) baseDate = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
      }
      if (!Number.isNaN(baseDate.getTime())) {
        const d = new Date(baseDate);
        d.setDate(d.getDate() + Number(plan_dias_necessarios));
        plan_termino = d;
      }
    }

    // Bind all fields (nullable) com normalização
    r.input("nome_ref", mssql.VarChar(99), body.nome_ref ?? null);
    r.input("cliente_id", mssql.Int, body.cliente_id ?? null);
    r.input("tempo", mssql.Int, toInt(body.tempo));
    r.input("custo_mo", mssql.Float, custo_mo);
    r.input("plan_tipo_plan", mssql.Float, toFloat(body.plan_tipo_plan));
    r.input("plan_eficiencia", mssql.VarChar(99), body.plan_eficiencia ?? null);
    r.input("plan_qtd_pecas", mssql.Float, toFloat(body.plan_qtd_pecas));
    r.input("plan_incio", mssql.Float, plan_incio);
    r.input("plan_prod_diarias", mssql.Float, plan_prod_diarias);
    r.input("plan_dias_necessarios", mssql.Int, plan_dias_necessarios);
    r.input("plan_termino", mssql.DateTime, plan_termino);
    r.input("plan_max", mssql.DateTime, toDate(body.plan_max));
    r.input("plan_pecas_hora", mssql.Int, plan_pecas_hora);
    r.input("plan_pecas_caixa", mssql.Float, toFloat(body.plan_pecas_caixa));
    r.input("val_nome", mssql.VarChar(99), body.val_nome ?? null);
    r.input("val_componentes", mssql.VarChar(99), body.val_componentes ?? null);
    r.input("val_maquinarios_id", mssql.Int, toInt(body.val_maquinarios_id));
    r.input("val_jornada", mssql.Int, toInt(body.val_jornada));
    r.input("val_total_ind", mssql.VarChar(99), body.val_total_ind ?? null);
    r.input("val_total_fac", mssql.VarChar(99), body.val_total_fac ?? null);
    r.input("val_dia_ind", mssql.VarChar(99), body.val_dia_ind ?? null);
    r.input("val_dia_fac", mssql.VarChar(99), body.val_dia_fac ?? null);
    r.input("val_horas_ind", mssql.VarChar(99), body.val_horas_ind ?? null);
    r.input("val_horas_fac", mssql.VarChar(99), body.val_horas_fac ?? null);
    r.input("val_min_ind", mssql.VarChar(99), body.val_min_ind ?? null);
    r.input("val_min_fac", mssql.VarChar(99), body.val_min_fac ?? null);
    r.input("val_descricao_modelo", mssql.VarChar(99), body.val_descricao_modelo ?? null);
    r.input("val_modelo_id", mssql.Int, toInt(body.val_modelo_id));
    r.input("val_tecido_id", mssql.Int, toInt(body.val_tecido_id));
    r.input("val_parte_peca_id", mssql.Int, toInt(body.val_parte_peca_id));
    r.input("val_variacao_id", mssql.Int, toInt(body.val_variacao_id));

    const insertSql = `
      INSERT IntO dbo.imagem_processo_tp (
        nome_ref, cliente_id, tempo, custo_mo, plan_tipo_plan, plan_eficiencia, plan_qtd_pecas, plan_incio,
        plan_prod_diarias, plan_dias_necessarios, plan_termino, plan_max, plan_pecas_hora, plan_pecas_caixa, val_nome,
        val_componentes, val_maquinarios_id, val_jornada, val_total_ind, val_total_fac, val_dia_ind, val_dia_fac,
        val_horas_ind, val_horas_fac, val_min_ind, val_min_fac, val_descricao_modelo, val_modelo_id, val_tecido_id,
        val_parte_peca_id, val_variacao_id
      )
      OUTPUT INSERTED.*
      VALUES (
        @nome_ref, @cliente_id, @tempo, @custo_mo, @plan_tipo_plan, @plan_eficiencia, @plan_qtd_pecas, @plan_incio,
        @plan_prod_diarias, @plan_dias_necessarios, @plan_termino, @plan_max, @plan_pecas_hora, @plan_pecas_caixa, @val_nome,
        @val_componentes, @val_maquinarios_id, @val_jornada, @val_total_ind, @val_total_fac, @val_dia_ind, @val_dia_fac,
        @val_horas_ind, @val_horas_fac, @val_min_ind, @val_min_fac, @val_descricao_modelo, @val_modelo_id, @val_tecido_id,
        @val_parte_peca_id, @val_variacao_id
      )`;
    
    console.log('📝 SQL Query:', insertSql);
    console.log('🔍 Parâmetros principais:', {
      nome_ref: body.nome_ref,
      cliente_id: toInt(body.cliente_id),
      tempo: toInt(body.tempo),
      val_nome: body.val_nome
    });
    
    const result = await r.query(insertSql);
    console.log('✅ Processo criado com sucesso:', result.recordset[0]);
    ok(res, result.recordset[0]);
  } catch (e) {
    console.log('❌ [POST /processo] Erro ao criar processo:', e.message);
    console.log('🔍 Detalhes do erro:', e);
    err500(res, "Erro ao criar processo", e);
  }
});

router.put("/processo/:id", async (req, res) => {
  const body = req.body ?? {};
  try {
    const pool = await connectDB();
    const r = pool.request();

    // Helpers para parse
    const toInt = (v) => (v === undefined || v === null || v === "" ? null : Number.parseInt(v, 10));
    const toFloat = (v) => {
      if (v === undefined || v === null || v === "") return null;
      const s = typeof v === "string" ? v.replace(/,/g, ".") : v;
      const n = Number.parseFloat(s);
      return Number.isNaN(n) ? null : n;
    };
    const toDate = (v) => {
      if (!v) return null;
      const d = new Date(v);
      return Number.isNaN(d.getTime()) ? null : d;
    };

    const plan_incio = toFloat(body.plan_inicio ?? body.plan_incio);

    r.input("id", mssql.Int, Number(req.params.id));
    r.input("nome_ref", mssql.VarChar(99), body.nome_ref ?? null);
    r.input("cliente_id", mssql.Int, body.cliente_id ?? null);
    r.input("tempo", mssql.Int, toInt(body.tempo));
    r.input("custo_mo", mssql.Float, toFloat(body.custo_mo));
    r.input("plan_tipo_plan", mssql.Float, toFloat(body.plan_tipo_plan));
    r.input("plan_eficiencia", mssql.VarChar(99), body.plan_eficiencia ?? null);
    r.input("plan_qtd_pecas", mssql.Float, toFloat(body.plan_qtd_pecas));
    r.input("plan_incio", mssql.Float, plan_incio);
    r.input("plan_prod_diarias", mssql.DateTime, toDate(body.plan_prod_diarias));
    r.input("plan_dias_necessarios", mssql.Int, toInt(body.plan_dias_necessarios));
    r.input("plan_termino", mssql.Float, toFloat(body.plan_termino));
    r.input("plan_max", mssql.DateTime, toDate(body.plan_max));
    r.input("plan_pecas_hora", mssql.Int, toInt(body.plan_pecas_hora));
    r.input("plan_pecas_caixa", mssql.Float, toFloat(body.plan_pecas_caixa));
    r.input("val_nome", mssql.VarChar(99), body.val_nome ?? null);
    r.input("val_componentes", mssql.VarChar(99), body.val_componentes ?? null);
    r.input("val_maquinarios_id", mssql.Int, toInt(body.val_maquinarios_id));
    r.input("val_jornada", mssql.Int, toInt(body.val_jornada));
    r.input("val_total_ind", mssql.VarChar(99), body.val_total_ind ?? null);
    r.input("val_total_fac", mssql.VarChar(99), body.val_total_fac ?? null);
    r.input("val_dia_ind", mssql.VarChar(99), body.val_dia_ind ?? null);
    r.input("val_dia_fac", mssql.VarChar(99), body.val_dia_fac ?? null);
    r.input("val_horas_ind", mssql.VarChar(99), body.val_horas_ind ?? null);
    r.input("val_horas_fac", mssql.VarChar(99), body.val_horas_fac ?? null);
    r.input("val_min_ind", mssql.VarChar(99), body.val_min_ind ?? null);
    r.input("val_min_fac", mssql.VarChar(99), body.val_min_fac ?? null);
    r.input("val_descricao_modelo", mssql.VarChar(99), body.val_descricao_modelo ?? null);
    r.input("val_modelo_id", mssql.Int, toInt(body.val_modelo_id));
    r.input("val_tecido_id", mssql.Int, toInt(body.val_tecido_id));
    r.input("val_parte_peca_id", mssql.Int, toInt(body.val_parte_peca_id));
    r.input("val_variacao_id", mssql.Int, toInt(body.val_variacao_id));

    const updateSql = `
      UPDATE dbo.imagem_processo_tp SET
        nome_ref=@nome_ref, cliente_id=@cliente_id, tempo=@tempo, custo_mo=@custo_mo, plan_tipo_plan=@plan_tipo_plan,
        plan_eficiencia=@plan_eficiencia, plan_qtd_pecas=@plan_qtd_pecas, plan_incio=@plan_incio, plan_prod_diarias=@plan_prod_diarias,
        plan_dias_necessarios=@plan_dias_necessarios, plan_termino=@plan_termino, plan_max=@plan_max, plan_pecas_hora=@plan_pecas_hora,
        plan_pecas_caixa=@plan_pecas_caixa, nome=@nome, val_componentes=@val_componentes, val_maquinarios_id=@val_maquinarios_id,
        val_jornada=@val_jornada, val_total_ind=@val_total_ind, val_total_fac=@val_total_fac, val_dia_ind=@val_dia_ind,
        val_dia_fac=@val_dia_fac, val_horas_ind=@val_horas_ind, val_horas_fac=@val_horas_fac, val_min_ind=@val_min_ind,
        val_min_fac=@val_min_fac, val_descricao_modelo=@val_descricao_modelo, val_modelo_id=@val_modelo_id, val_tecido_id=@val_tecido_id,
        val_parte_peca_id=@val_parte_peca_id, val_variacao_id=@val_variacao_id
      WHERE id=@id;
      SELECT * FROM dbo.imagem_processo_tp WHERE id=@id`;
    const result = await r.query(updateSql);
    ok(res, result.recordset[0] ?? null);
  } catch (e) {
    err500(res, "Erro ao atualizar processo", e);
  }
});

router.delete("/processo/:id", async (req, res) => {
  try {
    const pool = await connectDB();
    await pool.request().input("id", mssql.Int, Number(req.params.id)).query("DELETE FROM dbo.imagem_processo_tp WHERE id=@id");
    ok(res, { success: true });
  } catch (e) {
    err500(res, "Erro ao remover processo", e);
  }
});

// ===== clientes (dropdown) =====
router.get("/clientes", async (_req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request().query(
      `SELECT 
    MIN(cec.CAD_Grupo_Negocio_Id) AS id,
    cgn.Grupo_Negocio AS [cliente]
FROM CAD_Empresa_Cliente cec
INNER JOIN CAD_Grupo_Negocio cgn 
    ON cec.CAD_Grupo_Negocio_Id = cgn.CAD_Grupo_Negocio_Id
GROUP BY 
    cgn.Grupo_Negocio
order by cgn.grupo_negocio`
    );
    ok(res, result.recordset);
  } catch (e) {
    err500(res, "Erro ao listar clientes", e);
  }
});

// ===== tecidos (lookup) =====
router.get("/tecidos", async (_req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool
      .request()
      .query("SELECT id, nome FROM dbo.tecido ORDER BY nome");
    ok(res, result.recordset);
  } catch (e) {
    err500(res, "Erro ao listar tecidos", e);
  }
});

// ===== maquinarios (lookup) =====
router.get("/maquinarios", async (_req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool
      .request()
      .query("SELECT id, nome FROM dbo.maquinarios ORDER BY nome");
    ok(res, result.recordset);
  } catch (e) {
    err500(res, "Erro ao listar maquinarios", e);
  }
});

// ===== CALCULADORA =====
router.get("/calculadora", async (_req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request().query(
      "SELECT * FROM dbo.calculadora ORDER BY id DESC"
    );
    ok(res, result.recordset);
  } catch (e) {
    err500(res, "Erro ao listar calculadora", e);
  }
});

router.post("/calculadora", async (req, res) => {
  const b = req.body ?? {};
  try {
    const pool = await connectDB();
    const r = pool.request();
    const toInt = (v) => (v === undefined || v === null || v === "" ? null : Number.parseInt(v, 10));
    const toFloat = (v) => {
      if (v === undefined || v === null || v === "") return null;
      const s = typeof v === "string" ? v.replace(/,/g, ".") : v;
      const n = Number.parseFloat(s);
      return Number.isNaN(n) ? null : n;
    };
    const CUSTO_MINUTO = 0.37;

    const tempoPadrao = toFloat(b.tempo_padrao) ?? 0;
    const valorDesc = toFloat(b.valor_desconto) ?? 0;
    const tempoFinal = tempoPadrao && valorDesc !== null ? Math.max(tempoPadrao - valorDesc, 0) : null;
    const custo = tempoFinal ? tempoFinal * CUSTO_MINUTO : null;
    const pecasHora = tempoFinal && tempoFinal > 0 ? Math.round(60 / tempoFinal) : null;

    r.input("idModelo", mssql.Int, toInt(b.id_modelo));
    r.input("idTecido", mssql.Int, toInt(b.id_tecido));
    r.input("idPeca", mssql.Int, toInt(b.id_peca));
    r.input("idVariacao", mssql.Int, toInt(b.id_variacao));
    r.input("tempoPadrao", mssql.Float, tempoPadrao);
    r.input("valorDescontado", mssql.Float, valorDesc);
    r.input("tempoFinal", mssql.Float, tempoFinal);
    r.input("custoMin", mssql.Float, custo);
    r.input("pecasHora", mssql.Int, pecasHora);

    const sql = `INSERT IntO dbo.calculadora (idModelo, idTecido, idPeca, idVariacao, tempoPadrao, valorDescontado, tempoFinal, custoMin, pecasHora)
                 OUTPUT INSERTED.*
                 VALUES (@idModelo, @idTecido, @idPeca, @idVariacao, @tempoPadrao, @valorDescontado, @tempoFinal, @custoMin, @pecasHora)`;
    const result = await r.query(sql);
    ok(res, result.recordset[0]);
  } catch (e) {
    err500(res, "Erro ao inserir calculadora", e);
  }
});

router.put("/calculadora/:id", async (req, res) => {
  try {
    const pool = await connectDB();
    const r = pool.request();
    const id = Number(req.params.id);
    r.input('id', mssql.Int, id);
    const fields = req.body || {};
    const set = Object.keys(fields).map(k => `${k}=@${k}`).join(', ');
    Object.entries(fields).forEach(([k,v])=> r.input(k, v));
    const q = `UPDATE dbo.calculadora SET ${set} WHERE id=@id; SELECT * FROM dbo.calculadora WHERE id=@id`;
    const rs = await r.query(q);
    ok(res, rs.recordset[0] || null);
  } catch (e) { err500(res, "Erro ao atualizar calculadora", e); }
});

router.delete("/calculadora/:id", async (req, res) => {
  try { const pool = await connectDB(); await pool.request().input('id', mssql.Int, Number(req.params.id)).query('DELETE FROM dbo.calculadora WHERE id=@id'); ok(res, {success:true}); }
  catch (e) { err500(res, "Erro ao excluir calculadora", e); }
});

// ===== DESCRITIVO =====
router.get("/descritivo", async (_req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request().query(
      "SELECT * FROM dbo.descritivo ORDER BY id DESC"
    );
    ok(res, result.recordset);
  } catch (e) {
    err500(res, "Erro ao listar descritivo", e);
  }
});

router.post("/descritivo", async (req, res) => {
  const b = req.body ?? {};
  try {
    const pool = await connectDB();
    const r = pool.request();
    const toInt = (v) => (v === undefined || v === null || v === "" ? null : Number.parseInt(v, 10));
    const toFloat = (v) => {
      if (v === undefined || v === null || v === "") return null;
      const s = typeof v === "string" ? v.replace(/,/g, ".") : v;
      const n = Number.parseFloat(s);
      return Number.isNaN(n) ? null : n;
    };
    r.input("idModelo", mssql.Int, toInt(b.id_modelo));
    r.input("idTecido", mssql.Int, toInt(b.id_tecido));
    r.input("nomeAtividade", mssql.VarChar(200), b.nome_atividade ?? b.nomeAtividade ?? null);
    r.input("tempoRelogio", mssql.VarChar(20), b.tempo_relogio ?? b.tempoRelogio ?? null);
    r.input("tempoCent", mssql.Float, toFloat(b.tempo_cent ?? b.tempoCent));
    r.input("postoDeTrabalho", mssql.VarChar(100), b.posto_trabalho ?? b.postoDeTrabalho ?? null);
    const sql = `INSERT IntO dbo.descritivo (idModelo, idTecido, nomeAtividade, tempoRelogio, tempoCent, postoDeTrabalho)
                 OUTPUT INSERTED.*
                 VALUES (@idModelo, @idTecido, @nomeAtividade, @tempoRelogio, @tempoCent, @postoDeTrabalho)`;
    const result = await r.query(sql);
    ok(res, result.recordset[0]);
  } catch (e) {
    err500(res, "Erro ao inserir descritivo", e);
  }
});

router.put("/descritivo/:id", async (req, res) => {
  try {
    const pool = await connectDB();
    const r = pool.request();
    const id = Number(req.params.id);
    r.input('id', mssql.Int, id);
    const fields = req.body || {};
    const set = Object.keys(fields).map(k => `${k}=@${k}`).join(', ');
    Object.entries(fields).forEach(([k,v])=> r.input(k, v));
    const q = `UPDATE dbo.descritivo SET ${set} WHERE id=@id; SELECT * FROM dbo.descritivo WHERE id=@id`;
    const rs = await r.query(q);
    ok(res, rs.recordset[0] || null);
  } catch (e) { err500(res, "Erro ao atualizar descritivo", e); }
});

router.delete("/descritivo/:id", async (req, res) => {
  try { const pool = await connectDB(); await pool.request().input('id', mssql.Int, Number(req.params.id)).query('DELETE FROM dbo.descritivo WHERE id=@id'); ok(res, {success:true}); }
  catch (e) { err500(res, "Erro ao excluir descritivo", e); }
});

// ===== CRONOMETRAGEM =====
router.get("/cronometragem", async (_req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request().query(
      "SELECT id, colaborador, tamanho, data, cronometrista, descritista, idModelo, criado_em FROM dbo.cronometragem ORDER BY id DESC"
    );
    ok(res, result.recordset);
  } catch (e) {
    err500(res, "Erro ao listar cronometragem", e);
  }
});

router.post("/cronometragem", async (req, res) => {
  const b = req.body ?? {};
  try {
    const pool = await connectDB();
    const r = pool.request();
    const toInt = (v) => (v === undefined || v === null || v === "" ? null : Number.parseInt(v, 10));
    const toDate = (v) => {
      if (!v) return null;
      const d = new Date(v);
      return Number.isNaN(d.getTime()) ? null : d;
    };
    
    r.input("colaborador", mssql.VarChar(99), b.colaborador ?? null);
    r.input("tamanho", mssql.VarChar(10), b.tamanho ?? null);
    r.input("data", mssql.Date, toDate(b.data));
    r.input("cronometrista", mssql.VarChar(99), b.cronometrista ?? null);
    r.input("descritista", mssql.VarChar(99), b.descritista ?? null);
    r.input("idModelo", mssql.Int, toInt(b.idModelo));
    
    const sql = `INSERT IntO dbo.cronometragem (colaborador, tamanho, data, cronometrista, descritista, idModelo)
                 OUTPUT INSERTED.*
                 VALUES (@colaborador, @tamanho, @data, @cronometrista, @descritista, @idModelo)`;
    const result = await r.query(sql);
    ok(res, result.recordset[0]);
  } catch (e) {
    err500(res, "Erro ao inserir cronometragem", e);
  }
});

router.put("/cronometragem/:id", async (req, res) => {
  try {
    const pool = await connectDB();
    const r = pool.request();
    const b = req.body ?? {};
    const id = Number(req.params.id);
    const toInt = (v) => (v === undefined || v === null || v === "" ? null : Number.parseInt(v, 10));
    const toDate = (v) => {
      if (!v) return null;
      const d = new Date(v);
      return Number.isNaN(d.getTime()) ? null : d;
    };
    
    r.input('id', mssql.Int, id);
    r.input("colaborador", mssql.VarChar(99), b.colaborador ?? null);
    r.input("tamanho", mssql.VarChar(10), b.tamanho ?? null);
    r.input("data", mssql.Date, toDate(b.data));
    r.input("cronometrista", mssql.VarChar(99), b.cronometrista ?? null);
    r.input("descritista", mssql.VarChar(99), b.descritista ?? null);
    r.input("idModelo", mssql.Int, toInt(b.idModelo));
    
    const q = `UPDATE dbo.cronometragem SET 
               colaborador=@colaborador, tamanho=@tamanho, data=@data, 
               cronometrista=@cronometrista, descritista=@descritista, idModelo=@idModelo 
               WHERE id=@id; 
               SELECT * FROM dbo.cronometragem WHERE id=@id`;
    const rs = await r.query(q);
    ok(res, rs.recordset[0] || null);
  } catch (e) { err500(res, "Erro ao atualizar cronometragem", e); }
});

router.delete("/cronometragem/:id", async (req, res) => {
  try { 
    const pool = await connectDB(); 
    await pool.request().input('id', mssql.Int, Number(req.params.id)).query('DELETE FROM dbo.cronometragem WHERE id=@id'); 
    ok(res, {success:true}); 
  }
  catch (e) { err500(res, "Erro ao excluir cronometragem", e); }
});

// ===== ACABAMENTO =====
router.get("/acabamento", async (_req, res) => {
  try {
    const pool = await connectDB();
    const result = await pool.request().query(
      "SELECT * FROM dbo.acabamento ORDER BY id DESC"
    );
    ok(res, result.recordset);
  } catch (e) {
    err500(res, "Erro ao listar acabamento", e);
  }
});

router.post("/acabamento", async (req, res) => {
  const b = req.body ?? {};
  try {
    const pool = await connectDB();
    const r = pool.request();
    const toInt = (v) => (v === undefined || v === null || v === "" ? null : Number.parseInt(v, 10));
    const toFloat = (v) => {
      if (v === undefined || v === null || v === "") return null;
      const s = typeof v === "string" ? v.replace(/,/g, ".") : v;
      const n = Number.parseFloat(s);
      return Number.isNaN(n) ? null : n;
    };
    r.input("idModelo", mssql.Int, toInt(b.id_modelo));
    r.input("nome", mssql.VarChar(200), b.nome ?? null);
    r.input("tempo", mssql.Float, toFloat(b.tempo));
    r.input("responsavel", mssql.VarChar(100), b.responsavel ?? null);
    const sql = `INSERT IntO dbo.acabamento (idModelo, nome, tempo, responsavel)
                 OUTPUT INSERTED.*
                 VALUES (@idModelo, @nome, @tempo, @responsavel)`;
    const result = await r.query(sql);
    ok(res, result.recordset[0]);
  } catch (e) {
    err500(res, "Erro ao inserir acabamento", e);
  }
});

router.put("/acabamento/:id", async (req, res) => {
  try {
    const pool = await connectDB();
    const r = pool.request();
    const id = Number(req.params.id);
    r.input('id', mssql.Int, id);
    const fields = req.body || {};
    const set = Object.keys(fields).map(k => `${k}=@${k}`).join(', ');
    Object.entries(fields).forEach(([k,v])=> r.input(k, v));
    const q = `UPDATE dbo.acabamento SET ${set} WHERE id=@id; SELECT * FROM dbo.acabamento WHERE id=@id`;
    const rs = await r.query(q);
    ok(res, rs.recordset[0] || null);
  } catch (e) { err500(res, "Erro ao atualizar acabamento", e); }
});

router.delete("/acabamento/:id", async (req, res) => {
  try { const pool = await connectDB(); await pool.request().input('id', mssql.Int, Number(req.params.id)).query('DELETE FROM dbo.acabamento WHERE id=@id'); ok(res, {success:true}); }
  catch (e) { err500(res, "Erro ao excluir acabamento", e); }
});

export default router;

// ===== tp_parametros (custo minuto, jornada etc.) =====
router.get('/parametros', async (_req, res) => {
  try {
    const pool = await connectDB();
    const rs = await pool.request().query('SELECT TOP 1 * FROM dbo.tp_parametros ORDER BY id DESC');
    ok(res, rs.recordset[0] || null);
  } catch (e) { err500(res, 'Erro ao buscar parâmetros', e); }
});

router.post('/parametros', async (req, res) => {
  const b = req.body || {};
  try {
    const pool = await connectDB();
    const r = pool.request();
    const toFloat = (v) => v===''||v===undefined||v===null? null : Number(String(v).replace(',', '.'));
    const toInt = (v) => v===''||v===undefined||v===null? null : parseInt(v, 10);
    r.input('custo_minuto', mssql.Float, toFloat(b.custo_minuto));
    r.input('j_inicio1', mssql.Time, b.j_inicio1 || null);
    r.input('j_fim1', mssql.Time, b.j_fim1 || null);
    r.input('j_inicio2', mssql.Time, b.j_inicio2 || null);
    r.input('j_fim2', mssql.Time, b.j_fim2 || null);
    r.input('j_inicio3', mssql.Time, b.j_inicio3 || null);
    r.input('j_fim3', mssql.Time, b.j_fim3 || null);
    r.input('total_dia_hhmm', mssql.VarChar(5), b.total_dia_hhmm || null);
    r.input('jornada_horas', mssql.Float, toFloat(b.jornada_horas));
    r.input('jornada_minutos', mssql.Int, toInt(b.jornada_minutos));
    r.input('j_total_colab_hhmm', mssql.VarChar(5), b.jornada_total_colab_hhmm || null);
    r.input('j_total_colab_horas', mssql.Float, toFloat(b.jornada_total_colab_horas));
    r.input('j_total_colab_min', mssql.Int, toInt(b.jornada_total_colab_minutos));
    const sql = `INSERT IntO dbo.tp_parametros (
      custo_minuto, j_inicio1, j_fim1, j_inicio2, j_fim2, j_inicio3, j_fim3,
      total_dia_hhmm, jornada_horas, jornada_minutos,
      jornada_total_colab_hhmm, jornada_total_colab_horas, jornada_total_colab_minutos
    ) OUTPUT INSERTED.* VALUES (
      @custo_minuto, @j_inicio1, @j_fim1, @j_inicio2, @j_fim2, @j_inicio3, @j_fim3,
      @total_dia_hhmm, @jornada_horas, @jornada_minutos,
      @j_total_colab_hhmm, @j_total_colab_horas, @j_total_colab_min
    )`;
    const rs = await r.query(sql);
    console.log(rs)
    ok(res, rs.recordset[0]);
  } catch (e) { err500(res, 'Erro ao criar parâmetros', e); }
});


