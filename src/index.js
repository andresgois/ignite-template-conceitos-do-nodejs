const express = require('express');
const cors = require('cors');
const { v4: uuidv4} = require('uuid')

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find( user => user.username === username);

  if(!user){
    return response.status(404).json({error: "User not exists"});
  }
  request.user = user;
  next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  const checkUserExists = users.some( (user) => user.username === username);
  
  if(checkUserExists){
    return response.status(400).send({error: 'Mensagem do erro'});
  }
  const user = { 
    id: uuidv4(),
    name, 
    username, 
    todos: []
  };
  
  users.push(user);
  return response.status(201).send(user);

});

// Criado para retorno todos os usuários
app.get('/users', (request, response) => {
  return response.json(users);
})

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;  
  const userTodo = user.todos;

  return response.send(userTodo)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todoOperation = { 
    id: uuidv4(),
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  };
  user.todos.push(todoOperation);

  return response.status(201).send(todoOperation);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const userTodo = user.todos.find( (user) => user.id === id)
  
  if(userTodo === undefined){
    return response.status(404).send({error: 'Mensagem do erro'});
  }
  userTodo.title = title
  userTodo.deadline = deadline
  userTodo.done
  
  return response.send(userTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;
  const userTodo = user.todos.find( (user) => user.id === id)

  if(userTodo === undefined){
    return response.status(404).send({error: 'Mensagem do erro'});
  }
  userTodo.done = true;

  return response.json(userTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;
  
  const userId = user.todos.find( item => item.id === id)
  if(userId === undefined){
    return response.status(404).json({error: "Mensagem do erro"})
  }
  user.todos.filter( item => {
    if(item.id === id)  user.todos.splice(item, 1)
  });
  
  return response.status(204).json(userId);
});

module.exports = app;