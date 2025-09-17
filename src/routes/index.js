const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authController = require("../controllers/authController");
const { verifyToken } = require("../services/authService");

// Controllers importados
const RelatorioController = require('../controllers/RelatorioController');
const ModeloController = require('../controllers/ModeloController');
const ProcessoProdutoController = require('../controllers/ProcessoProdutoController');
const PartePecaController = require('../controllers/PartePecaController');
const VariacaoPecaController = require('../controllers/VariacaoPecaController');
const AtividadeProcessoController = require('../controllers/AtividadeProcessoController');
const { HistoricoController, RegistroController, horariosController } = require('../controllers/Registro-historicoController');


function authenticate(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.status(403).json({ error: "Token não fornecido" });

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido" });
  }
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '..', 'config', 'assets', 'imagem');
        if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const modeloNome = req.body.Nome || 'modelo_sem_nome';
        const safeNome = modeloNome.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const ext = path.extname(file.originalname);
        cb(null, `${safeNome}${ext}`);
    }
});
const upload = multer({ storage });

// ===================== ROTAS DE Login =====================
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", authenticate, authController.me);

// ===================== ROTAS DE MODELOS =====================
router.post('/modelos', upload.single('ImagemUrl'), ModeloController.create);
router.get('/modelos', ModeloController.getAll);
router.get('/modelos/:id', ModeloController.getById);
router.get('/modelos/:id/details', ModeloController.getModeloDetails);
router.put('/modelos/:id', upload.single('ImagemUrl'), ModeloController.update);
router.delete('/modelos/:id', ModeloController.delete);

// ===================== ROTAS DE PROCESSOS DE PRODUTO =====================
router.post('/processos', ProcessoProdutoController.create);
router.get('/processos', ProcessoProdutoController.getAll);
router.get('/processos/:id', ProcessoProdutoController.getById);
router.put('/processos/:id', ProcessoProdutoController.update);
router.delete('/processos/:id', ProcessoProdutoController.delete);

// ===================== ROTAS DE PARTES DE PEÇA =====================
router.post('/partes', PartePecaController.create);
router.get('/partes', PartePecaController.getAll);
router.get('/partes/:id', PartePecaController.getById);
router.put('/partes/:id', PartePecaController.update);
router.delete('/partes/:id', PartePecaController.delete);

// ===================== ROTAS DE VARIAÇÕES DE PEÇA =====================
router.post('/variacoes', VariacaoPecaController.create);
router.get('/variacoes', VariacaoPecaController.getAll);
router.get('/variacoes/:id', VariacaoPecaController.getById);
router.put('/variacoes/:id', VariacaoPecaController.update);
router.delete('/variacoes/:id', VariacaoPecaController.delete);

// ===================== ROTAS DE ATIVIDADES DE PROCESSO =====================
router.post('/atividades', AtividadeProcessoController.create);
router.get('/atividades', AtividadeProcessoController.getAll);
router.get('/atividades/:id', AtividadeProcessoController.getById);
router.put('/atividades/:id', AtividadeProcessoController.update);
router.delete('/atividades/:id', AtividadeProcessoController.delete);

// ===================== ROTAS DE REGISTRO E HISTÓRICO =====================
router.post('/Registro_producao', RegistroController.create);
router.get('/Registro_producao', RegistroController.getAll);
router.get('/Registro_producao/:id', RegistroController.getById);
router.put('/Registro_producao/:id', RegistroController.update);
router.delete('/Registro_producao/:id', RegistroController.delete);

router.post('/Historico_producao', HistoricoController.create);
router.get('/Historico_producao', HistoricoController.getAll);
router.get('/Historico_producao/:id', HistoricoController.getById);
router.put('/Historico_producao/:id', HistoricoController.update);
router.delete('/Historico_producao/:id', HistoricoController.delete);

// ===================== ROTAS DE HORÁRIOS =====================
router.get('/horarios', horariosController.getAll);

// Rota para relatório completo de um modelo
router.get('/relatorio/modelo/:id', RelatorioController.getRelatorioPorModelo);

module.exports = router;