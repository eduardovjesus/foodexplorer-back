const { Router } = require("express");
const multer = require("multer");
const uploadConfig = require("../configs/upload");

const DishesController = require("../controllers/DishesController");
const ensureAuthenticated = require("../middlewares/ensureAuthenticated");
const ensureIsAdmin = require("../middlewares/ensureAuthenticated");

const dishesRoutes = Router();
const upload = multer(uploadConfig.MULTER);

const dishesController = new DishesController();

dishesRoutes.use(ensureAuthenticated);

// Rota para criar um novo prato
dishesRoutes.post("/", ensureIsAdmin, upload.single("image"), dishesController.create);

// Rota para listar todos os pratos
dishesRoutes.get("/", dishesController.index);

// Rota para buscar um prato específico pelo ID
dishesRoutes.get("/:id", dishesController.show);

// Rota para atualizar um prato existente pelo ID
dishesRoutes.put("/:id", ensureIsAdmin, upload.single("image"), dishesController.update);

// Rota para deletar um prato existente pelo ID
dishesRoutes.delete("/:id", ensureIsAdmin, dishesController.delete);

module.exports = dishesRoutes;
