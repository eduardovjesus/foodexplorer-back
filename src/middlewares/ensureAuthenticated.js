const { verify } = require("jsonwebtoken");
const knex = require('../database/knex');
const AppError = require('../utils/AppError');
const authConfig = require("../configs/auth");

function ensureAuthenticated(request, response, next) {
  const authHeader = request.headers.authorization;

  if(!authHeader) {
    throw new AppError("JWT Token não informado", 401);
  }

  const [, token] = authHeader.split(" ");

  try {
    const {sub: user_id} = verify(token, authConfig.jwt.secret);

    request.user = {
      id: Number(user_id),
    };

    return next();
  } catch {
    throw new AppError("JWT Token inválido", 401);
  }
}

async function ensureIsAdmin(request, response, next) {
  const user_id = request.user.id;

  const user = await knex("users").where({id: user_id}).first();

  if (!user.isAdmin) {
    throw new AppError("usuário não autorizado", 401)
  }

  next();
}

module.exports = { ensureAuthenticated, ensureIsAdmin };
