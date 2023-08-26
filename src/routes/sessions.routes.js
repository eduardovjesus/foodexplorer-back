const { Router } = require("express");

const SessionsController = require("../controllers/SessionsController");
const sessionsController = new SessionsController();

const sessionsRoutes = Router();

// Rota para criar uma sessão
sessionsRoutes.post("/", sessionsController.create);

module.exports = sessionsRoutes;
