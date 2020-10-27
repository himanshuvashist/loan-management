const {app} = require('./app');
const request = require('supertest');

describe('Test root path', () => {
  it(`getting 200 response on GET request to ('/') path`, () => {
    return request(app)
      .get('/')
      .then(res => {
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(`😃`);
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

describe('Test /getdata path', () => {});

describe('Test /logout path', () => {});

describe('Test /submit path', () => {
    it(`get 400 on sending no body`, (done) => {
        request(app)
            .post('/submit')
            .then((res) => {
                expect(res.statusCode).toEqual(400)
                done()
            })
    })
})
