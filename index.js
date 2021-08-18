// import in the packages
const express = require('express');
const hbs = require('hbs');
const wax = require('wax-on')
require('dotenv').config();

const MongoUtil = require('./MongoUtil');

let app = express();
app.set('view engine', 'hbs');

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
}

main();

// START SERVER
app.listen(3000, function (req, res) {
    console.log("Server started")
})