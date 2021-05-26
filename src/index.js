const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const checkIfUserExists = users.find(user => user.username === username);

  if (checkIfUserExists) {
    request.user = checkIfUserExists;
    next();
  } else {
    return response.status(404).json({ error: 'Usuário não encontrado'});
  }
}

function checksExistsTodo(request, response, next) {
  const user = request.user;
  const { id } = request.params;

  const todo = user.todos.find(todo => todo.id === id);

  if (todo) {
    request.todo = todo;
    next();
  } else {
    return response.status(404).json({ error: 'Todo não encontrado'});
  }
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const checkIfUserExists = users.find(user => user.username === username);

  if (checkIfUserExists) {
    return response.status(400).json({ error: 'Já existe um usuário com esse nome de usuário cadastrado no sistema'});
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get('/users', (request, response) => {
  return response.status(200).json(users);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const user = request.user;

  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const user = request.user;
  const { title, deadline } = request.body;
  const todo = {
    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    created_at: new Date(),
    done: false
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const user = request.user;
  const { title, deadline } = request.body;
  const todo = request.todo;

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.status(200).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const todo = request.todo;

  todo.done = true;

  return response.status(200).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const user = request.user;
  const { id } = request.params;

  console.log('iniciando a limpeza');
  user.todos = user.todos.filter(todo => todo.id !== id);
  console.log('removeu o todo');

  return response.status(204).json();
});

module.exports = app;