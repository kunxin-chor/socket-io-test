// import in the packages
const express = require('express');
const hbs = require('hbs');
const wax = require('wax-on')
require('dotenv').config();

const MongoUtil = require('./MongoUtil');

let app = express();
app.set('view engine', 'hbs');

// http server
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

// Inform Express where to find static images, css and
// client-side (ie. browser)
app.use(express.static('public'))

// Setup Wax On (for templates with HBS)
wax.on(hbs.handlebars);
wax.setLayoutPath('./views/layouts')

// enable forms
app.use(express.urlencoded({
    'extended': false
}))

app.use(express.json());

async function main() {

    await MongoUtil.connect(process.env.MONGO_URI, "chat")

    // ROUTES
    app.get('/', function (req, res) {
        res.render('index')
    })

    app.post('/chat', async function(req,res){
        const db = await MongoUtil.getDB();
        const message = {
            'name': req.body.name,
            'message': req.body.message
        }
        const result = await db.collection('messages').insertOne(message)
        res.send({
            ...message,
            _id: result.insertedId
        });
    })

    app.get('/chat', async function(req,res){
        const db = await MongoUtil.getDB();
        const messages = await db.collection('messages').find({}).toArray();
        res.send(messages);
    })
}

main();

io.on('connection', (user)=>{
    console.log("User has connected");
    console.log(user);
})

// // START SERVER
// app.listen(3000, function (req, res) {
//     console.log("Server started")
// })

server.listen(3000, () => {
  console.log('server is running on port', server.address().port);
});