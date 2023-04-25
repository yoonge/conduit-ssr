import { Context, Next } from 'koa'
import jwt from 'jsonwebtoken'

import DEFAULT from '../config/default.js'
import AVATAR  from '../config/avatar.js'
import UserModel from '../models/user.js'
import TopicModel from '../models/topic.js'
import render500 from '../util/500.js'
import format from '../util/format.js'
import md5 from '../util/md5.js'

import { User } from '../types/user'

export default class UserCtrl {
  static async register(ctx: Context, next: Next) {
    await ctx.render('register', {
      title: 'Register'
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
      title: 'Login',
      email
    })
  }

  /**
   * @api {post} /login Login
   * @apiVersion 0.1.0
   * @apiName DoLogin
   * @apiGroup User
   *
   * @apiParam {String} email Email
   * @apiParam {String} password Password
   *
   * @apiSuccess {String} msg Message
   * @apiSuccess {Object} user Current user's profile
   *
   * @apiError UserNotFound   The <code>id</code> of the User was not found.
   * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
   */
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

  /**
   * @api {get} /user/:region/:id/:opt Read data of a User
   * @apiVersion 0.1.0
   * @apiName GetCurrentUser
   * @apiGroup User
   *
   * @apiDescription Compare version 0.3.0 with 0.2.0 and you will see the green markers with new items in version 0.3.0 and red markers with removed items since 0.2.0.
   *
   * @apiHeader {String} Authorization The token can be generated from your user profile.
   * @apiHeader {String} X-Apidoc-Cool-Factor=big Some other header with a default value.
   * @apiHeaderExample {Header} Header-Example
   *     "Authorization: token 5f048fe"
   * @apiParam {Number} id User unique ID
   * @apiParam {String} region=fr-par User region
   * @apiParam {String} [opt] An optional param
   *
   * @apiExample {bash} Curl example
   * curl -H "Authorization: token 5f048fe" -i https://api.example.com/user/fr-par/4711
   * curl -H "Authorization: token 5f048fe" -H "X-Apidoc-Cool-Factor: superbig" -i https://api.example.com/user/de-ber/1337/yep
   * @apiExample {js} Javascript example
   * const client = AcmeCorpApi('5f048fe');
   * const user = client.getUser(42);
   * @apiExample {python} Python example
   * client = AcmeCorpApi.Client(token="5f048fe")
   * user = client.get_user(42)
   *
   * @apiSuccess {Number}   id            The Users-ID.
   * @apiSuccess {Date}     registered    Registration Date.
   * @apiSuccess {String}   name          Fullname of the User.
   * @apiSuccess {String[]} nicknames     List of Users nicknames (Array of Strings).
   * @apiSuccess {Object}   profile       Profile data (example for an Object)
   * @apiSuccess {Number}   profile.age   Users age.
   * @apiSuccess {String}   profile.image Avatar-Image.
   * @apiSuccess {Object[]} options       List of Users options (Array of Objects).
   * @apiSuccess {String}   options.name  Option Name.
   * @apiSuccess {String}   options.value Option Value.
   *
   * @apiError NoAccessRight Only authenticated Admins can access the data.
   * @apiError UserNotFound   The <code>id</code> of the User was not found.
   * @apiError (500 Internal Server Error) InternalServerError The server encountered an internal error
   *
   * @apiErrorExample Response (example):
   *     HTTP/1.1 401 Not Authenticated
   *     {
   *       "error": "NoAccessRight"
   *     }
   */
  static async getCurrentUser(ctx: Context, next: Next) {
    try {
      const cuid = ctx.cookies.get('cuid')
      const user = await UserModel.findById(cuid)
      return { err: null, user }
    } catch (err) {
      return { err, user: null }
    }
  }

  static async getUserProfile(ctx: Context, next: Next) {
    const { err, user } = await UserCtrl.getCurrentUser(ctx, next)
    // console.log('user', user)

    if (err) {
      render500(err as Error, ctx)
      return
    }

    ctx.status = 200
    await ctx.render('profile', {
      msg: 'User query succeeded.',
      title: 'Profile Settings',
      AVATAR,
      user
    })
  }

  static async updateUserProfile(ctx: Context, next: Next) {
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
      ctx.redirect('/profile')

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

      const topics = await TopicModel.find({ user: user._id }).sort('-updateTime')
      const formatTopics = format(topics)

      ctx.status = 200
      await ctx.render('myTopics', {
        msg: 'These are all my topics.',
        title: 'My Topics',
        formatTopics,
        user
      })

    } catch (err) {

      render500(err as Error, ctx)

    }
  }

  static logout(ctx: Context, next: Next) {
    ctx.cookies.set('cuid', null)
    ctx.cookies.set('token', null)
    ctx.redirect('/login')
  }
}
