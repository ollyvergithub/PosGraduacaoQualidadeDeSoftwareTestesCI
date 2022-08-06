const { MongoClient } = require('mongodb');
const UserRepository = require('./user-repository');

let userRepository;
let collection;
let client;

(async () => {
  const database = 'PosGraduacaoQualidadeDeSoftwareTestesAppUsuarios';
  const uri = 'mongodb://localhost:27017';

  client = new MongoClient(`${uri}/${database}`);
  await client.connect();
  collection = client.db(database).collection('users');
  userRepository = new UserRepository(collection);
  await userRepository.deleteAll();
  await client.close();
  console.log('Database cleared');
})();
