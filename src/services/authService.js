const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const SECRET_KEY = "chave_secreta_super_segura"; // Trocar em produção!

async function register(username, password) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({ username, password: hashedPassword });
  return newUser;
}

async function login(username, password) {
  const user = await User.findOne({ where: { username } });

  if (!user) throw new Error("Usuário não encontrado");

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw new Error("Senha inválida");

  const token = jwt.sign(
    { id: user.id, username: user.username },
    SECRET_KEY,
    { expiresIn: "1h" }
  );

  return { token, user };
}

function verifyToken(token) {
  return jwt.verify(token, SECRET_KEY);
}

module.exports = { register, login, verifyToken };
