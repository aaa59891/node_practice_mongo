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

app.listen(port, () => {
  console.log(`Started on port ${port}`);
})

module.exports = {
  app
};
