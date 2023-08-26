const { Router } = require("express");

const UsersController = require("../controllers/UsersController");
const ensureAuthenticated = require("../middlewares/ensureAuthenticated");

const usersRoutes = Router();

const usersController = new UsersController();

// Rota para criação de usuários
usersRoutes.post("/", usersController.create);

// Rota para atualização de usuários, com autenticação obrigatória
usersRoutes.put("/", ensureAuthenticated, usersController.update);

module.exports = usersRoutes;
