const {app} = require('./app');
const request = require('supertest');
const mongoose = require('mongoose');
const user = require('./models/user');
const application = require('./models/application');
const bcrypt = require('bcrypt');
const assert = require('assert');

let customerUserName = 'customerdemo';
let agentUserName = 'agentdemo';
let adminUserName = 'admindemo';
let customerEmail = 'customerdemo@email.com';
let agentEmail = 'agentdemo@email.com';
let adminEmail = 'admindemo@email.com';
let customerPassword = 'customerdemo';
let agentPassword = 'agentdemo';
let adminPassword = 'admindemo';
let adminId;
let customerId;
let agentId;

let applicationId;

let url = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

mongoose
  .connect(
    `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
    {useNewUrlParser: true, useUnifiedTopology: true}
  )
  .catch(err => {
    console.log(err);
    assert.equal(null, error);
  });

beforeAll(() => {
  //creating  3 users in db
  bcrypt.hash(adminPassword, process.env.SALT, function (err, hash) {
    assert.equal(null, err);
    const user_instance = new user();
    adminId = user_instance._id;
    user_instance.userName = adminUserName;
    user_instance.password = hash;
    user_instance.email = adminEmail;
    user_instance.userType = 'admin';
    user_instance.save(err => {
      assert.equal(null, err);
    });

    bcrypt.hash(agentPassword, process.env.SALT, function (err, hash) {
      assert.equal(null, err);
      const user_instance = new user();
      agentId = user_instance._id;
      user_instance.userName = agentUserName;
      user_instance.password = hash;
      user_instance.email = agentEmail;
      user_instance.userType = 'agent';
      user_instance.registeredUnder = adminId;
      user_instance.save(err => {
        assert.equal(null, err);
      });
    });

    bcrypt.hash(customerPassword, process.env.SALT, function (err, hash) {
      assert.equal(null, err);
      const user_instance = new user();
      customerId = user_instance._id;
      user_instance.userName = customerUserName;
      user_instance.password = hash;
      user_instance.email = customerEmail;
      user_instance.registeredUnder = adminId;
      user_instance.userType = 'customer';
      user_instance.save(err => {
        assert.equal(null, err);
      });
    });
  });

  const application_instance = new application();
  applicationId = application_instance._id;
  application_instance.application_id = application_instance._id;
  application_instance.submitted_by = agentId;
  application_instance.on_behalf = customerId;
  application_instance.tenure = 10;
  application_instance.amount = 10;
  application_instance.save(err => {
    assert.equal(null, err);
  });
});

afterAll(() => {
  user.deleteMany({userName: customerUserName}, err => {
    assert.equal(null, err);
  });
  user.deleteMany({userName: agentUserName}, err => {
    assert.equal(null, err);
  });
  user.deleteMany({userName: adminUserName}, err => {
    assert.equal(null, err);
  });
  application.deleteMany({_id: applicationId}, err => {
    assert.equal(null, err);
  });
});

describe('Test root path', () => {
  it(`getting 200 response on GET request to ('/') path`, done => {
    request(app)
      .get('/')
      .then(res => {
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(`😃`);
        done();
      });
  });
});

describe('Test /register path', () => {
  it(`get 400 on sending empty body`, done => {
    request(app)
      .post('/register')
      .then(res => {
        expect(res.statusCode).toEqual(400);
        done();
      });
  });
  it(`get 400 on sending without password key in body`, done => {
    request(app)
      .post('/register')
      .send({name: 'name', email: 'emai@email.com'})
      .then(res => {
        expect(res.statusCode).toEqual(400);
        done();
      });
  });
  it(`get 400 on sending without user key in body`, done => {
    request(app)
      .post('/register')
      .send({password: 'password', email: 'email@email.com'})
      .then(res => {
        expect(res.statusCode).toEqual(400);
        done();
      });
  });
  it(`get 400 on sending without email key in body`, done => {
    request(app)
      .post('/register')
      .send({name: 'name', password: 'password'})
      .then(res => {
        expect(res.statusCode).toEqual(400);
        done();
      });
  });
});

describe('Test /login path', () => {
  it(`get 400 on sending empty body`, done => {
    request(app)
      .post('/login')
      .then(res => {
        expect(res.statusCode).toEqual(400);
        done();
      });
  });
  it(`get 400 on sending without userName key`, done => {
    request(app)
      .post('/login')
      .send({password: 'password'})
      .then(res => {
        expect(res.statusCode).toEqual(400);
        done();
      });
  });
  it(`get 400 on sending without password key`, done => {
    request(app)
      .post('/login')
      .send({username: 'username'})
      .then(res => {
        expect(res.statusCode).toEqual(400);
        done();
      });
  });
});

let customerRequest = request(app)
  .post('/login')
  .send({email: customerEmail, password: customerPassword});
let agentRequest = request(app).post('/login').send({email: agentEmail, password: agentPassword});
let adminRequest = request(app).post('/login').send({email: adminEmail, password: adminPassword});

describe('test /submit', () => {
  it('get 200 for submmiting application as agent', done => {
    agentRequest.then(res => {
      request(app)
        .post('/submit')
        .auth(res.body.accessToken, {type: 'bearer'})
        .send({on_behalf: customerEmail, tenure: 1, amount: 1})
        .then(res => {
          expect(res.statusCode).toBe(200);
          done();
        });
    });
  });
  it(`get 401 on sending no body`, done => {
    request(app)
      .post('/submit')
      .then(res => {
        expect(res.statusCode).toEqual(401);
        done();
      });
  });
});

describe('Test /applicationlist path', () => {
  it('get 200 for submmiting application as agent', done => {
    agentRequest.then(res => {
      request(app)
        .post('/applicationlist')
        .auth(res.body.accessToken, {type: 'bearer'})
        .then(res => {
          expect(res.statusCode).toBe(200);
          done();
        });
    });
  });
});

describe('Test /userlist path', () => {
  it('get 200 for submmiting application as agent', done => {
    agentRequest.then(res => {
      request(app)
        .post('/userlist')
        .auth(res.body.accessToken, {type: 'bearer'})
        .then(res => {
          expect(res.statusCode).toBe(200);
          done();
        });
    });
  });
});

describe('Test /promotion', () => {
  it('get 200 for promoting user by admin', done => {
    adminRequest.then(res => {
      request(app)
        .post('/promotion')
        .auth(res.body.accessToken, {type: 'bearer'})
        .send({email: 'customer'})
        .then(res => {
          expect(res.statusCode).toBe(200);
          done();
        });
    });
  });
  it('get 403 for promoting user by agent', done => {
    agentRequest.then(res => {
      request(app)
        .post('/promotion')
        .auth(res.body.accessToken, {type: 'bearer'})
        .send({email: 'customer'})
        .then(res => {
          expect(res.statusCode).toBe(403);
          done();
        });
    });
  });
});

describe('Test /edituser path', () => {
  it('get 200 for submmiting edit user as agent', done => {
    agentRequest.then(res => {
      request(app)
        .post('/edituser')
        .auth(res.body.accessToken, {type: 'bearer'})
        .send({email: customerEmail, userName: customerUserName})
        .then(res => {
          expect(res.statusCode).toBe(200);
          done();
        });
    });
  });
});

describe('Test /applicationupdate', () => {
  it('get 400 for updating application application as agent without body', done => {
    agentRequest.then(res => {
      request(app)
        .post('/applicationupdate')
        .auth(res.body.accessToken, {type: 'bearer'})
        .then(res => {
          expect(res.statusCode).toBe(400);
          done();
        });
    });
  });
  it('get 200 for updating application application as agent', done => {
    agentRequest.then(res => {
      request(app)
        .post('/applicationupdate')
        .auth(res.body.accessToken, {type: 'bearer'})
        .send({applicationId, tenure: 5, amount: 5})
        .then(res => {
          expect(res.statusCode).toBe(200);
          done();
        });
    });
  });
});

describe('Test /applicationstatusupdate', () => {
  it('get 400 for updating application status as agent without body', done => {
    agentRequest.then(res => {
      request(app)
        .post('/applicationstatusupdate')
        .auth(res.body.accessToken, {type: 'bearer'})
        .then(res => {
          expect(res.statusCode).toBe(400);
          done();
        });
    });
  });
  it('get 200 for updating application status as admin', done => {
    adminRequest.then(res => {
      request(app)
        .post('/applicationstatusupdate')
        .auth(res.body.accessToken, {type: 'bearer'})
        .send({applicationId, approved: true})
        .then(res => {
          expect(res.statusCode).toBe(200);
          done();
        });
    });
  });
});

describe('Test /logout path', () => {
  it('get 200 on logout', done => {
    request(app)
      .post('/logout')
      .then(res => {
        expect(res.statusCode).toEqual(200);
        done();
      });
  });
});
