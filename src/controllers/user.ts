import { Context, Next } from 'koa'
import jwt from 'jsonwebtoken'

import DEFAULT from '../config/default.js'
import AVATAR  from '../config/avatar.js'
import UserModel from '../models/user.js'
import TopicModel from '../models/topic.js'
import render500 from '../util/500.js'
import format from '../util/format.js'
import md5 from '../util/md5.js'
import pagination from '../util/pagination.js'

import { User } from '../types/user'

export default class UserCtrl {
  static async register(ctx: Context, next: Next) {
    await ctx.render('register', {
      title: 'Sign Up'
    })
  }

  static async doRegister(ctx: Context, next: Next) {
    try {

      const { email, username, password } = ctx.request.body as User
      const user = await UserModel.findOne({
        $or: [{ email }, { username }]
      })

      if (user) {
        ctx.throw(500, 'Email or Username is already exsist.')
      }

      const newUser = new UserModel({
        ...(ctx.request.body as User),
        password: md5(password)
      })
      await newUser.save()
      ctx.redirect(`/login?email=${email}`)

    } catch (err) {

      render500(err as Error, ctx)

    }
  }

  static async login(ctx: Context, next: Next) {
    const { email = '' } = ctx.query
    await ctx.render('login', {
      title: 'Sign In',
      email
    })
  }

  static async doLogin(ctx: Context, next: Next) {
    try {
      const { email, password } = ctx.request.body as User
      const user = await UserModel.findOne({
        email,
        password: md5(password)
      })

      if (!user) {
        ctx.throw(500, 'Email or Password is invalid.')
      }

      const { _id, username } = user
      const token = await new Promise((resolve, reject) => {
        jwt.sign(
          { cuid: _id, username },
          DEFAULT.JWT_SECRET,
          { expiresIn: '1h' },
          (err, token) => {
            if (err) reject(err)
            resolve(token)
          }
        )
      })

      if (!token) {
        ctx.throw(500, 'Internal Server Error.')
      }

      ctx.status = 200
      ctx.cookies.set('cuid', _id.toString())
      ctx.cookies.set('token', token as string)
      ctx.redirect('/')

    } catch (err) {

      render500(err as Error, ctx)

    }
  }

  static logout(ctx: Context, next: Next) {
    ctx.cookies.set('cuid', null)
    ctx.cookies.set('token', null)
    ctx.redirect('/login')
  }

  static async getCurrentUser(ctx: Context, next: Next) {
    try {
      const cuid = ctx.cookies.get('cuid')
      const user = await UserModel.findById(cuid)
      return { err: null, user }
    } catch (err) {
      return { err, user: null }
    }
  }

  static async getUserSettings(ctx: Context, next: Next) {
    const { err, user } = await UserCtrl.getCurrentUser(ctx, next)

    if (err) {
      render500(err as Error, ctx)
      return
    }

    ctx.status = 200
    await ctx.render('settings', {
      msg: 'User query succeeded.',
      title: 'User Settings',
      AVATAR,
      user
    })
  }

  static async updateUserSettings(ctx: Context, next: Next) {
    try {

      let newUser
      const { _id, gender, password, ...rest } = ctx.request.body as User
      if (password.trim()) {
        newUser = {
          gender: Number(gender),
          password: md5(password),
          updateTime: Date.now(),
          ...rest
        }
      } else {
        newUser = {
          gender: Number(gender),
          updateTime: Date.now(),
          ...rest
        }
      }
      await UserModel.findByIdAndUpdate(_id, { $set: { ...newUser } })
      ctx.redirect('/settings')

    } catch (err) {

      render500(err as Error, ctx)

    }
  }

  static async getMyTopics(ctx: Context, next: Next) {
    try {

      const { user } = await UserCtrl.getCurrentUser(ctx, next)
      if (!user) {
        ctx.redirect('/')
        return
      }

      const { page = '1' } = ctx.query
      const total = await TopicModel.find({ user: user._id }).count()
      const topics = await TopicModel.find({ user: user._id })
        .limit(DEFAULT.PAGE_SIZE).skip(DEFAULT.PAGE_SIZE * (Number(page) - 1))
        .populate('user').sort('-updateTime')
      const formatTopics = format(topics)
      const pageList = pagination('/myTopics', DEFAULT.PAGE_SIZE, total, Number(page))

      ctx.status = 200
      await ctx.render('index', {
        msg: 'These are all my topics.',
        title: 'My Topics',
        formatTopics,
        pageList,
        user
      })

    } catch (err) {
      render500(err as Error, ctx)
    }
  }

  static async getMyFavorites(ctx: Context, next: Next) {
    try {

      const { user } = await UserCtrl.getCurrentUser(ctx, next)
      if (!user) {
        ctx.redirect('/')
        return
      }

      const { page = '1' } = ctx.query
      const total = await TopicModel.find({ _id: { $in: user.favorite } }).count()
      const topics = await TopicModel.find({ _id: { $in: user.favorite } })
        .limit(DEFAULT.PAGE_SIZE).skip(DEFAULT.PAGE_SIZE * (Number(page) - 1))
        .populate('user').sort('-updateTime')
      const formatTopics = format(topics)
      const pageList = pagination('/myFavorites', DEFAULT.PAGE_SIZE, total, Number(page))

      ctx.status = 200
      await ctx.render('index', {
        msg: 'These are all my topics.',
        title: 'My Topics',
        formatTopics,
        pageList,
        user
      })

    } catch (err) {
      render500(err as Error, ctx)
    }
  }

  static async favor(ctx: Context, next: Next) {
    try {

      const { topicId, userId, flag } = ctx.request.body as any
      if (flag === 'true') {
        await TopicModel.findByIdAndUpdate(topicId, { $inc: { favorite: 1 } })
        await UserModel.findByIdAndUpdate(userId, { $push: { favorite: topicId } })
        ctx.status = 200
        ctx.body = {
          msg: 'Favor succeed.',
          status: 200
        }
      } else if (flag === 'false') {
        await TopicModel.findByIdAndUpdate(topicId, { $inc: { favorite: -1 } })
        await UserModel.findByIdAndUpdate(userId, { $pull: { favorite: topicId } })
        ctx.status = 200
        ctx.body = {
          msg: 'Disfavor succeed.',
          status: 200
        }
      }

    } catch (err) {
      ctx.status = 500
      ctx.body = {
        err: {
          stack: JSON.stringify(err),
          status: 500
        },
        msg: (err as Error)?.message || 'Internal Server Error.'
      }
    }
  }

  static async getUserProfile(ctx: Context, next: Next) {

  }
}
