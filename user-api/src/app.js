const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const { ObjectId } = require('mongodb');
const cors = require('cors');
const UserRepository = require('./user-repository');

const app = express();

app.use(bodyParser.json());
app.use(cors({
  allowedHeaders: ['X-Total-Count', 'Content-type'],
  exposedHeaders: ['X-Total-Count', 'Content-type'],
}));

let userRepository;
let collection;
let client;
let connected = false;

const database = 'PosGraduacaoQualidadeDeSoftwareTestesAppUsuarios';
const uri = 'mongodb://localhost:27017';
const usersDb = 'PosGraduacaoQualidadeDeSoftwareTestesAppUsuarios';

app.use(async (req, res, next) => {
  if (!connected) {
    client = new MongoClient(`${uri}/${database}`);
    await client.connect();
    // Cria a collection
    collection = client.db(usersDb).collection('users');
    // Passa a collection para a Classe
    userRepository = new UserRepository(collection);
    connected = true;
  }
  next();
});

app.get('/users', async (request, response) => {
  const users = await userRepository.findAll();
  response.setHeader('X-Total-Count', users.length);
  response.status(200).json(users);
});

app.post('/users', async (request, response) => {
  const user = await userRepository.insert(request.body);
  response.status(201).json(user);
});

app.get('/users/:id', async (request, response) => {
  try {
    const user = await userRepository.findOneById(ObjectId(request.params.id));
    response.json(user);
  } catch (e) {
    response.status(404).json({
      message: 'User not found',
      code: 404,
    });
  }
});

app.put('/users/:id', async (request, response) => {
  try {
    const user = await userRepository.update(ObjectId(request.params.id), request.body);
    response.json(user);
  } catch (e) {
    response.status(404).json({
      message: 'User not found',
      code: 404,
    });
  }
});

app.delete('/users/:id', async (request, response) => {
  try {
    await userRepository.delete(ObjectId(request.params.id));
    response.status(200).json(request.body);
  } catch (e) {
    console.log(e.message);
    response.status(404).json({
      message: 'User not found',
      code: 404,
    });
  }
});

module.exports = app;
