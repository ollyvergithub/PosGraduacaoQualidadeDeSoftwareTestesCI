// Endpoints
// GET /users -> Listar todos os usuarios
// POST /users -> Criar um novo usuario

// GET /users/:id -> Detalhar um usuario
// PUT /users/:id -> Atualizar um usuario
// DELETE /users/:id -> Remove um usuario

const request = require('supertest');
const { MongoClient } = require('mongodb');
const app = require('./app');

const UserRepository = require('./user-repository');

const database = 'PosGraduacaoQualidadeDeSoftwareTestesAppUsuarios';
const uri = 'mongodb://localhost:27017';

describe('UserApi', () => {
  let userRepository;
  let collection;
  let client;

  beforeAll(async () => {
    client = new MongoClient(`${uri}/${database}`);
    await client.connect();

    // Cria a collection
    collection = client.db('PosGraduacaoQualidadeDeSoftwareTestesAppUsuarios').collection('users');

    // Passa a collection para a Classe
    userRepository = new UserRepository(collection);
  });

  afterAll(async () => {
    await client.close();
  });

  beforeEach(async () => {
    // Deleta TODOS os registros para no momento do teste describe('findOneByEmail)
    // ele criar e retornar um único registro
    await collection.deleteMany({});
  });

  // GET /users
  describe('/users', () => {
    describe('GET /users -> Listar todos os usuarios', () => {
      it('Deve retornar uma lista vazia de usuários', async () => {
        const response = await request(app).get('/users');
        expect(response.statusCode).toBe(200);
        expect(response.body).toStrictEqual([]);
      });

      it('Deve retornar uma lista com os usuários', async () => {
        // Cria o registro
        await userRepository.insert({
          name: 'John Doe',
          email: 'john@doe.com',
        });
        await userRepository.insert({
          name: 'Bob Doe',
          email: 'bob@doe.com',
        });

        const response = await request(app).get('/users');
        expect(response.statusCode).toBe(200);
        expect(response.body[0]).toEqual(expect.objectContaining(
          {
            name: 'John Doe',
            email: 'john@doe.com',
          },
        ));
        expect(response.body[1]).toEqual(expect.objectContaining(
          {
            name: 'Bob Doe',
            email: 'bob@doe.com',
          },
        ));
      });
    });

    describe('POST /users -> Criar um novo usuario', () => {
      it('Deve criar um novo usuario', async () => {
        const response = await request(app).post('/users').send({
          name: 'John Doe',
          email: 'john@doe.com',
        });

        expect(response.statusCode).toBe(201);

        const user = await userRepository.findOneByEmail('john@doe.com');

        expect(user).toEqual(expect.objectContaining(
          {
            name: 'John Doe',
            email: 'john@doe.com',
          },
        ));
      });

      it.todo('Não deve permitir a inclusão de usuarios com e-mail duplicado');
    });
  });

  // GET /users/:id
  describe('/users/:id', () => {
    describe('GET /users/:id -> Detalhar um usuario', () => {
      it('Deve retornar os detalhes de um usuário', async () => {
        const user = await userRepository.insert({
          name: 'John Doe',
          email: 'john@doe.com',
        });

        const response = await request(app).get(`/users/${user._id}`);

        expect(response.statusCode).toBe(200);

        expect(response.body).toEqual(expect.objectContaining({
          name: 'John Doe',
          email: 'john@doe.com',
        }));
      });

      it('Deve retornar status code 404 para um usuario não existente', async () => {
        const fakeId = '62e52cd3866ef49879d44d1d';
        const response = await request(app).get(`/users/${fakeId}`);
        expect(response.statusCode).toBe(404);
        expect(response.body).toStrictEqual({
          message: 'User not found',
          code: 404,
        });
      });
    });

    describe('PUT /users/:id -> Atualizar um usuario', () => {
      it('Deve atualizar um usuário', () => {

      });

      it('Deve retornar status code 404 para um usuario não existente', () => {

      });
    });
    describe('DELETE /users/:id -> Excluir um usuario', () => {
      it('Deve atualizar um usuário', () => {

      });

      it('Deve retornar status code 404 para um usuario não existente', () => {

      });
    });
  });
});
