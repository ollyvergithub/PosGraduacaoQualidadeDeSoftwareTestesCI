const { MongoClient } = require('mongodb');
const UserRepository = require('./user-repository');

const database = 'PosGraduacaoQualidadeDeSoftwareTestesAppUsuarios';
const uri = 'mongodb://localhost:27017';

describe('UserRepository', () => {
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

  describe('findOneByEmail', () => {
    it('Deve retornar um usuário john@doe.com ', async () => {
      // Cria o registro
      const result = await collection.insertOne({
        name: 'John Doe',
        email: 'john@doe.com',
      });

      // Busca o registro do Banco
      const user = await userRepository.findOneByEmail('john@doe.com');

      expect(user).toStrictEqual({
        _id: result.insertedId,
        name: 'John Doe',
        email: 'john@doe.com',
      });
    });

    // Nesse momento o registro ainda não foi criado por causa do beforeEach que roda a cada teste
    it('Deve lançar uma exceção para um usuário não existente ', async () => {
      await expect(userRepository.findOneByEmail('john@doe.com'))
        .rejects.toThrow('Usuário com o email john@doe.com não existe!!');
    });
  });

  describe('insert', () => {
    it('Deve inserir um novo usuário', async () => {
      // Cria o registro
      const user = await userRepository.insert({
        name: 'John Doe',
        email: 'john@doe.com',
      });

      const result = await userRepository.findOneByEmail('john@doe.com');

      expect(result).toStrictEqual(user);
    });
  });

  describe('update', () => {
    it('Deve atualizar um usuário existente', async () => {
      // Cria o registro
      const user = await userRepository.insert({
        name: 'John Doe',
        email: 'john@doe.com',
      });

      const id = user._id;

      const payload = {
        name: 'John Doe - ALTERADO',
        email: 'john.alterado@doe.com',
      };
      const result = await userRepository.update(id, payload);

      const busca = await userRepository.findOneByEmail(payload.email);

      expect(busca.email).toStrictEqual('john.alterado@doe.com');

      console.log('XXXXXXXXXXX RESULT update ', result);
      console.log('XXXXXXXXXXX RESULT busca ', busca);
    });

    it('Deve lançar uma exceção para um usuário não existente', async () => {
      await expect(userRepository.findOneByEmail('john@doe.com'))
        .rejects.toThrow('Usuário com o email john@doe.com não existe!!');
    });
  });

  describe('delete', () => {
    it('Deve remover um usuário existente ', async () => {
      // Cria o registro
      const user = await userRepository.insert({
        name: 'John Doe',
        email: 'john@doe.com',
      });

      const id = user._id;

      const result = await userRepository.delete(id);

      console.log('XXXXXXXXXXXXXX Result ', result);

      const resultadoEsperado = { acknowledged: true, deletedCount: 1 };

      expect(result).toStrictEqual(resultadoEsperado);

      await expect(userRepository.findOneByEmail('john@doe.com'))
        .rejects.toThrow('Usuário com o email john@doe.com não existe!!');
    });

    it('Deve lançar uma exceção para um usuário não existente', async () => {
      await expect(userRepository.findOneByEmail('john@doe.com'))
        .rejects.toThrow('Usuário com o email john@doe.com não existe!!');
    });
  });

  describe('findAll', () => {
    it('Deve retornar uma lista vazia de usuários', async () => {
      const result = await userRepository.findAll();

      expect(result).toHaveLength(0);
    });

    it('Deve retornar uma lista contendo usuários cadastrados', async () => {
      // Cria o registro
      await userRepository.insert({
        name: 'John Doe',
        email: 'john@doe.com',
      });

      // Cria o registro
      await userRepository.insert({
        name: 'John Doe SEgundo',
        email: 'john.segundo@doe.com',
      });

      const results = await userRepository.findAll();

      const arrayEmails = [];
      results.map((result) => arrayEmails.push(result.email));

      const arrayExpected = ['john@doe.com', 'john.segundo@doe.com'];

      expect(arrayEmails).toEqual(expect.arrayContaining(arrayExpected));
      expect(results).toHaveLength(2);
    });
  });
});
