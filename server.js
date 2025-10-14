import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Rotas
import relatorioLDRoutes from './routes/relatorioLDRoutes.js';
import relatorioCMPRoutes from './routes/relatorioCMPRoutes.js';
import usuarioRoutes from './routes/usuarioRoutes.js';
import historicoRoutes from './routes/historicoRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
import historicoProducaoRoutes from './routes/HistoricoProducaoRoutes.js';
import relatorioCRoutes from './routes/relatorioCRoutes.js';
import relatorioPRRoutes from './routes/relatorioPRRoutes.js';
import tpRoutes from './Routes/tpRoutes.js';
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
app.use('/api/relatorioC', relatorioCRoutes);
app.use('/api/relatorioPR', relatorioPRRoutes);
app.use('/api/HistoricoProducao', historicoProducaoRoutes);

app.use('/api/tp', tpRoutes);
// Inicializa o servidor
app.listen(PORT, HOST, () => {
    console.log(`Servidor rodando em: http://${HOST}:${PORT}`);
});
