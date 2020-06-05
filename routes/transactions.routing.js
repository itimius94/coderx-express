var express = require('express')
var router = express.Router()


const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter)

router.get("/", (request, response) => {
  const currentPage = request.query.page || 1
  const perPage = 3
  let list= db.get('transactions').value()
  let users= db.get('users').value()
  let books= db.get('books').value()
  
  const totalPage = list.length
  const startPage = (parseInt(currentPage) - 1) * perPage
  const endPage = startPage + perPage
  
  const listPage = (totalPage % perPage) === 0 ? parseInt(totalPage / perPage) : parseInt(totalPage / perPage) + 1
  const arrPage = []
  
  for (let i = 1; i <= listPage; i++) {
    arrPage.push(i)
  }
  
  console.log(listPage, arrPage)
  
  response.render('transaction', { transactions: list.slice(startPage, endPage), books, users, arrPage, currentPage })
});

router.get("/:id/complete", (request, response) => {
  let { id } = request.params
  let books = db.get('books').value()
  let list = db.get('transactions').value()
  let currentIndex = list.findIndex(item => item.id == id)
  
  if (currentIndex !== -1) {
    let index = books.findIndex(item => item.id == list[currentIndex].bookId)
    
    if (index !== -1) {
      list[currentIndex].isComplete = true
    } else {
      console.log('Sach khong ton tai')
    }

    response.redirect('/transactions')
  }
});


router.post("/create", (res, req) => {
  const { body } = res
  const { bookId, userId } = body
  
  let list = db.get('transactions').value()
  let id = 0
  
  if (list.length) {
    id = parseInt(list[list.length - 1].id) + 1
  }
  
  db.get('transactions')
    .push({ id, bookId, userId})
    .write()
  
  req.redirect('/transactions')
});

module.exports = router