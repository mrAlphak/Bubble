/*
//  BUBBLE SOCKET SERVER 
//  This node.js server is only for socket communications. But you can add more functionnality of course. 
*/

require('dotenv').config()
const Log = require('./services/log')
const express = require('express')
const app = express()
const http = require('http').createServer(app)
const port = process.env.PORT
const bodyParser = require('body-parser')
const { IoConnection } = require('./controllers/ioConnection')
const { Server } = require('socket.io')
const cors = require('cors')
const io = new Server(http, {
    cors:{
        origin: process.env.APP_ORIGIN,
        methods: ['POST', 'GET'],
        credentials: true
    }
})

app.use(cors({
    origin: process.env.APP_ORIGIN,
    credentials: true
}))

app.use(bodyParser.json())
app.use('/', require('./config/routes'))

http.listen(port, async()=>{
    Log('Socket server started at port '+port)
    IoConnection(io, app)
})


