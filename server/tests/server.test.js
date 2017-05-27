const expect = require('expect');
const request = require('supertest');

const {app} = require('../server');
const {Todo} = require('../models/todo');

beforeEach((done) => {
  Todo.remove({})
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
            expect(results.length).toBe(0);
            done();
          })
          .catch(done);

      });
  });
});