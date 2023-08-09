const imageModel = require("../models/imagemodel");
const messageModel = require("../models/messagemodel");
const chatModel = require("../models/chatmodel");
// const { ExpressPeerServer } = require("peer");
// const app = require("../app");


function createwebsocket(server){
 
    const io = require('socket.io')(server,{
        cors : {
            origin : "*",
          },
          path : "/chatsocket",
    });
    
      
    io.on('connection', (socket) => {
        // console.log('A user connected');
        socket.on("joinRoom", async(room) =>{
            socket.join(room);
        });
        socket.on("sendMessage",async(txt,room)=>{
            // console.log(txt["userName"]);
            // console.log(txt["userId"]);
            // console.log(txt["text"]);
            // console.log(txt["img"]);
            // console.log("room id" , room);
            
            let chat = await chatModel.findById(room).exec();
            if(chat){
                let newmessage = null;
                let newimage = null;
                if(txt["text"] !== null){
                    newmessage = new messageModel({
                        txt : txt["text"],
                        userId : txt["userId"],
                    });
                    await newmessage.save();
                    chat.chatList.push(newmessage._id);
                    await chat.save();
                    // console.log("This is message id "+ newmessage._id);
                }
    
                if(txt["img"] !== null){
                    newimage = new imageModel({
                        image : txt["img"].buffer,
                    });
                    
                    await newimage.save();
                    chat.chatList.push(newimage._id);
                    await chat.save();
                    // console.log("This is img id " + newimage._id);
                }

                const newmesage = {
                    userName : txt["userName"],
                    userId : txt["userId"],
                    text : txt["text"],
                    img : txt["img"],
                    datetime : new Date(),
                }
                // console.log(room);
                io.to(room).emit("receiveMessage",newmesage);
            }else{
                // console.log("Chat doesnot exist");
            }

            


            
            // socket.broadcast.emit("receiveMessage",txt);
        });

        // socket.on("getmysocketId",()=>{
        //     socket.emit("mysocketId", socket.id);
        // })

        socket.on("getallsocketId",async(room)=>{
            const sockets =await io.in(room).fetchSockets();
            // console.log("Getting all socket ids");
            let idlist = [];
            sockets.map(singlesocket =>{
                // console.log(singlesocket.id);
                idlist.push(singlesocket.id);
            });
            io.to(room).emit("sendsocketIds",idlist);
        });

        socket.on("endCall",(socketId)=>{
            socket.to(socketId).emit("callended");
        });

        socket.on('disconnect', () => {
            // console.log('user disconnected');
        });

        socket.on("callother",id=>{
            // console.log("call other working");
            socket.to(id).emit("plzacceptcall");
        });

        socket.on("callothervoice", id =>{
            socket.to(id).emit("plzacceptvoice");
        });

        socket.on("dropcall", id =>{
            socket.to(id).emit("dropcall");
        });
        
        socket.on("sendpeerid", (twoid)=>{
            socket.to(twoid[0]).emit("receivepeerId", twoid[1]);
        });
    });

}

module.exports = createwebsocket;