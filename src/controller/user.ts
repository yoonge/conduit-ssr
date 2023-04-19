import { Context, Next } from 'koa'
import jwt from 'jsonwebtoken'

import DEFAULT from '../config/default.js'
import UserModel from '../model/user.js'
import md5 from '../util/md5.js'

declare type User = {
  email: string
  username: string
  password: string
}

export default class UserCtrl {
  static async register(ctx: Context, next: Next) {
    await ctx.render('register', {
      title: 'Register Page'
    })
  }

  static async doRegister(ctx: Context, next: Next) {
    const { email, username, password } = ctx.request.body as User
    const user = await UserModel.findOne({
      $or: [{ email }, { username }]
    })

    if (user) {
      ctx.status = 500
      ctx.body = {
        msg: 'Email or Username is already exsist.'
      }
      return
    }

    const newUser = new UserModel({
      ...(ctx.request.body as User),
      password: md5(password)
    })
    await newUser.save()
    ctx.redirect(`/login?email=${email}`)
  }

  static async login(ctx: Context, next: Next) {
    const { email = '' } = ctx.query
    await ctx.render('login', {
      title: 'Login Page',
      email
    })
  }

  static async doLogin(ctx: Context, next: Next) {
    const { email, password } = ctx.request.body as User
    const user = await UserModel.findOne({
      email,
      password: md5(password)
    })

    if (!user) {
      ctx.status = 500
      ctx.body = {
        msg: 'Email or Password is invalid.'
      }
      return
    }

    const { _id } = user
    const token = await new Promise((resolve, reject) => {
      jwt.sign(
        { currentUserId: _id },
        DEFAULT.JWT_SECRET,
        {
          expiresIn: '1h'
        },
        (err, token) => {
          if (err) reject(err)
          resolve(token)
        }
      )
    })

    if (!token) {
      ctx.status = 500
      ctx.body = {
        msg: 'Internal Server Error.'
      }
    }

    ctx.status = 200
    ctx.body = {
      msg: 'Login succeeded.',
      user,
      token
    }
  }

  static async getCurrentUser(ctx: Context, next: Next) {
    console.log('ctx.currentUserId', ctx.currentUserId)
  }
}
