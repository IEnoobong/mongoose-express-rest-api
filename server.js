const logger = require('morgan')
const errorHandler = require('errorhandler')
const bodyParser = require('body-parser')

const express = require('express')
const app = express()

app.use(logger('dev'))
app.use(bodyParser.json())

const mongoose = require('mongoose')
mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost:27017/edx-course-db', { useNewUrlParser: true })

const Account = mongoose.model('Account', { name: String, balance: Number })

app.get('/accounts', (req, res) => {
    Account.find({}, null, { sort: { _id: -1 } }, (error, accounts) => {
        if (error) {
            res.status(500).send({ message: error.message })
        }
        res.status(200).send(accounts)
    })
})

app.get('/accounts/:id', (req, res, next) => {
    Account.findById(req.params.id, (error, account) => {
        if (error) return next(error)
        res.send(account.toJSON())
    })
})

app.post('/accounts', (req, res) => {
    const account = new Account(req.body)
    account.save((error) => {
        if (error) {
            res.status(500).send({ message: error.message })
        }
        res.status(201).send({ id: account.id })
    })
})

app.put('/accounts/:id', (req, res) => {
    Account.updateOne({ _id: req.params.id }, { $set: req.body }, (error, updated) => {
        if (error) {
            res.status(500).send({ message: error.message })
        }
        res.status(200).send({ modified: updated.nModified })
    })
})

app.delete('/accounts/:id', (req, res) => {
    Account.deleteOne({ _id: req.params.id }, (error) => {
        if (error) {
            res.status(500).send({ message: error.message })
        }
        res.status(204).send()
    })
})

app.use(errorHandler())

app.listen(3000)