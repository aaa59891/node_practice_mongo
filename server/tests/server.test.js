const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('../server');
const {Todo} = require('../models/todo');

const todos = [{
  _id: new ObjectID(),
  text: 'First test todo'
},{
  _id: new ObjectID(),
  text: 'Second test todo'
}];

beforeEach((done) => {
  Todo.remove({})
    .then(() => Todo.insertMany(todos))
    .then(() => done());
});

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    const text = 'test todo text';
    request(app)
      .post('/todos')
      .send({text})
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text);
      })
      .end((err, res) => {
        if(err)
          return done(err);
        
        Todo.find({text})
          .then((todo) => {
            expect(todo[0].text).toBe(text);
            expect(todo.length).toBe(1);
            done();
          })
          .catch(done);
      });
  });

  it('should not create todo with invalid body data', (done) => {
    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, result) => {
        if(err)
          return done(err);
        Todo.find({})
          .then((results) => {
            expect(results.length).toBe(todos.length);
            done();
          })
          .catch(done);

      });
  });
});

describe('GET /todos', () => {
  it('should get all todos', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect((res) => {
        expect(res.body.results.length).toBe(todos.length);
      })
      .end(done);
  });
});

describe('GET /todo/:id', () => {
  it('should return todo doc', (done) => {
    request(app)
      .get(`/todo/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo).toInclude(todos[0]);
      })
      .end(done);
  });

  it('should return 404 if todo not found', (done) => {
    request(app)
      .get(`/todo/${new ObjectID().toHexString()}`)
      .expect(404)
      .end(done);
  })

  it('should return 404 for non-objectID', (done) => {
    request(app)
      .get('/todo/123abc')
      .expect(404)
      .end(done);
  })
});