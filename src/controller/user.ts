import { ParameterizedContext, Next } from 'koa'
import jwt from 'jsonwebtoken'

import DEFAULT from '../config/default.js'
import UserModel from '../model/user.js'
import md5 from '../util/md5.js'

interface User {
  email: string
  username: string
  password: string
}

export default {
  register: async (ctx: ParameterizedContext, next: Next) => {
    await ctx.render('register', {
      title: 'Register Page'
    })
  },

  doRegister: async (ctx: ParameterizedContext, next: Next) => {
    const { email, username, password } = ctx.request.body as User
    const user = await UserModel.findOne({
      $or: [{ email }, { username }]
    })

    if (user) {
      return (ctx.body = {
        status: 500,
        msg: 'Email or Username is already exsist.'
      })
    }

    const newUser = new UserModel({
      ...(ctx.request.body as User),
      password: md5(password)
    })
    await newUser.save()
    ctx.redirect(`/login?email=${email}`)
  },

  login: async (ctx: ParameterizedContext, next: Next) => {
    const { email = '' } = ctx.query
    await ctx.render('login', {
      title: 'Login Page',
      email
    })
  },

  doLogin: async (ctx: ParameterizedContext, next: Next) => {
    const { email, password } = ctx.request.body as User
    const user = await UserModel.findOne({
      email,
      password: md5(password)
    })

    if (!user) {
      return (ctx.body = {
        status: 500,
        msg: 'Email or Password is invalid.'
      })
    }

    console.log('user', user)
    const { _id, username } = user
    const token = jwt.sign({ _id }, DEFAULT.JWT_SECRET)

    ctx.body = {
      status: 200,
      msg: 'Login succeeded.',
      user: { _id, username, token }
    }

    ctx.redirect('/')
  }
}
