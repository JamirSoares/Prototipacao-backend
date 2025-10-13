// src/services/roleService.js
import { connectDB, mssql } from '../config/db.js';

// ===============================
// PERMISSÕES (Roles)
// ===============================
export async function getAllPermissoes() {
  const pool = await connectDB();
  const result = await pool.request().query(`
    SELECT * FROM permissoes ORDER BY id
  `);
  return result.recordset;
}

export async function getPermissaoById(id) {
  const pool = await connectDB();
  const result = await pool.request()
    .input('id', mssql.Int, id)
    .query('SELECT * FROM permissoes WHERE id = @id');
  return result.recordset[0];
}

export async function createPermissao(data) {
  const pool = await connectDB();
  const request = pool.request()
    .input('nome', mssql.VarChar(100), data.nome)
    .input('descricao', mssql.VarChar(255), data.descricao);

  const result = await request.query(`
    INSERT INTO permissoes (nome, descricao)
    VALUES (@nome, @descricao);
    SELECT SCOPE_IDENTITY() AS id;
  `);

  return getPermissaoById(result.recordset[0].id);
}

export async function updatePermissao(id, data) {
  const pool = await connectDB();
  const request = pool.request().input('id', mssql.Int, id);

  const updates = [];
  if (data.nome) { updates.push('nome = @nome'); request.input('nome', data.nome); }
  if (data.descricao) { updates.push('descricao = @descricao'); request.input('descricao', data.descricao); }

  if (updates.length === 0) return 0;

  await request.query(`UPDATE permissoes SET ${updates.join(', ')} WHERE id = @id`);
  return getPermissaoById(id);
}

export async function deletePermissao(id) {
  const pool = await connectDB();
  const result = await pool.request()
    .input('id', mssql.Int, id)
    .query('DELETE FROM permissoes WHERE id = @id');
  return result.rowsAffected[0];
}

// ===============================
// AÇÕES
// ===============================
export async function getAllAcoes() {
  const pool = await connectDB();
  const result = await pool.request().query('SELECT * FROM acoes ORDER BY id');
  return result.recordset;
}

export async function getAcaoById(id) {
  const pool = await connectDB();
  const result = await pool.request()
    .input('id', mssql.Int, id)
    .query('SELECT * FROM acoes WHERE id = @id');
  return result.recordset[0];
}

export async function createAcao(data) {
  const pool = await connectDB();
  const request = pool.request()
    .input('nome', mssql.VarChar(100), data.nome)
    .input('descricao', mssql.VarChar(255), data.descricao);

  const result = await request.query(`
    INSERT INTO acoes (nome, descricao)
    VALUES (@nome, @descricao);
    SELECT SCOPE_IDENTITY() AS id;
  `);

  return getAcaoById(result.recordset[0].id);
}

export async function updateAcao(id, data) {
  const pool = await connectDB();
  const request = pool.request().input('id', mssql.Int, id);

  const updates = [];
  if (data.nome) { updates.push('nome = @nome'); request.input('nome', data.nome); }
  if (data.descricao) { updates.push('descricao = @descricao'); request.input('descricao', data.descricao); }

  if (updates.length === 0) return 0;

  await request.query(`UPDATE acoes SET ${updates.join(', ')} WHERE id = @id`);
  return getAcaoById(id);
}

export async function deleteAcao(id) {
  const pool = await connectDB();
  const result = await pool.request()
    .input('id', mssql.Int, id)
    .query('DELETE FROM acoes WHERE id = @id');
  return result.rowsAffected[0];
}

// ===============================
// ROLE_ACOES (Vinculação de Roles com Ações)
// ===============================
export async function getAllRoleAcoes() {
  const pool = await connectDB();
  const result = await pool.request()
    .query(`
      SELECT ra.id, ra.role_id, ra.acao_id, p.nome AS permissao_nome, a.nome AS acao_nome
      FROM role_acoes ra
      JOIN permissoes p ON ra.role_id = p.id
      JOIN acoes a ON ra.acao_id = a.id
      ORDER BY ra.id
    `);
  return result.recordset;
}

export async function createRoleAcao(role_id, acao_id) {
  const pool = await connectDB();
  const request = pool.request()
    .input('role_id', mssql.Int, role_id)
    .input('acao_id', mssql.Int, acao_id);

  const result = await request.query(`
    INSERT INTO role_acoes (role_id, acao_id)
    VALUES (@role_id, @acao_id);
    SELECT SCOPE_IDENTITY() AS id;
  `);

  return getAllRoleAcoes(); // retorna a lista completa após inserção
}

export async function deleteRoleAcao(id) {
  const pool = await connectDB();
  const result = await pool.request()
    .input('id', mssql.Int, id)
    .query('DELETE FROM role_acoes WHERE id = @id');
  return result.rowsAffected[0];
}
