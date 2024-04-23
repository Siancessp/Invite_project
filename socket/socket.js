module.exports = (io) =>
{
    io.on('connection', (socket) => {
        console.log('a user connected', socket.id);

        socket.on("join_room", (chatId)=>
        {
            socket.join(chatId);
            console.log(`User ${socket.id} joined room ${chatId}`);
        })

        socket.on("leave_room", (chatId)=>
        {
            socket.leave(chatId);
            console.log(`User ${socket.id} leave room ${chatId}`);
        })

        socket.on("join_chat", (userId)=>
        {
            socket.join(userId);
            console.log(`User ${socket.id} joined chat ${userId}`);
        })

        socket.on("leave_chat", (userId)=>
        {
            socket.leave(userId);
            console.log(`User ${socket.id} leave chat ${userId}`);
        })

        socket.on('send_message',(data)=>{
            io.to(data.chatId).emit("send_message",data)
            io.to(data.userId).emit("new_chat",data)
        })

        socket.on('disconnec',()=>
        {
            console.log("user disconnect")
        })
    });
};