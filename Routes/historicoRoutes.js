import express from 'express';
const router = express.Router();

import {
  getHistorico,
  getReferencias,
  createReferencia,
  updateReferencia,
  deleteReferencia,
  updateCampoHistorico,
  deleteRegistro,
  deleteHistorico,
  getHorarios,
  createRegistro
} from '../controllers/historicoController.js';

// ==========================
// CONSULTAS
// ==========================
router.get('/consulta-historico', getHistorico);
router.get('/consulta', getHistorico); // registros ativos
router.get('/referencias', getReferencias);
router.get('/horarios', getHorarios);

// ==========================
// CRUD REFERENCIA
// ==========================
router.post('/referencias', createReferencia);
router.put('/referencias/:id', updateReferencia);
router.delete('/referencias/:id', deleteReferencia);

// ==========================
// PATCH POR CAMPO
// ==========================
router.patch('/:id/referencia', (req, res) => updateCampoHistorico(req, res, 'referencia'));
router.patch('/:id/custoFaccao', (req, res) => updateCampoHistorico(req, res, 'custoFaccao'));
router.patch('/:id/tempoAcabamento', (req, res) => updateCampoHistorico(req, res, 'tempoAcabamento'));
router.patch('/:id/pessoaAcabamento', (req, res) => updateCampoHistorico(req, res, 'pessoaAcabamento'));
router.patch('/:id/TempoPeca', (req, res) => updateCampoHistorico(req, res, 'TempoPeca'));
router.patch('/:id/pessoasCelula', (req, res) => updateCampoHistorico(req, res, 'pessoasCelula'));

// ==========================
// DELETAR
// ==========================
router.delete('/deletar/:id', deleteRegistro);
router.delete('/deletar-historico/:id', deleteHistorico);

// ==========================
// INSERIR
// ==========================
router.post('/cadastro', createRegistro);

export default router;