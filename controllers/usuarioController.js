// src/controllers/usuarioController.js
import * as service from '../services/usuarioService.js';
import bcrypt from 'bcryptjs';

// --- Função auxiliar ---
function validateId(id, res) {
  const numericId = Number(id);
  if (isNaN(numericId)) {
    res.status(400).json({ error: 'ID inválido. Deve ser um número.' });
    return null;
  }
  return numericId;
}

// --- Endpoints ---
export async function getAll(req, res) {
  try {
    const data = await service.getAll(); // já vem com permissions[]
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar usuários.', details: err.message });
  }
}

export async function getById(req, res) {
  const id = validateId(req.params.id, res);
  if (id === null) return;

  try {
    const data = await service.getById(id); // já vem com permissions[]
    if (!data) return res.status(404).json({ message: 'Usuário não encontrado.' });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

export async function create(req, res) {
  try {
    const { nome_completo, usuario, senha, email, permissao_id, status } = req.body;
    if (!nome_completo || !usuario || !senha || !email || !permissao_id) {
      return res.status(400).json({
        error: 'Campos obrigatórios ausentes: nome_completo, usuario, senha, email, permissao_id.'
      });
    }

    // Define status padrão como 'ativo' se não fornecido
    const userData = {
      ...req.body,
      status: status || 'ativo'
    };

    const newUser = await service.create(userData); // já vem com permissions[]
    res.status(201).json(newUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar usuário.', details: err.message });
  }
}

export async function updateById(req, res) {
  const id = validateId(req.params.id, res);
  if (id === null) return;

  try {
    const updatedUser = await service.updateById(id, req.body); // já vem com permissions[]
    if (!updatedUser) return res.status(404).json({ message: 'Usuário não encontrado ou nada para atualizar.' });
    res.json({ message: 'Usuário atualizado com sucesso.', user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar usuário.', details: err.message });
  }
}

export async function deleteById(req, res) {
  const id = validateId(req.params.id, res);
  if (id === null) return;

  try {
    const deleted = await service.deleteById(id);
    if (deleted === 0) return res.status(404).json({ message: 'Usuário não encontrado.' });
    res.json({ message: 'Usuário excluído com sucesso.', rowsAffected: deleted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao excluir usuário.', details: err.message });
  }
}

export async function reloadDB(req, res) {
  try {
    await service.reloadDB();
    res.status(201).json({ message: 'Recarregamento concluído.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao recarregar dados.', details: err.message });
  }
}

export async function login(req, res) {
  try {
    const { usuario, senha } = req.body;
    if (!usuario || !senha) {
      return res.status(400).json({ error: 'Usuário e senha são obrigatórios.' });
    }

    const user = await service.findByUsuario(usuario); // já vem com permissions[]
    if (!user) return res.status(401).json({ error: 'Usuário não encontrado.' });

    // Verifica se o usuário está ativo
    if (user.status && user.status !== 'ativo') {
      return res.status(401).json({ error: 'Usuário inativo. Entre em contato com o administrador.' });
    }

    const isMatch = await bcrypt.compare(senha, user.senha_hash);
    if (!isMatch) return res.status(401).json({ error: 'Senha incorreta.' });

    const { senha_hash, ...userWithoutPassword } = user;
    res.json(userWithoutPassword); // já inclui permissions[]
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao realizar login.', details: err.message });
  }
}
