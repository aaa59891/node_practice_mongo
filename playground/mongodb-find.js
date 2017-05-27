// const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

let obj = new ObjectID();
console.log(obj);

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if(err)
    return console.log('Unable to connect to MongoDB server');
  console.log('Connect to MongoDB server');

  db.collection('Todos').find().toArray()
    .then((docs) => {
      console.log(JSON.stringify(docs, undefined, 2));
    }, (err) => {
      console.log(err);
    })

  db.close();
});
