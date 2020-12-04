const mongoose = require('mongoose');
const dotenv = require('dotenv');
const result = dotenv.config({silent: true});
const assert = require('assert');
const user = require('./models/user');
const bcrypt = require('bcrypt');

if (result.error) {
  console.log("dotenv file maybe not present, but its okay its for development purpose");
}

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

let adminUserName = 'admindemo1';
let adminEmail = 'admindemo1@email.com';
let adminPassword = 'admindemo1';
let adminId;

describe('Db insertion', () => {
  afterAll(async () => {
    user.deleteMany({email: adminEmail}, err => {
      assert.equal(null, err);
    });
  });

  it(`inserting one user`, async done => {
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
        expect(err).toBe(null);
        done();
      });
    });
  });
});
