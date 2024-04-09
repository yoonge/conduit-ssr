import { AnyBulkWriteOperation } from 'mongodb'
import { Types } from 'mongoose'
import { Context, Next } from 'koa'

import DEFAULT from '../../config/default.js'
import TagModel from '../../models/tag.js'
import TopicModel from '../../models/topic.js'
import CommentModel from '../..//models/comment.js'
import UserCtrl from './user.js'
import { response401, response500 } from '../../util/error.js'
import format, { dateTimeFormatter } from '../../util/format.js'

import { Topic } from '../../types/topic'
import { Comment } from '../../types/comment'

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

      const { user } = await UserCtrl.getCurrentUser(ctx, next)
      console.log('user', user)
      ctx.status = 200
      if (!user) {
        ctx.body = {
          code: 200,
          msg: 'Logged out.',
          formatTopics,
          total
        }
        return
      }

      ctx.body = {
        code: 200,
        msg: 'Logged in.',
        formatTopics,
        total,
        user
      }
    } catch (err) {
      response500(err as Error, ctx)
    }
  }

  static async tags(ctx: Context, next: Next) {
    try {
      const tags = await TagModel.aggregate([
        { $project: {
          createTime: 1,
          createTimeStr: {
            $dateToString: {
              date: '$createTime',
              format: '%Y-%m-%d %H:%M:%S',
            }
          },
          size: { $size: '$topics' },
          tag: 1,
          topics: 1,
        }},
        { $sort: { size: -1 } },
      ], { allowDiskUse: true })

      const tagsArr: any[] = []
      tags.forEach(item => {
        const tagArr = [item.tag, item.size, `/tags/${item.tag}`]
        tagsArr.push(tagArr)
      })

      ctx.status = 200
      ctx.body = {
        code: 200,
        msg: 'Tags query succeed.',
        tags,
        tagsArr
      }
    } catch (err) {
      response500(err as Error, ctx)
    }
  }

  static async tag(ctx: Context, next: Next) {
    try {
      const { tag } = ctx.params
      const { page = '1' } = ctx.query
      const total = await TopicModel.find({ tags: tag }).count()
      const topics = await TopicModel.find({ tags: tag })
        .limit(DEFAULT.PAGE_SIZE)
        .skip(DEFAULT.PAGE_SIZE * (Number(page) - 1))
        .populate('user')
        .sort('-updateTime')
      const formatTopics = format(topics)

      const { user } = await UserCtrl.getCurrentUser(ctx, next)
      console.log('user', user)
      ctx.status = 200
      if (!user) {
        ctx.body = {
          code: 200,
          msg: 'Tag query succeed.',
          formatTopics,
          total
        }
        return
      }

      ctx.body = {
        code: 200,
        msg: 'Tag query succeed.',
        formatTopics,
        total,
        user
      }
    } catch (err) {
      response500(err as Error, ctx)
    }
  }

  static async detail(ctx: Context, next: Next) {
    try {
      const { _id } = ctx.params
      const topic = await TopicModel.findById(_id)
        .populate('user')
        .populate({
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
          topic
        }
        return
      }

      ctx.body = {
        code: 200,
        msg: 'Topic detail query succeed.',
        topic,
        user
      }
    } catch (err) {
      response500(err as Error, ctx)
    }
  }

  static async doInitiate(ctx: Context, next: Next) {
    try {
      const { tags = [] } = ctx.request.body as Topic
      const newTopic = new TopicModel({
        ...(ctx.request.body as Topic),
        tags: tags.sort()
      })
      console.log('newTopic', newTopic)
      const savedNewTopic = await newTopic.save()
      await savedNewTopic.populate('user')
      await savedNewTopic.populate({
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

      const { _id } = savedNewTopic
      await TopicCtrl.updateTags(ctx, next, _id, tags)

      ctx.status = 200
      ctx.body = {
        code: 200,
        msg: 'Topic initiate succeed.',
        newTopic: savedNewTopic
      }
    } catch (err) {
      response500(err as Error, ctx)
    }
  }

  static async doComment(ctx: Context, next: Next) {
    try {
      const { content, topic } = ctx.request.body as Comment
      if (content.trim()) {
        const newComment = new CommentModel({
          ...(ctx.request.body as Comment)
        })

        const savedNewComment = await newComment.save()
        const updatedTopic = await TopicModel.findByIdAndUpdate(
          topic,
          {
            $inc: { comment: 1 },
            $set: { updateTime: Date.now() },
            $push: { comments: savedNewComment._id }
          },
          { new: true }
        )
          .populate('user')
          .populate({
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
          updatedTopic
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
      const { topicId, title, tags, tagsRemoved, content } = ctx.request.body as any
      const updatedTopic = await TopicModel.findByIdAndUpdate(
        topicId,
        {
          $set: { title, tags: tags.sort(), content, updateTime: Date.now() }
        },
        { new: true }
      )
        .populate('user')
        .populate({
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

      await TopicCtrl.removeTags(ctx, next, topicId, tagsRemoved)
      await TopicCtrl.updateTags(ctx, next, topicId, tags)

      ctx.status = 200
      ctx.body = {
        code: 200,
        msg: 'Topic update succeed.',
        updatedTopic
      }
    } catch (err) {
      response500(err as Error, ctx)
    }
  }

  static async updateTags(ctx: Context, next: Next, topicId: Types.ObjectId, tags: string[]) {
    if (!tags.length) {
      await next()
      return
    }

    try {
      const writes: AnyBulkWriteOperation<any>[] = []
      tags.forEach((tag: string) => {
        writes.push({
          updateOne: {
            filter: { tag },
            update: {
              $addToSet: { topics: topicId } as any,
            },
            upsert: true
          }
        })
      })
      await TagModel.bulkWrite(writes)
      await next()
    } catch (err) {
      response500(err as Error, ctx)
    }
  }

  static async removeTags(ctx: Context, next: Next, topicId: Types.ObjectId, tagsRemoved: string[]) {
    if (!tagsRemoved.length) {
      await next()
      return
    }

    try {
      const writes: AnyBulkWriteOperation<any>[] = []
      tagsRemoved.forEach((tag: string) => {
        writes.push({
          updateOne: {
            filter: {
              tag,
              topics: {
                $elemMatch: { $eq: topicId }
              }
            },
            update: {
              $pull: { topics: topicId } as any,
            }
          }
        })
      })
      await TagModel.bulkWrite(writes)
      await TagModel.deleteMany({ topics: [] })
      await next()
    } catch (err) {
      response500(err as Error, ctx)
    }
  }
}
