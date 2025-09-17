const authService = require("../services/authService");

async function register(req, res) {
  try {
    const { username, password } = req.body;
    const user = await authService.register(username, password);
    res.status(201).json({ message: "Usuário criado com sucesso!", user: user.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function login(req, res) {
  try {
    const { username, password } = req.body;
    const { token, user } = await authService.login(username, password);
    res.json({ message: "Login realizado com sucesso", token, user: user.username });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
}

async function me(req, res) {
  try {
    res.json({ message: "Rota protegida acessada!", user: req.user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { register, login, me };
