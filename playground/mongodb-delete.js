// const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

let obj = new ObjectID();
console.log(obj);

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if(err)
    return console.log('Unable to connect to MongoDB server');
  console.log('Connect to MongoDB server');

  //deleteMany
  // db.collection('Todos').deleteMany({text: 'delete'})
  //   .then((result) => {
  //     console.log(result);
  //   });

  //deleteOne
  // db.collection('Todos').deleteOne({text: 'delete'})
  //   .then((result) => console.log(result));

  //findOneAndDelete
  db.collection('Todos').findOneAndDelete({complete: false})
    .then((result) => {
      console.log(result);
    });

  db.close();
});
