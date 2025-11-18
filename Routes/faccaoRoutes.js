import express from 'express';
import { 
  toggleFavorite, 
  getFaccoes, 
  getFaccoesForMap, 
  getFaccoesOnly,
  getFuncionariosOnly,
  getAllFaccoes, 
  createFaccao, 
  updateFaccao, 
  deleteFaccao 
} from '../controllers/faccaoController.js';

const router = express.Router();

// Rota para alternar favorito
router.post('/toggle-favorite', toggleFavorite);

// Rota para obter todas as facções
router.get('/', getFaccoes);

// Rota para obter facções para o mapa
router.get('/map', getFaccoesForMap);

// Rotas específicas por tipo
router.get('/map/faccoes', getFaccoesOnly);
router.get('/map/funcionarios', getFuncionariosOnly);

console.log('FaccoesRoutes');
// Rotas CRUD para gerenciamento
router.get('/all', getAllFaccoes);
router.post('/', createFaccao);
router.put('/:id', updateFaccao);
router.delete('/:id', deleteFaccao);

export default router;