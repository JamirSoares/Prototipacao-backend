// src/controllers/roleController.js
import * as service from '../services/roleService.js';

// ----------------------
// PERMISSÕES (Roles)
// ----------------------
export async function getAllPermissoes(req, res) {
  try {
    const data = await service.getAllPermissoes();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar permissões.', details: err.message });
  }
}

export async function getPermissaoById(req, res) {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

  try {
    const data = await service.getPermissaoById(id);
    if (!data) return res.status(404).json({ error: 'Permissão não encontrada.' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createPermissao(req, res) {
  try {
    const { nome, descricao } = req.body;
    if (!nome) return res.status(400).json({ error: 'Nome é obrigatório.' });

    const newPermissao = await service.createPermissao({ nome, descricao });
    res.status(201).json(newPermissao);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar permissão.', details: err.message });
  }
}

export async function updatePermissao(req, res) {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

  try {
    const updated = await service.updatePermissao(id, req.body);
    if (!updated) return res.status(404).json({ error: 'Permissão não encontrada ou nada para atualizar.' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar permissão.', details: err.message });
  }
}

export async function deletePermissao(req, res) {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

  try {
    const deleted = await service.deletePermissao(id);
    if (!deleted) return res.status(404).json({ error: 'Permissão não encontrada.' });
    res.json({ message: 'Permissão excluída com sucesso.', rowsAffected: deleted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao excluir permissão.', details: err.message });
  }
}

// ----------------------
// AÇÕES
// ----------------------
export async function getAllAcoes(req, res) {
  try {
    const data = await service.getAllAcoes();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar ações.', details: err.message });
  }
}

export async function getAcaoById(req, res) {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

  try {
    const data = await service.getAcaoById(id);
    if (!data) return res.status(404).json({ error: 'Ação não encontrada.' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createAcao(req, res) {
  try {
    const { nome, descricao } = req.body;
    if (!nome) return res.status(400).json({ error: 'Nome é obrigatório.' });

    const newAcao = await service.createAcao({ nome, descricao });
    res.status(201).json(newAcao);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar ação.', details: err.message });
  }
}

export async function updateAcao(req, res) {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

  try {
    const updated = await service.updateAcao(id, req.body);
    if (!updated) return res.status(404).json({ error: 'Ação não encontrada ou nada para atualizar.' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar ação.', details: err.message });
  }
}

export async function deleteAcao(req, res) {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

  try {
    const deleted = await service.deleteAcao(id);
    if (!deleted) return res.status(404).json({ error: 'Ação não encontrada.' });
    res.json({ message: 'Ação excluída com sucesso.', rowsAffected: deleted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao excluir ação.', details: err.message });
  }
}

// ----------------------
// ROLE_ACOES (vinculação)
// ----------------------
export async function getAllRoleAcoes(req, res) {
  try {
    const data = await service.getAllRoleAcoes();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar vinculações.', details: err.message });
  }
}

export async function createRoleAcao(req, res) {
  try {
    const { role_id, acao_id } = req.body;
    if (!role_id || !acao_id) return res.status(400).json({ error: 'role_id e acao_id são obrigatórios.' });

    const data = await service.createRoleAcao(role_id, acao_id);
    res.status(201).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar vinculação.', details: err.message });
  }
}

export async function deleteRoleAcao(req, res) {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

  try {
    const deleted = await service.deleteRoleAcao(id);
    if (!deleted) return res.status(404).json({ error: 'Vinculação não encontrada.' });
    res.json({ message: 'Vinculação excluída com sucesso.', rowsAffected: deleted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao excluir vinculação.', details: err.message });
  }
}
