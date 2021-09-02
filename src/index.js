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

  const userTodo = user.todos.some( (user) => user.id === id);

  if(!userTodo){
    return response.status(404).send({error: 'Mensagem do erro'});
  }
  
  
  const userTodo2 = user.todos.filter( (user) => {
    if(user.id === id){
      user.title = title 
      user.deadline = new Date(deadline) 
      user.done
    }
  });
  
  const x = user.todos.filter( (user) => user.id === id)
  delete x[0].id
  delete x[0].created_at
  
  return response.send(x[0]);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;
  const userTodo = user.todos.some( (user) => user.id === id)

  if(!userTodo){
    return response.status(404).send({error: 'Mensagem do erro'});
  }
  
  const userFiltro = user.todos.filter( item => {
    if(item.id === id){
      item.done = true;
    }
  });
  
  const retorno = user.todos.filter( item => item.id === id);

  return response.json(retorno[0]);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;
  
  const userId = user.todos.some( item => item.id === id)
  if(!userId){
    return response.status(404).json({error: "Mensagem do erro"})
  }
  const userFiltro = user.todos.filter( item => {
    if(item.id === id){
      user.todos.splice(item, 1)
    }
  });

  return response.status(204).json(userFiltro.title, userFiltro.deadline, userFiltro.done);
});

module.exports = app;