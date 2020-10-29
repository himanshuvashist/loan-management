const express = require('express');
const app = express();
const port = 3000;
// const logger = require('morgan')
const cors = require('cors');
var cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const user = require('./models/user');
const application = require('./models/application');
const jwt = require('jsonwebtoken');
app.use(express.json());
app.use(cookieParser());

const corsConfig = {
  origin: 'http://ec2-15-207-236-232.ap-south-1.compute.amazonaws.com',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
  credentials: true,
};
app.use(cors(corsConfig));

const result = dotenv.config();

if (result.error) {
  throw result.error;
}

saltRounds = 10;

try {
  console.log(
    `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
  );
  mongoose
    .connect(
      `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
      {useNewUrlParser: true, useUnifiedTopology: true}
    )
    .catch(err => {
      console.log(err);
    });
} catch (error) {
  console.log(`Error while connecting to DB: ${error}`);
  console.log('Please Ensure a proper connection to DB first');
}

app.get('/', (req, res) => {
  res.json('😃');
});

app.post('/login', (req, res) => {
  if (req.body.email && req.body.password) {
    user.findOne({email: req.body.email}, (err, docs) => {
      if (err) return res.sendStatus(500); //internal server error
      if (docs == null) return res.sendStatus(404); //not found
      bcrypt.compare(req.body.password, docs.password, (err, result) => {
        if (err) return res.sendStatus(500);

        var accessToken = jwt.sign(
          {id: docs._id, userType: docs.userType},
          process.env.JWT_ACCESS_TOKEN_SECRET_KEY,
          {
            expiresIn: '20m',
          }
        );
        var refreshToken = jwt.sign({foo: 'bar'}, process.env.JWT_REFRESH_TOKEN_SECRET_KEY);

        if (result) {
          //  set cookie flag secure in production
          res.cookie('token', refreshToken, {
            expires: new Date(Date.now() + 900000),
            httpOnly: true,
          });
          return res.json({
            accessToken,
            refreshToken,
            loggedin: 1,
            userType: docs.userType,
            userName: docs.userName,
          });
        }
        return res.json({loggedin: 0});
      });
    });
  } else {
    res.sendStatus(400);
  }
});

//authentication middleware
const authenticateRequest = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET_KEY, (err, data) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          const refreshToken = req.cookies.token;
          jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET_KEY, (err, data) => {
            if (err) {
              res.sendStatus(401);
            } else {
              next();
            }
          });
        } else {
          return res.sendStatus(403); //forbidden
        }
      } else {
        data.user = user;
        next();
      }
    });
  } else {
    res.sendStatus(401); // unauthorized
  }
};
//registraion middlewares
const registrationPreCheck = async (req, res, next) => {
  if (!(req.body.hasOwnProperty(`email`) && req.body.email != '')) return res.sendStatus(400);
  if (!(req.body.hasOwnProperty(`name`) && req.body.name != '')) return res.sendStatus(400);
  if (!(req.body.hasOwnProperty(`password`) && req.body.password != '')) return res.sendStatus(400);
  if (!req.body.hasOwnProperty('adminRegistration')) {
    return res.sendStatus(400);
  }
  if (!req.body.adminRegistration) {
    if (!req.body.hasOwnProperty('adminId')) return res.sendStatus(400);
  }

  let r = await user.countDocuments({email: req.body.email});
  if (r) return res.sendStatus(403);

  let u = await user.countDocuments({userName: req.body.name});
  if (u) return res.sendStatus(403);

  next();
};

app.post('/register', registrationPreCheck, (req, res) => {
  bcrypt.hash(req.body.password, process.env.SALT, function (err, hash) {
    if (err) return res.sendStatus(500);
    const user_instance = new user();
    user_instance.userName = req.body.name;
    user_instance.password = hash;
    user_instance.email = req.body.email;
    if (!req.body.adminRegistration) {
      user_instance.registeredUnder = req.body.adminId;
    }
    user_instance.userType = req.body.adminRegistration ? 'admin' : 'customer';
    user_instance.save(err => {
      if (err) {
        res.sendStatus(403);
      } else {
        res.send({response: 'successfully inserted'});
      }
    });
  });
});

const checkApplicationForm = (req, res, next) => {
  // TODO
  if (!req.body.hasOwnProperty('on_behalf') && req.body.on_behalf != '') return res.sendStatus(400);
  if (!req.body.hasOwnProperty('tenure') && req.body.tenure !== 0) return res.sendStatus(400);
  if (!req.body.hasOwnProperty('amount') && req.body.amount !== 0) return res.sendStatus(400);

  //check if application is being submitted by the agent only
  const authHeader = req.headers.authorization;
  const token = authHeader.split(' ')[1];
  const decoded = jwt.decode(token);
  user.findById(decoded.id, (err, docs) => {
    if (err) {
      return res.sendStatus(500);
    } else if (!docs || docs.userType !== 'agent') {
      return res.sendStatus(403);
    } else {
      req.body.submitted_by = decoded.id;
      next();
    }
  });
};

app.post('/submit', authenticateRequest, checkApplicationForm, async (req, res) => {
  // TODO - add form to the db
  let application_instance = new application();
  const submitted_by = user.findById(req.body.submitted_by).exec();
  const on_behalf = user.findOne({email: req.body.on_behalf}).exec();
  const promisis = [submitted_by, on_behalf];
  Promise.all(promisis)
    .then(re => {
      let if_any_null = false;
      re.forEach(doc => {
        if (doc === null) {
          if_any_null = true;
        }
      });
      if (if_any_null) {
        res.sendStatus(403);
      } else {
        application_instance.application_id = application_instance._id;
        application_instance.submitted_by = re[0]._id;
        application_instance.on_behalf = re[1]._id;
        application_instance.stage = req.body.stage;
        application_instance.tenure = req.body.tenure;
        application_instance.amount = req.body.amount;
        application_instance.save(err => {
          if (err) return res.sendStatus(500);
          res.sendStatus(200);
        });
      }
    })
    .catch(r => {
      res.sendStatus(403);
    });
});

const PromotionPreCheck = (req, res, next) => {
  if (!(req.body.hasOwnProperty(`email`) && req.body.email != '')) return res.sendStatus(400);
  const authHeader = req.headers.authorization;
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET_KEY, (err, decoded) => {
    if (err) return res.sendStatus(403);
    if (decoded.userType !== 'admin') {
      return res.sendStatus(403);
    } else {
      next();
    }
  });
};
app.post('/promotion', authenticateRequest, PromotionPreCheck, (req, res) => {
  user.findOneAndUpdate({email: req.body.email}, {userType: 'agent'}, (err, docs) => {
    if (err) {
      res.sendStatus(500);
    } else {
      res.sendStatus(200);
    }
  });
});

const applicationStatusUpdatePreCheck = (req, res, next) => {
  if (!(req.body.hasOwnProperty(`applicationId`) && req.body.applicationId != ''))
    return res.sendStatus(400);
  if (!req.body.hasOwnProperty('approved')) return res.sendStatus(400);
  const authHeader = req.headers.authorization;
  const token = authHeader.split(' ')[1];
  const decoded = jwt.decode(token, process.env.JWT_ACCESS_TOKEN_SECRET_KEY);
  if (decoded.userType === 'admin') {
    req.body.approved_by = decoded._id;
    next();
  } else {
    return res.sendStatus(403);
  }
};
app.post(
  '/applicationstatusupdate',
  authenticateRequest,
  applicationStatusUpdatePreCheck,
  (req, res) => {
    // TODO

    application.findByIdAndUpdate(
      req.body.applicationId,
      {status: req.body.approved ? 'approved' : 'rejected', approved_by: req.body.approved_by},
      (err, data) => {
        if (err) {
          res.sendStatus(403);
        } else {
          res.sendStatus(200);
        }
      }
    );
  }
);

const updatePreCheck = (req, res, next) => {
  if (!(req.body.hasOwnProperty(`applicationId`) && req.body.applicationId != ''))
    return res.sendStatus(400);
  if (!(req.body.hasOwnProperty(`tenure`) && req.body.tenure != 0)) return res.sendStatus(400);
  if (!(req.body.hasOwnProperty(`amount`) && req.body.amount != 0)) return res.sendStatus(400);
  const authHeader = req.headers.authorization;
  const token = authHeader.split(' ')[1];
  const decoded = jwt.decode(token, process.env.JWT_ACCESS_TOKEN_SECRET_KEY);
  if (decoded.userType === 'agent') {
    next();
  } else {
    res.sendStatus(403);
  }
};

app.post('/applicationupdate', authenticateRequest, updatePreCheck, (req, res) => {
  application.find({application_id: req.body.applicationId}, (err, data) => {
    if (err) {
      return res.sendStatus(500);
    } else if (data.length === 1) {
      let application_instance = new application();
      application_instance.application_id = data[0]._id;
      application_instance.submitted_by = data[0].submitted_by;
      application_instance.on_behalf = data[0].on_behalf;
      application_instance.approved_by = data[0].approved_by;
      application_instance.status = data[0].status;
      application_instance.date = data[0].date;
      application_instance.amount = data[0].amount;
      application_instance.tenure = data[0].tenure;
      application_instance.save(err => {
        if (err) {
          return res.sendStatus(500);
        } else {
          data[0].tenure = req.body.tenure;
          data[0].amount = req.body.amount;
          data[0].date = Date.now();
          data[0].save(err => {
            if (err) {
              return res.sendStatus(500);
            } else {
              return res.sendStatus(200);
            }
          });
        }
      });
    } else if (data.length === 2) {
      let n = 0;
      let o = 0;
      if (data[0]._id.toString() === data[0].application_id.toString()) {
        o = 1;
      } else {
        n = 1;
      }
      data[o].amount = data[n].amount;
      data[o].tenure = data[n].tenure;
      data[o].save(err => {
        if (err) {
          return res.sendStatus(500);
        } else {
          data[n].amount = req.body.amount;
          data[n].tenure = req.body.tenure;
          data[n].save(err => {
            if (err) {
              return res.sendStatus(500);
            } else {
              return res.sendStatus(200);
            }
          });
        }
      });
    } else {
      res.send('some else is happening');
    }
  });
});

const editUserPreCheck = (req, res, next) => {
  if (!(req.body.hasOwnProperty('email') && req.body.email !== '')) {
    return res.sendStatus(403);
  }
  if (!(req.body.hasOwnProperty('userName') && req.body.userName !== '')) {
    return res.sendStatus(403);
  }
  const authHeader = req.headers.authorization;
  const token = authHeader.split(' ')[1];
  const decoded = jwt.decode(token, process.env.JWT_ACCESS_TOKEN_SECRET_KEY);
  if (decoded.userType === 'agent' || decoded.userType === 'admin') {
    next();
  } else {
    res.sendStatus(403);
  }
};
app.post('/edituser', authenticateRequest, editUserPreCheck, (req, res) => {
  // TODO
  user.findOneAndUpdate({email: req.body.email}, {userName: req.body.userName}, (err, docs) => {
    if (err) {
      res.sendStatus(500);
    } else {
      res.sendStatus(200);
    }
  });
});

const userListPreCheck = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.split(' ')[1];
  const decoded = jwt.decode(token, process.env.JWT_ACCESS_TOKEN_SECRET_KEY);
  req.userType = decoded.userType;
  next();
};
app.post('/userlist', authenticateRequest, userListPreCheck, (req, res) => {
  if (req.userType === 'admin') {
    // send all customer and agents
    user.find({userType: 'agent'}, (err, agents) => {
      if (err) {
        res.sendStatus(500);
      } else {
        user.find({userType: 'customer'}, (err, customers) => {
          if (err) {
            res.sendStatus(500);
          } else {
            res.json([...agents, ...customers]);
          }
        });
      }
    });
  } else if (req.userType === 'agent') {
    // send all customers
    user.find({userType: 'customer'}, (err, customers) => {
      if (err) {
        res.sendStatus(500);
      } else {
        res.json([...customers]);
      }
    });
  } else {
    res.sendStatus(403);
  }
});

const applicationlistPreCheck = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.split(' ')[1];
  req.body.userId = jwt.decode(token).id;
  user.findById(req.body.userId, (err, docs) => {
    if (err) {
      res.sendStatus(500);
    } else if (docs === null) {
      res.sendStatus(404);
    } else {
      req.body.userType = docs.userType;
      next();
    }
  });
};

app.post('/applicationlist', authenticateRequest, applicationlistPreCheck, (req, res) => {
  if (req.body.userType === 'customer') {
    application.find({on_behalf: req.body.userId}, (err, docs) => {
      if (err) {
        res.sendStatus(500);
      } else if (docs === null) {
        res.sendStatus(404);
      } else {
        const l = docs.filter(doc => doc._id.toString() === doc.application_id.toString());
        res.json(l);
      }
    });
  } else {
    application.find({}, (err, docs) => {
      if (err) {
        res.sendStatus(500);
      } else if (docs === null) {
        res.sendStatus(404);
      } else {
        const l = docs.filter(doc => doc._id.toString() === doc.application_id.toString());
        res.json(l);
      }
    });
  }
});
app.post('/logout', (req, res) => {
  const {token} = req.body;

  // remove the refrest token from the DB

  // remove all cookies
  res.clearCookie('token', {path: '/'});

  res.sendStatus(200);
});

module.exports = {app};
