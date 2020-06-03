module.exports.userValidate = (req, res, next) => {
  const errors = []
  const { body } = req
  const { name } = body
  
  if (name.length > 30) {
    errors.push('Ten khong dupc qua 30 ky tu')
    
    res.render('users', { errors })
    return
  }
  
  next();
}