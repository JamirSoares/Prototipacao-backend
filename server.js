// server.js
const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");

// Importa as rotas
const processoRoutes = require("./routes/processoRoutes");
const modeloRoutes = require("./routes/modeloRoutes");
const partePecaRoutes = require("./routes/partePecaRoutes");
const variacaoRoutes = require("./routes/variacaoRoutes");
const atividadeRoutes = require("./routes/atividadesRoutes");
const posicaoRoutes = require("./routes/posicaoRoutes");
const tecidoRoutes = require("./routes/tecidoRoutes");

dotenv.config();
const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Rotas
app.use("/api/processos", processoRoutes);
app.use("/api/modelos", modeloRoutes);
app.use("/api/pecas", partePecaRoutes);
app.use("/api/variacoes", variacaoRoutes);
app.use("/api/atividades", atividadeRoutes);
app.use("/api/posicoes", posicaoRoutes);
app.use("/api/tecidos", tecidoRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "API funcionando com SQL Server 🚀" });
});
const PORT = 1241
// Inicialização do servidor
app.listen(PORT,() => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
