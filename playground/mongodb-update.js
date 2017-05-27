// const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

let obj = new ObjectID();
console.log(obj);

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if(err)
    return console.log('Unable to connect to MongoDB server');
  console.log('Connect to MongoDB server');

  db.collection('Todos').findOneAndUpdate({
    _id: new ObjectID('59276f44727ba740bd990dee')
  },{
    $set:{complete: true}
  },{
    returnOriginal: false
  })
  .then((result) => console.log(result));

  db.close();
});
