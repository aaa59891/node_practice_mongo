const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {app} = require('../server');
const {Todo} = require('../models/todo');
const {User} = require('../models/user');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');

beforeEach(populateTodos);
beforeEach(populateUsers);

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    const text = 'test todo text';
    request(app)
      .post('/todos')
      .send({text})
      .set('x-auth', users[0].tokens[0].token)
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
      .set('x-auth', users[0].tokens[0].token)
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
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.results[0].text).toBe(todos[0].text);
        expect(res.body.results.length).toBe(1);
      })
      .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('should return todo doc', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo).toInclude(todos[0]);
      })
      .end(done);
  });

  it('should not return todo doc created by other user ', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 if todo not found', (done) => {
    request(app)
      .get(`/todos/${new ObjectID().toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  })

  it('should return 404 for non-objectID', (done) => {
    request(app)
      .get('/todos/123abc')
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  })
});

describe('DELETE /todos/:id', () => {
  it('should remove a todo', (done) => {
    const id = todos[0]._id.toHexString();
    request(app)
      .delete(`/todos/${id}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(id);
      })
      .end((err, res) => {
        if(err)
          return done(err);
        Todo.findById(id)
          .then((todo) => {
            expect(todo).toNotExist();
            done();
          });
      });
  });

  it('should not remove a todo created by other user', (done) => {
    const id = todos[1]._id.toHexString();
    request(app)
      .delete(`/todos/${id}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end((err, res) => {
        if(err)
          return done(err);
        Todo.findById(id)
          .then((todo) => {
            expect(todo).toExist();
            done();
          });
      });
  });

  it('should return 404 if todo not found', (done) => {
    request(app)
      .delete(`/todos/${new ObjectID().toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 if object id is invalid', (done) => {
    request(app)
      .delete('/todos/123aqz')
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe('PATCH /todos/:id', () => {
  it('should update the todo', (done) => {
    const id = todos[0]._id.toHexString();
    request(app)
      .patch(`/todos/${id}`)
      .send({text: 'update', completed: true})
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(id);
        expect(res.body.todo.text).toBe('update');
        expect(res.body.todo.completed).toBe(true);
        expect(res.body.todo.completedAt).toBeA('number');
      })
      .end((err, res) => {
        if(err)
          return done(err);
        Todo.findById(id)
          .then((todo) => {
            expect(todo.completed).toBe(true);
            done();
          })
          .catch((e) => done(e));
      })
  });

  it('should not update the todo created by other user', (done) => {
    const id = todos[0]._id.toHexString();
    request(app)
      .patch(`/todos/${id}`)
      .send({text: 'update', completed: true})
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end((err, res) => {
        if(err)
          return done(err);
        Todo.findById(id)
          .then((todo) => {
            expect(todo.completed).toNotBe(true);
            done();
          })
          .catch((e) => done(e));
      })
  });

  it('should clear completeAt when todo is not completed', (done) => {
    const id = todos[1]._id.toHexString();
    request(app)
      .patch(`/todos/${id}`)
      .send({completed: false})
      .set('x-auth', users[1].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.completed).toBe(false);
      })
      .end((err, res) => {
        if(err)
          return done(err);
        Todo.findById(id)
          .then((todo) => {
            expect(todo.completed).toBe(false);
            expect(todo.completedAt).toNotExist();
            done();
          })
          .catch((e) => done(e));
      });
  });
});

describe('GET /users/me', () => {
  it('should return user if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });

  it('should return 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .end((err, res) => {
        expect(res.body).toEqual({});
        done();
      });
  });
});

describe('POST /users', () => {
  it('should create a user', (done) => {
    const testEmail = 'test@gmail.com';
    request(app)
      .post('/users')
      .send({email: testEmail, password:'1234qwer'})
      .expect(200)
      .end((err, res) => {
        if(err)
          return done(err);
        expect(res.body.user.email).toBe(testEmail);
        expect(res.body.user._id).toExist();
        expect(res.headers['x-auth']).toExist();

        User.findOne({email: testEmail})
          .then((user) => {
            expect(user).toExist();
            expect(user.password).toNotBe('1234qwer');
            done();
          })
          .catch(done);
      });
  });

  it('should return validation error if request invalid', (done) => {
    request(app)
      .post('/users')
      .send({})
      .expect(400)
      .end(done);
  });

  it('should not create user if email in use', (done) => {
    request(app)
      .post('/users')
      .send({email: users[0].email, password: users[0].password})
      .expect(400)
      .end(done);
  });
});

describe('POST /users/login', () => {
  it('should return a user', (done) => {
    request(app)
      .post('/users/login')
      .send({email: users[1].email, password: users[1].password})
      .expect(200)
      .end((err, res) => {
        if(err)
          return done(err);
        expect(res.body.user.email).toBe(users[1].email);
        expect(res.body.user._id).toBe(users[1]._id.toHexString());
        expect(res.headers['x-auth']).toExist();
        
        User.findById(users[1]._id)
          .then((user) => {
            expect(user.tokens[1]).toInclude({
              access: 'auth',
              token: res.headers['x-auth']
            });
            done();
          })
          .catch(done);
      });
  });

  it('should return 400 if user email is not exist', (done) => {
    request(app)
      .post('/users/login')
      .send({email: 'aaa@nonexist.com', password:'1234qwer'})
      .expect(400)
      .end(done);
  });

  it('should return 400 if password is wrong', (done) => {
    request(app)
      .post('/users/login')
      .send({email: users[1].email, password: 'qqqq11234'})
      .expect(400)
      .end((err, res) => {
        if(err)
          return done(err);
        expect(res.headers['x-auth']).toNotExist();
        
        User.findById(users[1]._id)
          .then((user) => {
            expect(user.token).toNotExist();
            done();
          })
          .catch(done);
      });
  });
});

describe('DELETE /users/me/token', () => {
  it('should remove auth token on logout', (done) => {
    request(app)
      .delete('/users/me/token')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .end((err, res) => {
        if(err)
          return done(err);
        User.findById(users[0]._id)
          .then((user) => {
            expect(user.tokens.length).toBe(0);
            done(); 
          })
          .catch(done);
      });
  });
});