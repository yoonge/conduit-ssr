import { Context, Next } from 'koa'

import DEFAULT from '../../config/default.js'
import AVATAR from '../../config/avatar.js'
import UserModel from '../../models/user.js'
import TopicModel from '../../models/topic.js'
import { response401, response500 } from '../../util/error.js'
import { generateToken } from '../../util/token.js'
import format from '../../util/format.js'
import md5 from '../../util/md5.js'

import { User } from '../../types/user'

export default class UserCtrl {
  static async doRegister(ctx: Context, next: Next) {
    try {
      const { email, username, password } = ctx.request.body as User
      const user = await UserModel.findOne({
        $or: [{ email }, { username }]
      })

      if (user) {
        response500(new Error('Email or Username is already exsist.'), ctx)
        return
      }

      const newUser = new UserModel({
        ...(ctx.request.body as User),
        password: md5(password)
      })
      const savedNewUser = await newUser.save()
      const { _id, username: _username } = savedNewUser
      const token = await generateToken(_id.toString(), username)

      if (!token) {
        response500(new Error('Internal Server Error.'), ctx)
        return
      }

      ctx.state.cuid = _id.toString()

      ctx.status = 200
      ctx.body = {
        code: 200,
        msg: 'Register succeed.',
        user: savedNewUser,
        token
      }
    } catch (err) {
      response500(err as Error, ctx)
    }
  }

  static async doLogin(ctx: Context, next: Next) {
    try {
      const { email, password } = ctx.request.body as User
      const user = await UserModel.findOne({
        email,
        password: md5(password)
      })

      if (!user) {
        response500(new Error('Email or Password is incorrect.'), ctx)
        return
      }

      const { _id, username } = user
      const token = await generateToken(_id.toString(), username)

      if (!token) {
        response500(new Error('Internal Server Error.'), ctx)
        return
      }

      ctx.state.cuid = _id.toString()

      ctx.status = 200
      ctx.body = {
        code: 200,
        msg: 'Login succeed.',
        user,
        token
      }
    } catch (err) {
      response500(err as Error, ctx)
    }
  }

  static logout(ctx: Context, next: Next) {
    ctx.state.cuid = null
  }

  static async getCurrentUser(ctx: Context, next: Next) {
    try {
      const { cuid } = ctx.state
      const user = await UserModel.findById(cuid)
      return { err: null, user }
    } catch (err) {
      return { err, user: null }
    }
  }

  static async getUserSettings(ctx: Context, next: Next) {
    const { err, user } = await UserCtrl.getCurrentUser(ctx, next)

    if (err) {
      response500(err as Error, ctx)
      return
    }

    ctx.status = 200
    ctx.body = {
      code: 200,
      msg: 'User query succeed.',
      AVATAR,
      user
    }
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
      const updatedUser = await UserModel.findByIdAndUpdate(
        _id,
        { $set: { ...newUser } },
        { new: true }
      )
      ctx.status = 200
      ctx.body = {
        code: 200,
        msg: 'User settings were updated succeed.',
        user: updatedUser
      }
    } catch (err) {
      response500(err as Error, ctx)
    }
  }

  static async getMyTopics(ctx: Context, next: Next) {
    try {
      const { user } = await UserCtrl.getCurrentUser(ctx, next)
      if (!user) {
        response401(new Error('Unauthorized'), ctx)
        return
      }

      const { page = '1' } = ctx.query
      const total = await TopicModel.find({ user: user._id }).count()
      const topics = await TopicModel.find({ user: user._id })
        .limit(DEFAULT.PAGE_SIZE)
        .skip(DEFAULT.PAGE_SIZE * (Number(page) - 1))
        .populate('user')
        .sort('-updateTime')
      const formatTopics = format(topics)

      ctx.status = 200
      ctx.body = {
        code: 200,
        msg: 'Query my own topics succeed.',
        page: Number(page),
        topics: formatTopics,
        total,
        user
      }
    } catch (err) {
      response500(err as Error, ctx)
    }
  }

  static async getMyFavorites(ctx: Context, next: Next) {
    try {
      const { user } = await UserCtrl.getCurrentUser(ctx, next)
      if (!user) {
        response401(new Error('Unauthorized'), ctx)
        return
      }

      const { page = '1' } = ctx.query
      const total = await TopicModel.find({ _id: { $in: user.favorite } }).count()
      const topics = await TopicModel.find({ _id: { $in: user.favorite } })
        .limit(DEFAULT.PAGE_SIZE)
        .skip(DEFAULT.PAGE_SIZE * (Number(page) - 1))
        .populate('user')
        .sort('-updateTime')
      const formatTopics = format(topics)

      ctx.status = 200
      ctx.body = {
        code: 200,
        msg: 'Query my favorite topics succeed.',
        page: Number(page),
        topics: formatTopics,
        total,
        user
      }
    } catch (err) {
      response500(err as Error, ctx)
    }
  }

  static async favor(ctx: Context, next: Next) {
    try {
      const { user } = await UserCtrl.getCurrentUser(ctx, next)
      if (!user) {
        response401(new Error('Unauthorized'), ctx)
        return
      }

      const { topicId, userId } = ctx.request.body as any
      if (user.favorite?.includes(topicId)) {
        const updatedTopic = await TopicModel.findByIdAndUpdate(
          topicId,
          { $inc: { favorite: -1 } },
          { new: true }
        ).populate('user')
        const formatTopic = format([updatedTopic])[0]
        const updatedUser = await UserModel.findByIdAndUpdate(
          userId,
          { $pull: { favorite: topicId } },
          { new: true }
        )
        ctx.status = 200
        ctx.body = {
          code: 200,
          msg: 'Disfavor succeed.',
          updatedTopic: formatTopic,
          updatedUser
        }
      } else {
        const updatedTopic = await TopicModel.findByIdAndUpdate(
          topicId,
          { $inc: { favorite: 1 } },
          { new: true }
        ).populate('user')
        const formatTopic = format([updatedTopic])[0]
        const updatedUser = await UserModel.findByIdAndUpdate(
          userId,
          { $push: { favorite: topicId } },
          { new: true }
        )
        ctx.status = 200
        ctx.body = {
          code: 200,
          msg: 'Favor succeed.',
          updatedTopic: formatTopic,
          updatedUser
        }
      }
    } catch (err) {
      response500(err as Error, ctx)
    }
  }

  static async getUserProfile(ctx: Context, next: Next) {
    try {
      const { user } = await UserCtrl.getCurrentUser(ctx, next)
      if (!user) {
        response401(new Error('Unauthorized'), ctx)
        return
      }

      const { username } = ctx.params
      const theUser = await UserModel.findOne({ username })

      const { page = '1' } = ctx.query
      const total = await TopicModel.find({ user: theUser?._id }).count()
      const topics = await TopicModel.find({ user: theUser?._id })
        .limit(DEFAULT.PAGE_SIZE)
        .skip(DEFAULT.PAGE_SIZE * (Number(page) - 1))
        .populate('user')
        .sort('-updateTime')
      const formatTopics = format(topics)

      ctx.status = 200
      ctx.body = {
        code: 200,
        msg: `User ${theUser?.nickname}'s topics query succeed.`,
        page: Number(page),
        topics: formatTopics,
        theUser,
        total,
        user
      }
    } catch (err) {
      response500(err as Error, ctx)
    }
  }

  static async getUserFavorites(ctx: Context, next: Next) {
    try {
      const { user } = await UserCtrl.getCurrentUser(ctx, next)
      if (!user) {
        response401(new Error('Unauthorized'), ctx)
        return
      }

      const { username } = ctx.params
      const theUser = await UserModel.findOne({ username })

      const { page = '1' } = ctx.query
      const total = await TopicModel.find({ _id: { $in: theUser?.favorite } }).count()
      const topics = await TopicModel.find({ _id: { $in: theUser?.favorite } })
        .limit(DEFAULT.PAGE_SIZE)
        .skip(DEFAULT.PAGE_SIZE * (Number(page) - 1))
        .populate('user')
        .sort('-updateTime')
      const formatTopics = format(topics)

      ctx.status = 200
      ctx.body = {
        code: 200,
        msg: `User ${theUser?.nickname}'s favorites query succeed.`,
        page: Number(page),
        topics: formatTopics,
        theUser,
        total,
        user
      }
    } catch (err) {
      response500(err as Error, ctx)
    }
  }
}
