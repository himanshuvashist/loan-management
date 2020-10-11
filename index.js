const express = require('express')
const app = express()
const port = 3000
// const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const user = require('./models/user')
app.use(express.json())
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
}

app.get('/', (req, res) => {
    res.send('😃')
})

app.post('/login', (req, res) => {
    if (req.body.email && req.body.password) {
        user.findOne({ email: req.body.email }, (err, docs) => {
            if (err) return res.sendStatus(500) //internal server error
            if (docs == null) return res.sendStatus(404) //not found
            bcrypt.compare(req.body.password, docs.password, (err, result) => {
                if (err) return res.sendStatus(500)
                if (result) return res.send('Logged In')
                return res.send('Wrong Info')
            })
        })
    }
})

async function alreadyExists(data) {
    let r = await user.countDocuments({ email: data.email })
    if (r) return true

    let u = await user.countDocuments({ userName: data.name })
    if (u != 0) return true
    
    return false
}

app.post('/register', (req, res) => {
    alreadyExists(req.body).then((r) => {
        if (r) return res.send('User already registered')
        bcrypt.hash(req.body.password, process.env.SALT, function (err, hash) {
            if (err) return res.send('error')
            const user_instance = new user()
            user_instance.userName = req.body.name
            user_instance.password = hash
            user_instance.date = Date.now()
            user_instance.email = req.body.email
            user_instance.save((err) => {
                if (err) {
                    console.log('Error in inserting')
                    res.send('error')
                }
            })
        })
        res.send({ response: 'successfully inserted' })
    })
})

app.listen(port, () => {
    console.log(
        `Running on port: ${port}, address is: http://localhost:${port}`
    )
})
