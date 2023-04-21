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

/**
 * @apiDefine admin:computer User access only
 * This optional description belong to to the group admin.
 */
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

  /**
   * @api {get} /user/:region/:id/:opt Read data of a User
   * @apiVersion 0.1.0
   * @apiName GetCurrentUser
   * @apiGroup User
   * @apiPermission admin:computer
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
    console.log('ctx.currentUserId', ctx.currentUserId)
    const user = await UserModel.findById(ctx.currentUserId)
    console.log('user', user)

    if (!user) {
      ctx.status = 500
      ctx.body = {
        msg: 'Internal Server Error.'
      }
    }

    await ctx.render('user', {
      msg: 'Query succeeded.',
      user
    })
  }
}
