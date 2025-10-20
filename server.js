import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Carrega variáveis de ambiente
dotenv.config();

// Rotas
import relatorioLDRoutes from './routes/relatorioLDRoutes.js';
import relatorioCMPRoutes from './routes/relatorioCMPRoutes.js';
import usuarioRoutes from './routes/usuarioRoutes.js';
import historicoRoutes from './routes/historicoRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
import historicoProducaoRoutes from './routes/HistoricoProducaoRoutes.js';
import relatorioPRRoutes from './routes/relatorioPRRoutes.js';
import relatorioComprasRoutes from './Routes/relatorioComprasRoutes.js';
import tpRoutes from './Routes/tpRoutes.js';
import referenciaRoutes from './Routes/referenciaRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import faccaoRoutes from './Routes/faccaoRoutes.js';
import cepRoutes from './Routes/cepRoutes.js';
const app = express();
const PORT = 1561;
const HOST = '0.0.0.0';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'PUT', 'POST', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Arquivos estáticos para imagens de variação
app.use('/assets', express.static(path.join(__dirname, 'config', 'assets')));

// Rotas da API
app.use('/api/roles', roleRoutes);
app.use('/api/relatorioLD', relatorioLDRoutes);
app.use('/api/relatorioCMP', relatorioCMPRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/qualidade/api/historico', historicoRoutes);
app.use('/api/relatorioPR', relatorioPRRoutes);
app.use('/api/relatorioCompras', relatorioComprasRoutes);
app.use('/api/HistoricoProducao', historicoProducaoRoutes);

app.use('/api/tp', tpRoutes);
app.use('/api/referencias', referenciaRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/faccao', faccaoRoutes);
app.use('/api/cep', cepRoutes);

app.listen(PORT, HOST, () => {
    console.log(`Servidor rodando em: http://${HOST}:${PORT}`);
});
