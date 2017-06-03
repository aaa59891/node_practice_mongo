require('./config/config');
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');

const port = process.env.PORT || 3000;


const app = express();

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
  const todo = new Todo(req.body);
  todo.save()
    .then((result) => {
      res.send(result);
    })
    .catch((e) => {
      res.status(400).send(e);
    });
});

app.get('/todos', (req, res) => {
  Todo.find()
    .then((results) => {
      res.send({results})
    }, (err) => {
      res.status(400).send(e);
    });
});

app.get('/todos/:id', (req, res) => {
  const {id} = req.params;
  if(!ObjectID.isValid(id))
    return res.status(404).send();

  Todo.findById(id)
    .then((todo) => {
      if(!todo)
        return res.status(404).send();
      res.send({todo});
    })
    .catch((e) => {
      res.status(400).send();
    });
});

app.delete('/todos/:id', (req, res) => {
  const {id} = req.params;
  if(!ObjectID.isValid(id))
    return res.status(404).send();

  Todo.findByIdAndRemove(id)
    .then((todo) => {
      if(!todo)
        return res.status(404).send();
      res.send({todo});
    })
    .catch((e) => {
      res.status(400).send();
    })
});

app.patch('/todos/:id', (req, res) => {
  const {id} = req.params;
  const body = _.pick(req.body, ['text', 'completed']);
  if(!ObjectID.isValid(id))
    return res.status(404).send();

  if(_.isBoolean(body.completed) && body.completed){
    body.completedAt = new Date().getTime();
  }else{
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findByIdAndUpdate(id, {$set: body}, {new: true})
    .then((todo) => {
      if(!todo)
        return res.status(404).send();
      res.send({todo});
    })
    .catch((e) => {
      res.status(400).send();
    })
});

app.post('/users', (req, res) => {
  const user = new User(_.pick(req.body, ['email', 'password']));

  user.save()
    .then(() => {
      return user.generateAuthToken();
      // res.send(user);
    })
    .then((token) => {
      console.log(token);
      res.header('x-auth', token).send({user});
    })
    .catch((e) => {
      res.status(400).send(e);
    })
});

app.listen(port, () => {
  console.log(`Started on port ${port}`);
})

module.exports = {
  app
};
