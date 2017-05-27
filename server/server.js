const express = require('express');
const bodyParser = require('body-parser');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');

const app = express();

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
  const todo = new Todo(req.body);
  todo.save()
    .then((result) => {
      console.log(result);
      res.send(result);
    })
    .catch((e) => {
      console.log('Todo can not be created. ');
      res.status(400).send(e);
    });
});

app.listen(3000, () => {
  console.log('Started on port 3000');
})

module.exports = {
  app
};
