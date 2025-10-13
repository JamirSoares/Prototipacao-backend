import express from 'express';
import cors from 'cors';

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
import allTablesInsertRoutes from "./Routes/allTablesRoutes.js";
const app = express();
const PORT = 1561;
const HOST = '0.0.0.0';

// Middlewares
app.use(cors({
    origin: '*',
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Rotas da API
app.use('/api/roles', roleRoutes);
app.use('/api/relatorioLD', relatorioLDRoutes);
app.use('/api/relatorioCMP', relatorioCMPRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/qualidade/api/historico', historicoRoutes);
app.use('/api/relatorioC', relatorioCRoutes);
app.use('/api/relatorioPR', relatorioPRRoutes);
app.use('/api/HistoricoProducao', historicoProducaoRoutes);

app.use('/api', allTablesInsertRoutes);
app.use('/api/tp', tpRoutes);
// Inicializa o servidor
app.listen(PORT, HOST, () => {
    console.log(`Servidor rodando em: http://${HOST}:${PORT}`);
});
