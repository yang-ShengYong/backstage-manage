//登录 注册
const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt') //加密的包
const jwt = require('jsonwebtoken')
const gravatar = require('gravatar') //处理头像的包
const keys = require('../../config/keys')
const passport = require('passport')

const User = require('../../models/User')

// $route POST api/users/register
//@desc 返回请求的json数据
//@access public
router.post('/register', (req, res) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (user) {
        return res.status(400).json('邮箱已被注册！')
      } else {
        //在全球公认的头像库里获得头像
        const avatar = gravatar.url(req.body.email, {s: '200', r: 'pg', d: 'mm'})

        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          avatar,
          password: req.body.password,
          identity: req.body.identity
        })

        //用bcrypt对密码加密
        bcrypt.genSalt(10, function (err, salt) {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err

            newUser.password = hash

            newUser.save()
              .then(user => res.json(user))
              .catch(err => console.log(err))
          })
        })
      }
    })
})

// $route POST api/users/login
//@desc 返回token jwt passport
//@access public
router.post('/login', (req, res) => {
  const email = req.body.email
  const password = req.body.password

  //查询数据库
  User.findOne({email})
    .then(user => {
      if (!user) return res.status(404).json("用户不存在")

      //密码匹配
      bcrypt.compare(password, user.password)
        .then(isMatch => {
          if (isMatch) {
            //如果匹配成功，给客户端发一个token令牌
            const rule = {
              id: user.id,
              name: user.name,
              avatar: user.avatar,
              identity: user.identity
            }
            jwt.sign(rule, keys.secretOrKey, {expiresIn: 3600}, (err, token) => {
              if (err) throw err
              res.json({
                success: true,
                token: 'Bearer ' + token
              })
            })
          } else {
            return res.status(400).json("密码错误")
          }
        })
    })
})

// $route GET api/users/current
//@desc 返回 current user
//@access private
router.get('/current', passport.authenticate('jwt', {session: false}), (req, res) => { //第二个参数用来验证token
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    identity: req.user.identity
  })
})

module.exports = router
