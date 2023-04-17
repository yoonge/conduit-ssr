import { ParameterizedContext, Next } from 'koa'
import md5 from 'md5'
import UserModel from '../models/user.js'

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
    console.log('ctx.reqest.body', ctx.request.body)
    const { email, username, password } = ctx.request.body as User
    const user = await UserModel.findOne({
      $or: [{ email }, { username }]
    })

    if (user) {
      return (ctx.body = 'Email or Username is already exsist.')
    }

    const newUser = new UserModel({
      ...(ctx.request.body as User),
      password: md5(md5(password))
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
  }
}
