// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const app = express();
var md5 = require('md5');
const bcrypt = require('bcrypt');
const cloudinary = require('cloudinary');


const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
var cookieParser = require('cookie-parser')

const userRoute = require('./routes/user.routing')
const transactionRoute = require('./routes/transactions.routing')
const middleware = require('./middleware/authMiddleware')

const adapter = new FileSync('db.json')
const db = low(adapter)
let count = 0
let wrongLoginCount = 0

app.use(cookieParser('nguyenvanthuc'))

// Set some defaults (required if your JSON file is empty)
db.defaults({ books: [], users: [], transactions: [] })
  .write()

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

// set view engine
app.set('view engine', 'pug')
app.set('views', './views')

// our default array of dreams
const dreams = [
  "Find and count some sheep",
  "Climb a really tall mountain",
  "Wash the dishes"
];

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

app.get("/cookie", (req, res, next) => {
  if (req.cookies) {
    count++
  }
  
  console.log('cookie:', count)
  next()
}, (req, res) => {
  res.cookie('userId', 2468)
  res.send('HELLO')
})

app.get("/books", (request, response) => {
  let listBooks = db.get('books').value()
  
  response.render('books', { books: listBooks })
});

app.get("/books/:id/update", (request, response) => {
  const { id } = request.params
  let listBooks = db.get('books').value()
  let currentBook = listBooks.find(item => item.id == id)
  
  response.render('update', { book: currentBook })
});

app.get("/books/:id/delete", (req, res) => {
  const { id } = req.params
  let listBooks = db.get('books').value()
  
  listBooks = listBooks.filter(item => item.id != id)
  
  db.set('books', listBooks)
    .write()
  
  res.redirect('/books')
})

// send the default array of dreams to the webpage
app.get("/dreams", (request, response) => {
  // express helps us take JS objects and send them as JSON
  response.json(dreams);
});

app.post("/books/:id/update", (request, response) => {
  const { id, title } = request.body
  let listBooks = db.get('books').value()
  const index = listBooks.findIndex(item => item.id == id)
  
  if (index != -1) {
    listBooks[index].title = title
  }
  
  db.set('books', listBooks)
    .write()
  
  response.redirect('/books')
});

app.post("/books/create", (res, req) => {
  const { body } = res
  const { title, desc } = body
  
  let listBooks = db.get('books').value()
  let id = 0
  
  if (listBooks.length) {
    id = parseInt(listBooks[listBooks.length - 1].id) + 1
  }
  
  db.get('books')
    .push({ id, title, desc})
    .write()
  
  req.redirect('/books')
});

app.use('/users', userRoute)
app.use('/transactions', transactionRoute)

app.get('/auth/login',middleware.authMiddleware, (req, res) => {
  res.render('auth/login')
})

app.post('/auth/login', (req, res) => {
  if (wrongLoginCount >= 4) {
    const errors = []
    errors.push('Block acount')
    
    res.render('auth/login', { errors })
    return;
  }
  
  const { name, password } = req.body
  const listUsers = db.get('users').value()
  const index = listUsers.findIndex(item => item.name == name && bcrypt.compareSync(password, item.password))
  
  if (index === -1) {
    const errors = []
    errors.push('User or password invalid')
    
    res.render('auth/login', { errors })
    wrongLoginCount++
    console.log('checkpass')
    return;
  }
  
  res.cookie('token', name, {
    signed: true
  })
  res.redirect('../users')
})

app.get("/profile", (req, res) => {
  res.render('profile')
})

app.post('/profile/upload', (req, res) => {
  cloudinary.config({ 
    cloud_name: 'drymvqxcl', 
    api_key: '462398522634228', 
    api_secret: '3xsFzthl6C250p0Qah4l83hI4Dg' 
  });

  cloudinary.v2.uploader.upload('https://opencollective.com/pug/sponsor/1/avatar.svg', function(error, result) {
    console.log(result)
  });
  
})

app.post('/api/login', (req, res) => {
  if (wrongLoginCount >= 4) {
    const errors = []
    errors.push('Block acount')
    
    res.render('auth/login', { errors })
    return;
  }
  
  const { name, password } = req.body
  const listUsers = db.get('users').value()
  const index = listUsers.findIndex(item => item.name == name && item.password == password)
  
  if (index === -1) {
    const errors = []
    errors.push('User or password invalid')
    
    res.render('auth/login', { errors })
    wrongLoginCount++
    console.log('checkpass')
    return;
  }
  
  res.json({'status': 200})
});

app.get('/api/transactions', (req, res) => {
  let list= db.get('transactions').value()
  
  res.json({ "data": list })
})

app.get('/api/test', (req, res) => {
  var a;
  
  try {
    a.b();
  } catch (error){
    res.render('error', { error: res.json({ "error": 'Error' }) })
  }
})


// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
