const { app } = require('./app')
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(
        `Running on port: ${PORT}, address is: http://localhost:${PORT}`
    )
})
