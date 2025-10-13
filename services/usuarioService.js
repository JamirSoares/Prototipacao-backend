// src/services/usuarioService.js
import { connectDB, mssql } from '../config/db.js';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

function excludePassword(user) {
  if (user && user.senha_hash) {
    const { senha_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  return user;
}

// --- Funções CRUD ---

// Busca todos os usuários com array de permissões
export async function getAll() {
  const pool = await connectDB();
  const result = await pool.request().query(`
    SELECT 
      u.id, u.nome_completo, u.usuario, u.email, u.status, u.senha_hash, u.permissao_id,
      p.nome AS permissao_nome,
      (
        SELECT STRING_AGG(a.nome, ',')
        FROM role_acoes ra
        JOIN acoes a ON a.id = ra.acao_id
        WHERE ra.role_id = p.id
      ) AS permissoes
    FROM usuarios u
    JOIN permissoes p ON u.permissao_id = p.id
    ORDER BY u.id DESC
  `);

  return result.recordset.map(user => {
    const u = excludePassword(user);
    u.permissions = u.permissoes ? u.permissoes.split(',') : [];
    delete u.permissoes;
    return u;
  });
}

// Busca 1 usuário pelo id com array de permissões
export async function getById(id) {
  const pool = await connectDB();
  const result = await pool.request()
    .input('id', mssql.Int, id)
    .query(`
      SELECT 
        u.id, u.nome_completo, u.usuario, u.email, u.status, u.senha_hash, u.permissao_id,
        p.nome AS permissao_nome,
        (
          SELECT STRING_AGG(a.nome, ',')
          FROM role_acoes ra
          JOIN acoes a ON a.id = ra.acao_id
          WHERE ra.role_id = p.id
        ) AS permissoes
      FROM usuarios u
      JOIN permissoes p ON u.permissao_id = p.id
      WHERE u.id = @id
    `);

  const user = excludePassword(result.recordset[0]);
  if (user) {
    user.permissions = user.permissoes ? user.permissoes.split(',') : [];
    delete user.permissoes;
  }
  return user;
}

// Cria usuário
export async function create(data) {
  const pool = await connectDB();
  const request = pool.request();

  if (!data.senha) throw new Error("A senha é obrigatória.");
  const senha_hash = await bcrypt.hash(data.senha, SALT_ROUNDS);

  request
    .input('nome_completo', mssql.VarChar(150), data.nome_completo)
    .input('usuario', mssql.VarChar(50), data.usuario)
    .input('senha_hash', mssql.VarChar(255), senha_hash)
    .input('email', mssql.VarChar(100), data.email)
    .input('status', mssql.VarChar(20), data.status || 'ativo')
    .input('permissao_id', mssql.Int, data.permissao_id);

  const query = `
    INSERT INTO usuarios (nome_completo, usuario, senha_hash, email, status, permissao_id)
    VALUES (@nome_completo, @usuario, @senha_hash, @email, @status, @permissao_id);
    SELECT SCOPE_IDENTITY() AS id;
  `;
  const result = await request.query(query);
  return getById(result.recordset[0].id);
}

// Atualiza usuário
export async function updateById(id, data) {
  const pool = await connectDB();
  const request = pool.request().input('id', mssql.Int, id);

  const allowedFields = ['nome_completo', 'usuario', 'email', 'status', 'permissao_id'];
  const updates = [];

  if (data.senha) {
    const senha_hash = await bcrypt.hash(data.senha, SALT_ROUNDS);
    updates.push('senha_hash = @senha_hash');
    request.input('senha_hash', mssql.VarChar(255), senha_hash);
  }

  allowedFields.forEach(field => {
    if (data[field] !== undefined) {
      updates.push(`${field} = @${field}`);
      request.input(field, data[field]);
    }
  });

  if (updates.length === 0) return 0;

  const query = `UPDATE usuarios SET ${updates.join(', ')} WHERE id = @id`;
  await request.query(query);

  return getById(id);
}

// Deleta usuário
export async function deleteById(id) {
  const pool = await connectDB();
  const result = await pool.request()
    .input('id', mssql.Int, id)
    .query('DELETE FROM usuarios WHERE id = @id');
  return result.rowsAffected[0];
}

// Atualiza data de atualização
export async function reloadDB() {
  const pool = await connectDB();
  await pool.request().query('UPDATE usuarios SET atualizacao = GETDATE()');
}

// Busca usuário pelo login
export async function findByUsuario(usuario) {
  const pool = await connectDB();
  const result = await pool.request()
    .input('usuario', mssql.VarChar(50), usuario)
    .query(`
      SELECT 
        u.id, u.nome_completo, u.usuario, u.email, u.status, u.senha_hash, u.permissao_id,
        p.nome AS permissao_nome,
        (
          SELECT STRING_AGG(a.nome, ',')
          FROM role_acoes ra
          JOIN acoes a ON a.id = ra.acao_id
          WHERE ra.role_id = p.id
        ) AS permissoes
      FROM usuarios u
      JOIN permissoes p ON u.permissao_id = p.id
      WHERE u.usuario = @usuario
    `);

  const user = result.recordset[0];
  if (user) {
    user.permissions = user.permissoes ? user.permissoes.split(',') : [];
    delete user.permissoes;
  }
  return user;
}
