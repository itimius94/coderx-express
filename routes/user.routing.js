var express = require('express')
var router = express.Router()
const validate = require('../validate/userValidate.js')

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter)

router.get("/", (request, response) => {
  let listUsers= db.get('users').value()
  const { token } = request.cookies
  
  if (token) {
    const current = listUsers.find(item => item.name == token)
    const { isAdmin } = current
    
    if (!isAdmin) {
      listUsers = listUsers.filter(item => !item.isAdmin)
    }
  }
  
  response.render('users', { users: listUsers })
});

router.get("/:id/update", (request, response) => {
  const { id } = request.params
  let listUsers = db.get('users').value()
  let currentUser = listUsers.find(item => item.id == id)
  
  response.render('update-user', { user: currentUser })
});

router.get("/:id/delete", (req, res) => {
  const { id } = req.params
  let listUsers = db.get('users').value()
  
  listUsers = listUsers.filter(item => item.id != id)
  
  db.set('users', listUsers)
    .write()
  
  res.redirect('/users')
})

router.post("/:id/update", (request, response) => {
  const { id, name } = request.body
  let listUsers = db.get('users').value()
  const index = listUsers.findIndex(item => item.id == id)
  
  if (index != -1) {
    listUsers[index].name = name
  }
  
  db.set('users', listUsers)
    .write()
  
  response.redirect('/users')
});


router.post("/create", validate.userValidate, (res, req) => {
  const { body } = res
  const { name } = body
  let listUsers= db.get('users').value()
  let id = 0
  
  if (listUsers.length) {
    id = parseInt(listUsers[listUsers.length - 1].id) + 1
  }
  
  db.get('users')
    .push({ id, name})
    .write()
  
  req.redirect('/users')
});


module.exports = router