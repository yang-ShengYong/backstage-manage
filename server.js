const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const passport = require('passport')
const app = express()

const port = process.env.PORT || 5000

//引入users.js
const users = require('./routes/api/users')
const profiles = require('./routes/api/profiles')

//连接数据库
const db = require('./config/keys').mongoURL
mongoose
  .connect(db)
  .then(() => console.log('数据库连接成功'))
  .catch(err => console.log(err))

//使用body-parser中间件
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
//passport初始化
app.use(passport.initialize())

require('./config/passport')(passport)

app.use('/api/users', users)
app.use('/api/profiles', profiles)

// app.get("/", (req, res) => {
//   res.send("hello")
// })

app.listen(port, () => {
  console.log(`running on port ${port}`)
})
