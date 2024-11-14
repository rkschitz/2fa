const user = require("../model/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require('dotenv').config();

const SECRET_KEY = process.env.JWT_SECRET;
const SALT_VALUE = 10;

class UserController {
  async createUser(nome, email, senha, role) {
    if (!nome || !email || !senha) {
      throw new Error("Nome, email e senha são obrigatórios.");
    }

    const cypherSenha = await bcrypt.hash(String(senha), SALT_VALUE);

    const userValue = await user.create({
      nome,
      email,
      senha: cypherSenha,
      role
    });

    return userValue;
  }

  async findUser(id) {
    if (id === undefined) {
      throw new Error("Id é obrigatório.");
    }

    const userValue = await user.findByPk(id);

    if (!userValue) {
      throw new Error("Usuário não encontrado.");
    }

    return userValue;
  }

  async update(id, nome, email, senha) {
    const oldUser = await user.findByPk(id);
    if (email) {
      const sameEmail = await user.findOne({ where: { email } });
      if (sameEmail && sameEmail.id !== id) {
        throw new Error("Email já cadastrado.");
      }
    }
    oldUser.nome = nome || oldUser.nome;
    oldUser.email = email || oldUser.email;
    oldUser.senha = senha
      ? await bcrypt.hash(String(senha), SALT_VALUE)
      : oldUser.senha;
    oldUser.save();

    return oldUser;
  }

  async delete(id) {
    if (id === undefined) {
      throw new Error("Id é obrigatório.");
    }
    const userValue = await this.findUser(id);
    userValue.destroy();

    return;
  }

  async find() {
    return user.findAll();
  }



  async login(email, senha) {
    if (!email || !senha) {
      throw new Error("Email e senha são obrigatórios.");
    }

    const userValue = await user.findOne({ where: { email } });

    if (!userValue) {
      throw new Error("Usuário e senha inválidos.");
    }

    const senhaValida = await bcrypt.compare(String(senha), userValue.senha);
    if (!senhaValida) {
      throw new Error("Usuário e senha inválidos.");
    }

    console.log(process.env.MAILTRAP_PASS)

    // Configuração do nodemailer para enviar o e-mail
    const transporter = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 587,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    });

    // Token de verificação enviado por e-mail
    const verificationToken = jwt.sign({ email }, SECRET_KEY, { expiresIn: "10m" });

    const mailOptions = {
      from: "hello@demomailtrap.com",
      to: email,
      subject: "Seu código de verificação",
      text: `Seu código de verificação é: ${verificationToken}`,
    };

    // Enviar o e-mail
    transporter.sendMail(mailOptions);

    // Token de autenticação de longa duração
    const token = jwt.sign({ id: userValue.id, role: userValue.role }, SECRET_KEY, { expiresIn: "1h" });
  
    // Retorna ambos os tokens
    return {
      message: "Código de verificação enviado para o seu e-mail.",
      token
    };
  }

  // Método de verificação de e-mail
  async verificarEmailToken(token) {
    const decoded = jwt.verify(token, SECRET_KEY);
    try {
      return { message: "Autenticação bem-sucedida!", email: decoded.email };
    } catch (error) {
      throw new Error("Token inválido ou expirado.");
    }
  }
}

module.exports = new UserController();
