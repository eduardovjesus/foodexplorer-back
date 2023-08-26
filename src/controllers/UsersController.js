// Importa o bcryptjs para criptografar senhas
const { hash, compare } = require("bcryptjs");

// Importa a classe AppError, que é usada para retornar erros padronizados em respostas HTTP
const AppError = require("../utils/AppError");

// Importa o Knex.js, que é um query builder para construir consultas SQL de forma programática
const knex = require("../database/knex");

class UsersController {
  async create(request, response) {
    // Extrai o nome, e-mail e senha do corpo da requisição HTTP
    const { name, email, password } = request.body;

    // Checa se um usuário já existe no banco de dados com o mesmo e-mail
    const checkUserExists = await knex("users").where({ email }).first();

    // Se o usuário já existe, retorna um erro com status 401 (Unauthorized)
    if (checkUserExists) {
      throw new AppError("Este e-mail já está em uso", 401);
    }

    // Cria um hash da senha usando o bcryptjs com um custo de 8
    const hashedPassword = await hash(password, 8);

    // Insere o novo usuário no banco de dados
    await knex("users").insert({ name, email, password: hashedPassword });

    // Retorna uma resposta HTTP com status 201 (Created)
    return response.status(201).json();
  }

  async update(request, response) {
    // Extrai o nome, e-mail, senha antiga e nova senha do corpo da requisição HTTP
    const { name, email, password, old_password } = request.body;

    // Extrai o ID do usuário da requisição HTTP (que foi definido pelo middleware de autenticação)
    const user_id = request.user.id;

    // Checa se o usuário existe no banco de dados
    const user = await knex("users").where({ id: user_id }).first();

    // Se o usuário não existe, retorna um erro com status 401 (Unauthorized)
    if (!user) {
      throw new AppError("Usuário não encontrado", 401);
    }

    // Checa se outro usuário já está usando o novo e-mail
    const userWithUpdatedEmail = await knex("users").where({ email }).first();

    // Se o e-mail já está sendo usado por outro usuário, retorna um erro com status 401 (Unauthorized)
    if (userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id) {
      throw new AppError("Este e-mail já está em uso", 401);
    }

    // Atualiza o nome e e-mail do usuário com os valores fornecidos no corpo da requisição
    user.name = name ?? user.name;
    user.email = email ?? user.email;

    // Para possiveis trilhas extras
    // Se a nova senha for fornecida mas a senha antiga não, retorna um erro com status 401 (Unauthorized)
    if (password && !old_password) {
      throw new AppError(
        "Você precisa informar a senha antiga para definir a nova senha",
        401
      );
    }

    // Se a nova senha e a senha antiga forem fornecidas, checa se a senha antiga confere
    if (password && old_password) {
      const checkOldPassword = await compare(old_password, user.password);

      // Se a senha antiga não confere, retorna um erro com status 401 (Unauthorized)
      if (!checkOldPassword) {
        throw new AppError("A senha antiga está incorreta", 401);
      }

      // Cria um hash da nova senha usando o bcryptjs com um custo de 8
      user.password = await hash(password, 8);
    }

    // Atualiza as informações do usuário no banco de dados
    await knex("users")
      .where({ id: user_id })
      .update({
        name: user.name,
        email: user.email,
        password: user.password,
      });

    // Atualiza a coluna "updated_at" com a data e hora atual
    await knex("users").where({ id: user_id }).update("updated_at", knex.fn.now());

    // Retorna uma resposta HTTP com status 200 (OK)
    return response.status(200).json();
  }
}

// Exporta a classe UsersController para ser usada em outros arquivos
module.exports = UsersController;
