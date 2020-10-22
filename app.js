const express = require('express')
const app = express()
const port = 3000
// const logger = require('morgan')
const cors = require('cors')
var cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const user = require('./models/user')
const application = require('./models/application')
const jwt = require('jsonwebtoken')
app.use(express.json())
app.use(cookieParser())

const corsConfig = {
    origin: 'http://localhost:3001',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
}
app.use(cors(corsConfig))

const result = dotenv.config()

if (result.error) {
    throw result.error
}

saltRounds = 10

try {
    console.log(
        `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
    )
    mongoose
        .connect(
            `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
            { useNewUrlParser: true, useUnifiedTopology: true }
        )
        .catch((err) => {
            console.log(err)
        })
} catch (error) {
    console.log(`Error while connecting to DB: ${error}`)
    console.log('Please Ensure a proper connection to DB first')
}

app.get('/', (req, res) => {
    res.json('😃')
})

app.post('/login', (req, res) => {
    if (req.body.email && req.body.password) {
        user.findOne({ email: req.body.email }, (err, docs) => {
            if (err) return res.sendStatus(500) //internal server error
            if (docs == null) return res.sendStatus(404) //not found
            bcrypt.compare(req.body.password, docs.password, (err, result) => {
                if (err) return res.sendStatus(500)

                var accessToken = jwt.sign(
                    { foo: 'bar' },
                    process.env.JWT_ACCESS_TOKEN_SECRET_KEY,
                    {
                        expiresIn: '20s',
                    }
                )
                var refreshToken = jwt.sign(
                    { foo: 'bar' },
                    process.env.JWT_REFRESH_TOKEN_SECRET_KEY
                )

                console.log(accessToken)
                console.log(refreshToken)

                if (result) {
                    //  set cookie flag secure in production
                    res.cookie('token', refreshToken, {
                        expires: new Date(Date.now() + 900000),
                        httpOnly: true,
                    })
                    return res.json({ accessToken, refreshToken, loggedin: 1 })
                }
                return res.json({ loggedin: 0 })
            })
        })
    } else {
        res.sendStatus(400)
    }
})

app.post('/token', (req, res) => {
    const { token } = req.body

    if (!token) {
        return res.sendStatus(401)
    }
    // if DB does not contains the RequestToken in it then
    // return res.sendStatus(403)

    jwt.verify(token, process.env.JWT_REFRESH_TOKEN_SECRET_KEY, (err, data) => {
        if (err) return res.sendStatus(403)

        const accessToken = jwt.sign(
            { data: 'data' },
            process.env.JWT_ACCESS_TOKEN_SECRET_KEY,
            {
                expiresIn: '20s',
            }
        )

        res.json({ accessToken })
    })
})
//authentication middleware
const authenticateRequest = (req, res, next) => {
    const authHeader = req.headers.authorization
    if (authHeader) {
        const token = authHeader.split(' ')[1]

        jwt.verify(
            token,
            process.env.JWT_ACCESS_TOKEN_SECRET_KEY,
            (err, data) => {
                if (err) {
                    console.log(`Error ${err}`)
                    console.log(typeof err)
                    console.log(err.name)
                    if (err.name === 'TokenExpiredError') {
                        const refreshToken = req.cookies.token
                        jwt.verify(
                            refreshToken,
                            process.env.JWT_REFRESH_TOKEN_SECRET_KEY,
                            (err, data) => {
                                if (err) {
                                    console.log(`Refresh token error: ${err}`)
                                    res.sendStatus(401)
                                } else {
                                    next()
                                }
                            }
                        )
                    } else {
                        return res.sendStatus(403) //forbidden
                    }
                } else {
                    console.log(data)
                    data.user = user
                    console.log(data)
                    next()
                }
            }
        )
    } else {
        res.sendStatus(401) // unauthorized
    }
}

app.post('/getdata', authenticateRequest, (req, res) => {
    const authHeader = req.headers.authorization
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET_KEY, (err, data) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                const newAccessToken = jwt.sign(
                    { data: 'data' },
                    process.env.JWT_ACCESS_TOKEN_SECRET_KEY,
                    {
                        expiresIn: '20s',
                    }
                )
                res.json([
                    { book1: 'harrypotter', book2: 'dungeon' },
                    newAccessToken,
                ])
            } else {
                res.json(402)
            }
        } else {
            res.json([{ book1: 'harrypotter', book2: 'dungeon' }])
        }
    })
})

//registraion middlewares
const registrationPreCheck = async (req, res, next) => {
    if (!(req.body.hasOwnProperty(`email`) && req.body.email != ''))
        return res.sendStatus(400)
    if (!(req.body.hasOwnProperty(`name`) && req.body.name != ''))
        return res.sendStatus(400)
    if (!(req.body.hasOwnProperty(`password`) && req.body.password != ''))
        return res.sendStatus(400)
    if (!(req.body.hasOwnProperty('userType') && req.body.userType != ''))
        return res.sendStatus(400)
    console.log(req.body.userType)
    console.log(typeof req.body.userType)
    if (req.body.userType !== 'admin' && req.body.userType !== 'customer') {
        console.log('tatti')
        return res.sendStatus(400)
    }
    if (req.body.userType === 'customer') {
        console.log(req.body.userId)
        if (
            !(
                req.body.hasOwnProperty('adminId') &&
                typeof req.body.adminId === 'number'
            )
        )
            return res.sendStatus(400)
    }

    let r = await user.countDocuments({ email: req.body.email })
    if (r) return res.sendStatus(403)

    let u = await user.countDocuments({ userName: req.body.name })
    if (u) return res.sendStatus(403)

    next()
}

app.post('/register', registrationPreCheck, (req, res) => {
    bcrypt.hash(req.body.password, process.env.SALT, function (err, hash) {
        if (err) return res.sendStatus(500)
        const user_instance = new user()
        user_instance.userName = req.body.name
        user_instance.password = hash
        user_instance.email = req.body.email
        user_instance.userType = req.body.userType
        user_instance.save((err) => {
            if (err) {
                console.log('Error in inserting', err)
                res.sendStatus(403)
            } else {
                res.send({ response: 'successfully inserted' })
            }
        })
    })
})

const checkApplicationForm = (req, res, next) => {
    // TODO
    if (!req.body.hasOwnProperty('submitted_by') && req.body.submitted_by != '')
        return res.sendStatus(400)
    if (!req.body.hasOwnProperty('on_behalf') && req.body.on_behalf != '')
        return res.sendStatus(400)
    if (!req.body.hasOwnProperty('tenure')) return res.sendStatus(400)
    if (!req.body.hasOwnProperty('stage')) return res.sendStatus(400)

    // check if application of user already exists
    let applications = application
        .countDocuments({
            submitted_by: req.body.submitted_by,
            on_behalf: req.body.on_behalf,
        })
        .exec()

    applications
        .then((e) => {
            console.log('application', e)
            if (e !== 0) {
                console.log('sending 269')
                return res.sendStatus(403)
            } else {
                next()
            }
        })
        .catch((e) => console.log(e))
}

app.post(
    '/submit',
    authenticateRequest,
    checkApplicationForm,
    async (req, res) => {
        // TODO - add form to the db
        let application_instance = new application()
        const submitted_by = user.findById(req.body.submitted_by).exec()
        const on_behalf = user.findById(req.body.on_behalf).exec()
        const promisis = [submitted_by, on_behalf]
        Promise.all(promisis)
            .then((re) => {
                let if_any_null = false
                re.forEach((doc) => {
                    if (doc === null) {
                        if_any_null = true
                    }
                })
                if (if_any_null) {
                    res.sendStatus(403)
                } else {
                    application_instance.submitted_by = re[0]._id
                    application_instance.on_behalf = re[1]._id
                    application_instance.stage = req.body.stage
                    application_instance.tenure = req.body.terune
                    application_instance.save((err) => {
                        if (err) return res.sendStatus(500)
                        res.sendStatus(200)
                    })
                }
            })
            .catch((r) => {
                console.log('error in finding on_behalf:', r)
                res.sendStatus(403)
            })
    }
)

app.post('/logout', (req, res) => {
    const { token } = req.body

    // remove the refrest token from the DB

    // remove all cookies
    res.clearCookie('token', { path: '/' })

    res.sendStatus(200)
})

module.exports = { app }
