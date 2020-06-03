module.exports.authMiddleware = (req, res, next) => {
  const { token } = req.cookies
  if (token) {
    res.redirect('../users')
    return
  }
  
  next()
}