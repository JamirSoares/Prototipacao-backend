const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require("body-parser");
const sequelize = require("./models/database");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Servir imagens estáticas
const caminhoImagens = path.join(__dirname, '/config/assets/imagem');
console.log('Servindo arquivos estáticos de:', caminhoImagens);
app.use('/src/config/assets/imagem', express.static(caminhoImagens));

// Rotas principais (todas agrupadas em ./routes/index.js)
const routes = require('./routes');
app.use('/api', routes);

// Sincronizar banco antes de iniciar servidor
sequelize.sync().then(() => {
  console.log("Banco sincronizado com sucesso!");
  const PORT = 15995;
  app.listen(PORT,"0.0.0.0", () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
}).catch(err => {
  console.error("❌ Erro ao sincronizar banco:", err.message);
});
