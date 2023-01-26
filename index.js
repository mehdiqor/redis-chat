const socketIO = require("socket.io");
const express = require("express");
const redis = require("redis");
const http = require("http");
const PORT = 4001;
const app =  express();
app.set("view engine", "ejs");
const server = http.createServer(app);
const redisClient = redis.createClient();
const io = socketIO(server, {cors : {origin : "*"}});

function sendMessage(socket){
    redisClient.lrange("messages", "0", "-1", (err, data) => {
        console.log(data);
        data.map(item => {
            const [username, message] = item.split(":")
            socket.emit("message", {
                username, message
            })
        })
    })
}
io.on("connection", socket => {
    sendMessage(socket)
    socket.on("message", ({username, message}) => {
        redisClient.rpush("messages", `${username}:${message}`)
        io.emit("message", {username, message})
    })
});
app.get("/", (req, res)=> {
    res.render("login")
});
app.get("/chat", (req, res) => {
    const {username} = req.query;
    res.render("chat", {username})
})
server.listen(PORT, () => {
    console.log(`Server run on port ${PORT}`);
});