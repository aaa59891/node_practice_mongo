// const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

let obj = new ObjectID();
console.log(obj);

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if(err)
    return console.log('Unable to connect to MongoDB server');
  console.log('Connect to MongoDB server');

  // db.collection('Todos').insertOne({
  //   text: 'Something to do',
  //   complete: false
  // }, (err, result) => {
  //   if(err)
  //     return console.log('Unable to insert todo', err);
  //
  //   console.log(JSON.stringify(result.ops, undefined, 2));
  // });

  // db.collection('User').insertOne({
  //   name: 'chong',
  //   age: 20,
  //   location: 'taiwan'
  // }, (err, result) => {
  //   if(err)
  //     return console.log('Unable to insert a user', err);
  //   console.log(JSON.stringify(result.ops, undefined, 2));
  // })

  db.close();
});
