const { MongoClient } = require('mongodb')
const dotenv = require('dotenv')
const result = dotenv.config()

if (result.error) {
    throw result.error
}
describe('insert', () => {
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

    it(`random`, () => {
        expect(1).toEqual(1)
    })
})
