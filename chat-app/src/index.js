 const path = require('path')
 const http = require('http')
 const express = require('express')
 const socketio = require('socket.io')
 const Filter = require('bad-words')
 const { generateMessage, generateLocationMessage }= require('./utils/messages')
 const {addUser, removeUser, getUser, getUserInRoom} = require('./utils/users')

 const app =express()
 const server = http.createServer(app)
 const io = socketio(server)

 const port = process.env.PORT || 3000
 const publicDirectoryPath=  path.join(__dirname, '../public')
 
 app.use(express.static(publicDirectoryPath))


 io.on('connection', (socket)=>{
     console.log('New Websocket connection')

    
    socket.on('join', ({username, room}, callback)=>{
        const {error, user } = addUser({ id: socket.id, username, room})
        
        if(error) {
            return callback(error)
        }
       
        socket.join(user.room)


        socket.emit('message', generateMessage('Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`))
        callback()
    })

    socket.on('sendMessage', (message, callback) =>{
        const filter = new Filter()

        if(filter.isProfane(message)){
            return callback('Profanity is not allowed')
        }

        io.to('Consultaion').emit('message', generateMessage(message))
        callback()
    })

    socket.on('sendLocation', (coords, callback)=>{
        io.emit('locationMessage', generateLocationMessage(`https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`))     
        callback()
    })

    socket.on('disconnect', ()=>{
        io.emit('message', generateMessage('A user has left'))
    })
})   
 
 server.listen(port, () => {
     console.log(`Server is up on port ${port}`)
 })