const { MongoClient } = require('mongodb')
const dotenv = require('dotenv')
const result = dotenv.config()
const user = require('./models/user')

if (result.error) {
    throw result.error
}
describe('Db insertion', () => {
    let connection
    let db
    let url = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
    beforeAll(async () => {
        connection = await MongoClient.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        db = await connection.db()
    })

    afterAll(async () => {
        await connection.close()
    })

    const mockUser = { _id: 'some-user-id', name: 'John' }

    it(`inserting one user`, async () => {
        const users = db.collection('users')
        await users.insertOne(mockUser)
        const insertedUser = await users.findOne({ _id: 'some-user-id' })
        expect(insertedUser).toEqual(mockUser)
    })
    it(`removing the inserted user`, async () => {
        const users = await db.collection('users')
        await users.remove(mockUser).then(r=>{
            expect(r.result.n).toEqual(1)
        })
    })
})
