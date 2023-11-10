require('dotenv').config()
const Socket = null
const Log = require('../services/log')
const Supabase = require('../supabase')
let Rooms = []

const IoConnection = (io, app) => {
  io.on('connection', async (socket) => {
    app.set('io', io)
    app.set('socket', socket)

    socket.on('connectToServer', async({ id }) => {
      socket.userId = id
      const {data, error} = await Supabase.from('profiles').update({status: 'Online'}).eq('id', id)
      if(error){
        console.log(error)
      }
      Log(`User ${socket.id} connected`)
    })

    socket.on('typing', async({roomId, username})=>{
    })

    socket.on('stop typing', async({roomId, username})=>{
    })

    socket.on('disconnect', async() => {
      const {data, error} = await Supabase.from('profiles').update({status: 'Offline'}).eq('id', socket.userId)
      if(error){
        console.log(error)
      }
      Log(`User ${socket.id} disconnected`)
    })
  })
}

module.exports = {
  IoConnection,
  Socket,
  Rooms
}