-- Migration: Adicionar e ajustar campos na tabela IMAGEMUNIFORMES_pBI.dbo.historico_producao
-- Objetivo: adicionar tempoPrevisto, tempoRealizado e padronizar tipos numéricos usados nas fórmulas
-- Safe for re-run: usa verificações IF COL_LENGTH e TRY_CONVERT antes de ALTER

SET NOCOUNT ON;

-- 1) Adicionar colunas novas se não existirem
IF COL_LENGTH('IMAGEMUNIFORMES_pBI.dbo.historico_producao', 'tempoPrevisto') IS NULL
BEGIN
  ALTER TABLE IMAGEMUNIFORMES_pBI.dbo.historico_producao
    ADD tempoPrevisto DECIMAL(10,2) NULL;
END

IF COL_LENGTH('IMAGEMUNIFORMES_pBI.dbo.historico_producao', 'tempoRealizado') IS NULL
BEGIN
  ALTER TABLE IMAGEMUNIFORMES_pBI.dbo.historico_producao
    ADD tempoRealizado DECIMAL(10,2) NULL;
END

-- 2) Normalizar tipos existentes usados em cálculos
-- 2.1) TempoPeca: varchar -> decimal(10,2)
IF COL_LENGTH('IMAGEMUNIFORMES_pBI.dbo.historico_producao', 'TempoPeca') IS NOT NULL
BEGIN
  -- Limpa valores não numéricos para permitir conversão do tipo
  UPDATE IMAGEMUNIFORMES_pBI.dbo.historico_producao
    SET TempoPeca = NULL
  WHERE TempoPeca IS NOT NULL
    AND TRY_CONVERT(DECIMAL(10,2), TempoPeca) IS NULL;

  ALTER TABLE IMAGEMUNIFORMES_pBI.dbo.historico_producao
    ALTER COLUMN TempoPeca DECIMAL(10,2) NULL;
END

-- 2.2) tempoAcabamento: varchar -> decimal(10,2)
IF COL_LENGTH('IMAGEMUNIFORMES_pBI.dbo.historico_producao', 'tempoAcabamento') IS NOT NULL
BEGIN
  UPDATE IMAGEMUNIFORMES_pBI.dbo.historico_producao
    SET tempoAcabamento = NULL
  WHERE tempoAcabamento IS NOT NULL
    AND TRY_CONVERT(DECIMAL(10,2), tempoAcabamento) IS NULL;

  ALTER TABLE IMAGEMUNIFORMES_pBI.dbo.historico_producao
    ALTER COLUMN tempoAcabamento DECIMAL(10,2) NULL;
END

-- 2.3) pessoaAcabamento: varchar -> int
IF COL_LENGTH('IMAGEMUNIFORMES_pBI.dbo.historico_producao', 'pessoaAcabamento') IS NOT NULL
BEGIN
  UPDATE IMAGEMUNIFORMES_pBI.dbo.historico_producao
    SET pessoaAcabamento = NULL
  WHERE pessoaAcabamento IS NOT NULL
    AND TRY_CONVERT(INT, pessoaAcabamento) IS NULL;

  ALTER TABLE IMAGEMUNIFORMES_pBI.dbo.historico_producao
    ALTER COLUMN pessoaAcabamento INT NULL;
END

-- Observação: colunas previsto, real, retrabalho e custoFaccao já são FLOAT e permanecem assim

PRINT 'Migração concluída com sucesso: historico_producao atualizada.';


