const express = require('express')
const cookieParser = require('cookie-parser')
const logger = require('morgan')

const stock_v1_routes = require('./routes/stock_v1')

const app = express()

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

app.use('/api/stock/v1', stock_v1_routes)

app.use((req, res, next) => {
    res.status(404).end()
})

module.exports = app
