-- Script para atualizar o schema da tabela imagem_processo_tp
-- Alterar o campo plan_incio de Float para DateTime

-- Verificar a estrutura atual da tabela
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'imagem_processo_tp' 
    AND COLUMN_NAME IN ('plan_incio', 'plan_termino')
ORDER BY ORDINAL_POSITION;

-- Backup dos dados existentes (opcional)
-- CREATE TABLE imagem_processo_tp_backup AS SELECT * FROM imagem_processo_tp;

-- Alterar o campo plan_incio para DateTime
-- Nota: Se houver dados existentes, pode ser necessário fazer uma migração de dados
ALTER TABLE dbo.imagem_processo_tp 
ALTER COLUMN plan_incio DATETIME;

-- Verificar se o campo plan_termino já está como DateTime
-- Se não estiver, alterar também:
-- ALTER TABLE dbo.imagem_processo_tp 
-- ALTER COLUMN plan_termino DATETIME;

-- Verificar a estrutura após a alteração
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'imagem_processo_tp' 
    AND COLUMN_NAME IN ('plan_incio', 'plan_termino')
ORDER BY ORDINAL_POSITION;

-- Comentários sobre a migração:
-- 1. Se houver dados existentes no campo plan_incio como Float, será necessário fazer uma migração
-- 2. Os dados Float podem representar timestamps Unix ou outros formatos numéricos
-- 3. Considere fazer backup antes de executar este script em produção
-- 4. Teste em ambiente de desenvolvimento primeiro
