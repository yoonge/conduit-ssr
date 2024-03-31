import { Context, Next } from 'koa'
import { Types } from 'mongoose'

import DEFAULT from '../config/default.js'
import TopicModel from '../models/topic.js'
import CommentModel from '..//models/comment.js'
import UserCtrl from './userAPI.js'
import { response401, response500 } from '../util/500.js'
import format from '../util/format.js'
import pagination from '../util/pagination.js'

import { Topic } from '../types/topic'
import { Comment } from '../types/comment'

export default class TopicCtrl {
  static async index(ctx: Context, next: Next) {
    try {
      const { page = '1' } = ctx.query
      const total = await TopicModel.count()
      const topics = await TopicModel.find()
        .limit(DEFAULT.PAGE_SIZE)
        .skip(DEFAULT.PAGE_SIZE * (Number(page) - 1))
        .populate('user')
        .sort('-updateTime')
      const formatTopics = format(topics)
      const pageList = pagination('/', DEFAULT.PAGE_SIZE, total, Number(page))

      const { user } = await UserCtrl.getCurrentUser(ctx, next)
      console.log('user', user);
      ctx.status = 200
      if (!user) {
        ctx.body = {
          code: 200,
          msg: 'Logged out.',
          formatTopics,
          pageList
        }
        return
      }

      ctx.body = {
        code: 200,
        msg: 'Logged in.',
        formatTopics,
        pageList,
        user
      }
    } catch (err) {
      response500(err as Error, ctx)
    }
  }

  static async detail(ctx: Context, next: Next) {
    try {
      const { _id } = ctx.params
      const topic = await TopicModel.findById(_id).populate('user').populate({
        options: {
          sort: {
            createTime: -1
          }
        },
        path: 'comments',
        populate: {
          path: 'user'
        }
      })

      const { user } = await UserCtrl.getCurrentUser(ctx, next)
      ctx.status = 200
      if (!user) {
        ctx.body = {
          code: 200,
          msg: 'Topic detail query succeed.',
          // comments,
          topic
        }
        return
      }

      ctx.body = {
        code: 200,
        msg: 'Topic detail query succeed.',
        // comments,
        topic,
        user
      }
    } catch (err) {
      response500(err as Error, ctx)
    }
  }

  // static async initiate(ctx: Context, next: Next) {
  //   const { user } = await UserCtrl.getCurrentUser(ctx, next)
  //   if (!user) {
  //     response401(new Error('Unauthorized'), ctx)
  //     return
  //   }

  //   await ctx.render('initiate', {
  //     title: 'Initiate a New Topic',
  //     msg: 'Initiate a new topic here.',
  //     user
  //   })
  // }

  static async doInitiate(ctx: Context, next: Next) {
    try {
      const newTopic = new TopicModel({
        ...(ctx.request.body as Topic)
      })
      console.log('newTopic', newTopic)
      await newTopic.save()

      ctx.status = 200
      ctx.body = {
        code: 200,
        msg: 'Topic initiate succeed.',
        newTopic
      }
      // ctx.redirect('/')
    } catch (err) {
      response500(err as Error, ctx)
    }
  }

  // static async getComments(ctx: Context, next: Next, topicId: Types.ObjectId) {
  //   try {
  //     return await CommentModel.find({ topic: topicId }).populate('user')
  //   } catch (err) {
  //     response500(err as Error, ctx)
  //   }
  // }

  static async doComment(ctx: Context, next: Next) {
    try {
      const { content, topic } = ctx.request.body as Comment
      if (content.trim()) {
        const newComment = new CommentModel({
          ...(ctx.request.body as Comment)
        })

        const savedNewComment = await newComment.save()
        const updatedTopic = await TopicModel.findByIdAndUpdate(topic, {
          $inc: { comment: 1 },
          $set: { updateTime: Date.now() },
          $push: { comments: savedNewComment._id }
        }, { new: true }).populate('user').populate({
          options: {
            sort: {
              createTime: -1
            }
          },
          path: 'comments',
          populate: {
            path: 'user'
          }
        })

        ctx.status = 200
        ctx.body = {
          code: 200,
          msg: 'Comment succeed.',
          updatedTopic,
        }
      } else {
        response500(new Error('Comment should not be empty.'), ctx)
      }
    } catch (err) {
      response500(err as Error, ctx)
    }
  }

  static async update(ctx: Context, next: Next) {
    try {
      const { user } = await UserCtrl.getCurrentUser(ctx, next)
      if (!user) {
        response401(new Error('Unauthorized'), ctx)
        return
      }

      const { _id } = ctx.params
      const topic = await TopicModel.findById(_id).populate('user')

      await ctx.render('topicUpdate', {
        msg: 'Topic detail query succeed.',
        title: 'Topic Update',
        topic,
        user
      })
    } catch (err) {
      response500(err as Error, ctx)
    }
  }

  static async doUpdate(ctx: Context, next: Next) {
    try {
      const { topicId, title, content } = ctx.request.body as any
      await TopicModel.findByIdAndUpdate(topicId, {
        $set: { title, content, updateTime: Date.now() }
      })
      ctx.redirect(`/topicDetail/${topicId}`)
    } catch (err) {
      response500(err as Error, ctx)
    }
  }
}
