const { disconnect } = require('process');
const { readFileSync } = require("fs");
const { createServer } = require("https");
const { Server } = require('socket.io')

const httpsServer = createServer({
  key: readFileSync("./ssl/ssl.key"),
  cert: readFileSync("./ssl/ssl.crt")
  },(req,res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
  res.setHeader('Access-Control-Max-Age', 60*60*24*30);
});

const io = new Server(httpsServer, {
  cors: {
    origin: "*:*",
    methods: "*"
  }
});



function sendTo(username, event, value) {
  for(sock of io.of('/').sockets) {
    if(sock[sock.length - 1].handshake.auth == username) {
      sock.emit(event, value)
    }
  }
}


let sockets = []
let globalLength = 0

io.on('connection', (socket) => {
  sockets.push(socket)
  globalLength += 1

  sockets.forEach(socket => {
    socket.emit('newMember', globalLength)    
  });

  console.log(`${socket.handshake.auth.name} connected !`)

  socket.on('message', (message) => {
    console.log(message)
    socket.broadcast.emit('new', message)
  })


  socket.on('chat', (message) => {
    console.log(message.message + ' - private')

    for(sock of sockets) {
      if(sock.handshake.auth.name == message.receiver) {
        console.log("fouuuuuuuuuuuuuund !")
        sock.emit('newPrivate', message.message)
      }
    }


  })





  socket.on('typing', () => {
    sockets.forEach(socket => {
      socket.emit('typing')    
    });
  })

  socket.on('stopped-typing', () => {
    sockets.forEach(socket => {
      socket.emit('stopped-typing')    
    });
  })

  socket.on('disconnect', () => {
    globalLength -= 1
    socket.broadcast.emit("newMember", globalLength)
  })

})





















































// const { disconnect } = require('process');

// const app = require('express')()
// const httpServer = require('http').createServer(app)

// const io = require("socket.io")(httpServer, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"]
//   }
// });



// function sendTo(username, event, value) {
//   for(sock of io.of('/').sockets) {
//     if(sock[sock.length - 1].handshake.auth == username) {
//       sock.emit(event, value)
//     }
//   }
// }


// let sockets = []
// let globalLength = 0

// io.on('connection', (socket) => {
//   sockets.push(socket)
//   globalLength += 1

//   sockets.forEach(socket => {
//     socket.emit('newMember', globalLength)    
//   });

//   console.log(`${socket.handshake.auth.name} connected !`)

//   socket.on('message', (message) => {
//     console.log(message)
//     socket.broadcast.emit('new', message)
//   })


//   socket.on('chat', (message) => {
//     console.log(message.message + ' - private')

//     for(sock of sockets) {
//       if(sock.handshake.auth.name == message.receiver) {
//         console.log("fouuuuuuuuuuuuuund !")
//         sock.emit('newPrivate', message.message)
//       }
//     }


//   })





//   socket.on('typing', () => {
//     sockets.forEach(socket => {
//       socket.emit('typing')    
//     });
//   })

//   socket.on('stopped-typing', () => {
//     sockets.forEach(socket => {
//       socket.emit('stopped-typing')    
//     });
//   })

//   socket.on('disconnect', () => {
//     globalLength -= 1
//     socket.broadcast.emit("newMember", globalLength)
//   })











// })






httpsServer.listen(3000, () => console.log("WebSocket server has started on port 3000 !!!"))
