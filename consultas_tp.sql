-- ==================================================
-- CONSULTAS SQL PARA O PROJETO TP
-- Com INNER JOIN entre tabelas do projeto e cadastro principal
-- ==================================================

-- 1. CONSULTA COMPLETA: Processo + Cliente + Empresa + Modelo + Peça + Tecido + Maquinário
SELECT
    p.id,
    p.nome_ref,
    p.cliente_id,
    cgn.Grupo_Negocio AS nome_cliente,
    cec.Empresa_Cliente_Nome AS nome_empresa,
    p.tempo,
    p.custo_mo,
    p.plan_tipo_plan,
    p.plan_eficiencia,
    p.plan_qtd_pecas,
    p.plan_incio,
    p.plan_prod_diarias,
    p.plan_dias_necessarios,
    p.plan_termino,
    p.plan_max,
    p.plan_pecas_hora,
    p.plan_pecas_caixa,
    p.nome,
    p.val_componentes,
    p.val_maquinarios_id,
    mq.nome AS nome_maquinario,
    p.val_jornada,
    p.val_total_ind,
    p.val_total_fac,
    p.val_dia_ind,
    p.val_dia_fac,
    p.val_horas_ind,
    p.val_horas_fac,
    p.val_min_ind,
    p.val_min_fac,
    p.val_descricao_modelo,
    p.val_modelo_id,
    m.nome AS nome_modelo,
    p.val_tecido_id,
    t.nome AS nome_tecido,
    p.val_parte_peca_id,
    pc.nome AS nome_peca,
    p.val_variacao_id,
    v.nome AS nome_variacao,
    v.img_path
FROM dbo.imagem_processo_tp p
INNER JOIN CAD_Grupo_Negocio cgn ON p.cliente_id = cgn.Grupo_Negocio
INNER JOIN CAD_Empresa_Cliente cec ON cgn.CAD_Grupo_Negocio_Id = cec.CAD_Grupo_Negocio_Id
LEFT JOIN dbo.imagem_modelo_tp m ON p.val_modelo_id = m.id
LEFT JOIN dbo.tecido t ON p.val_tecido_id = t.id
LEFT JOIN dbo.maquinarios mq ON p.val_maquinarios_id = mq.id
LEFT JOIN dbo.imagem_peca_tp pc ON p.val_parte_peca_id = pc.id
LEFT JOIN dbo.imagem_variacao_tp v ON p.val_variacao_id = v.id
ORDER BY p.id DESC;

-- 2. PROCESSOS POR CLIENTE ESPECÍFICO
SELECT
    p.id,
    p.nome_ref,
    cgn.Grupo_Negocio AS nome_cliente,
    p.tempo,
    p.custo_mo,
    p.plan_tipo_plan,
    p.plan_eficiencia,
    p.plan_qtd_pecas,
    p.plan_incio,
    p.plan_prod_diarias,
    p.plan_dias_necessarios,
    p.plan_termino,
    p.nome,
    m.nome AS nome_modelo,
    t.nome AS nome_tecido,
    pc.nome AS nome_peca,
    v.nome AS nome_variacao
FROM dbo.imagem_processo_tp p
INNER JOIN CAD_Grupo_Negocio cgn ON p.cliente_id = cgn.Grupo_Negocio
LEFT JOIN dbo.imagem_modelo_tp m ON p.val_modelo_id = m.id
LEFT JOIN dbo.tecido t ON p.val_tecido_id = t.id
LEFT JOIN dbo.imagem_peca_tp pc ON p.val_parte_peca_id = pc.id
LEFT JOIN dbo.imagem_variacao_tp v ON p.val_variacao_id = v.id
WHERE p.cliente_id = 'NOME_DO_CLIENTE_AQUI'
ORDER BY p.id DESC;

-- 3. RESUMO POR CLIENTE (AGRUPADO)
SELECT
    cgn.Grupo_Negocio AS cliente,
    COUNT(p.id) AS total_processos,
    SUM(p.plan_qtd_pecas) AS total_pecas_planejadas,
    AVG(p.custo_mo) AS custo_medio_mo,
    SUM(p.plan_dias_necessarios) AS total_dias_necessarios
FROM dbo.imagem_processo_tp p
INNER JOIN CAD_Grupo_Negocio cgn ON p.cliente_id = cgn.Grupo_Negocio
GROUP BY cgn.Grupo_Negocio
ORDER BY total_processos DESC;

-- 4. PROCESSOS COM MATERIAIS RELACIONADOS
SELECT
    p.id,
    p.nome_ref,
    cgn.Grupo_Negocio AS cliente,
    p.nome AS nome_processo,
    p.val_descricao_modelo,
    m.nome AS modelo,
    t.nome AS tecido,
    pc.nome AS peca,
    v.nome AS variacao,
    mq.nome AS maquinario,
    p.val_componentes,
    p.val_total_ind,
    p.val_total_fac,
    p.val_dia_ind,
    p.val_dia_fac
FROM dbo.imagem_processo_tp p
INNER JOIN CAD_Grupo_Negocio cgn ON p.cliente_id = cgn.Grupo_Negocio
LEFT JOIN dbo.imagem_modelo_tp m ON p.val_modelo_id = m.id
LEFT JOIN dbo.tecido t ON p.val_tecido_id = t.id
LEFT JOIN dbo.maquinarios mq ON p.val_maquinarios_id = mq.id
LEFT JOIN dbo.imagem_peca_tp pc ON p.val_parte_peca_id = pc.id
LEFT JOIN dbo.imagem_variacao_tp v ON p.val_variacao_id = v.id
ORDER BY p.id DESC;

-- 5. ANÁLISE DE EFICIÊNCIA POR CLIENTE
SELECT
    cgn.Grupo_Negocio AS cliente,
    COUNT(p.id) AS total_processos,
    AVG(CAST(p.plan_eficiencia AS FLOAT)) AS eficiencia_media,
    MIN(CAST(p.plan_eficiencia AS FLOAT)) AS eficiencia_minima,
    MAX(CAST(p.plan_eficiencia AS FLOAT)) AS eficiencia_maxima,
    AVG(p.tempo) AS tempo_medio,
    SUM(p.plan_qtd_pecas) AS total_pecas
FROM dbo.imagem_processo_tp p
INNER JOIN CAD_Grupo_Negocio cgn ON p.cliente_id = cgn.Grupo_Negocio
WHERE p.plan_eficiencia IS NOT NULL
GROUP BY cgn.Grupo_Negocio
ORDER BY eficiencia_media DESC;

-- 6. CLIENTES COM SEUS DADOS CADASTRAIS
SELECT
    cgn.CAD_Grupo_Negocio_Id AS id,
    cgn.Grupo_Negocio AS cliente,
    cec.Empresa_Cliente_Nome AS empresa,
    cec.Empresa_Cliente_CNPJ AS cnpj,
    cec.Empresa_Cliente_Contato AS contato,
    cec.Empresa_Cliente_Email AS email,
    cec.Empresa_Cliente_Telefone AS telefone
FROM CAD_Empresa_Cliente cec
INNER JOIN CAD_Grupo_Negocio cgn ON cec.CAD_Grupo_Negocio_Id = cgn.CAD_Grupo_Negocio_Id
ORDER BY cgn.Grupo_Negocio;

-- 7. ESTATÍSTICAS GERAIS DO PROJETO TP
SELECT
    'Processos' AS tabela, COUNT(*) AS total FROM dbo.imagem_processo_tp
UNION ALL
SELECT 'Modelos', COUNT(*) FROM dbo.imagem_modelo_tp
UNION ALL
SELECT 'Peças', COUNT(*) FROM dbo.imagem_peca_tp
UNION ALL
SELECT 'Variações', COUNT(*) FROM dbo.imagem_variacao_tp
UNION ALL
SELECT 'Tecidos', COUNT(*) FROM dbo.tecido
UNION ALL
SELECT 'Maquinários', COUNT(*) FROM dbo.maquinarios
UNION ALL
SELECT 'Clientes', COUNT(DISTINCT cgn.CAD_Grupo_Negocio_Id) FROM CAD_Grupo_Negocio cgn;

-- 8. PROCESSOS POR PERÍODO (ÚLTIMOS 30 DIAS)
SELECT
    p.id,
    p.nome_ref,
    cgn.Grupo_Negocio AS cliente,
    p.plan_termino,
    DATEDIFF(DAY, p.plan_incio, p.plan_termino) AS dias_planejados,
    p.plan_qtd_pecas,
    p.plan_prod_diarias
FROM dbo.imagem_processo_tp p
INNER JOIN CAD_Grupo_Negocio cgn ON p.cliente_id = cgn.Grupo_Negocio
WHERE p.plan_termino >= DATEADD(DAY, -30, GETDATE())
ORDER BY p.plan_termino DESC;

-- 9. PERFORMANCE POR MODELO
SELECT
    m.nome AS modelo,
    COUNT(p.id) AS total_processos,
    AVG(p.tempo) AS tempo_medio,
    AVG(p.custo_mo) AS custo_medio,
    SUM(p.plan_qtd_pecas) AS total_pecas
FROM dbo.imagem_processo_tp p
INNER JOIN dbo.imagem_modelo_tp m ON p.val_modelo_id = m.id
GROUP BY m.nome
ORDER BY total_processos DESC;

-- 10. UTILIZAÇÃO DE TECIDOS POR CLIENTE
SELECT
    cgn.Grupo_Negocio AS cliente,
    t.nome AS tecido,
    COUNT(p.id) AS vezes_utilizado,
    SUM(p.plan_qtd_pecas) AS total_pecas
FROM dbo.imagem_processo_tp p
INNER JOIN CAD_Grupo_Negocio cgn ON p.cliente_id = cgn.Grupo_Negocio
INNER JOIN dbo.tecido t ON p.val_tecido_id = t.id
GROUP BY cgn.Grupo_Negocio, t.nome
ORDER BY cgn.Grupo_Negocio, vezes_utilizado DESC;

-- ==================================================
-- EXEMPLOS DE USO DAS CONSULTAS:
-- ==================================================

-- Substitua os valores entre aspas simples conforme necessário:
-- 'NOME_DO_CLIENTE_AQUI' → 'Cliente XYZ'
-- @id → número do ID específico
-- GETDATE() → função do SQL Server para data atual

-- Para executar no SQL Server Management Studio:
-- 1. Abra uma nova consulta
-- 2. Cole uma das consultas acima
-- 3. Substitua os parâmetros necessários
-- 4. Execute (F5)

-- ==================================================
