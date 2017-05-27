const {ObjectID} = require('mongodb');

const {mongoose} = require('../server/db/mongoose');
const {Todo} = require('../server/models/todo');
const {User} = require('../server/models/user');
// const id = '59297c7453ee8aad515da8e0';

// if(!ObjectID.isValid(id)){
//   console.log('ID not valid');
// }

// Todo.find({
//   _id: id
// })
//   .then((todos) => {
//     console.log(todos);
//   });

// Todo.findOne({_id: id})
//   .then((todo) => console.log(todo));

// Todo.findById(id)
//   .then((todo) => {
//     if(!todo)
//       return console.log('Id not found');
//     console.log(todo);
//   })
//   .catch((e) => console.log(e));

const userId = '592935e1cc8b4f93441dc7db';
User.findById(userId)
  .then((user) => {
    if(!user)
      return console.log('Id not found');
    console.log(user);
  })
  .catch((e) => console.log(e));