import { Context, Next } from 'koa'

import TopicModel from '../models/topic.js'
import UserCtrl from './user.js'
import render500 from '../util/500.js'
import format from '../util/format.js'

import { Topic } from '../types/topic'

export default class TopicCtrl {
  static async index(ctx: Context, next: Next) {
    try {

      const topics = await TopicModel.find().populate('user').sort('-updateTime')
      const formatTopics = format(topics)

      const { user } = await UserCtrl.getCurrentUser(ctx, next)
      if (!user) {
        await ctx.render('index', {
          msg: 'Logged out.',
          title: 'Welcome',
          formatTopics
        })
        return
      }

      await ctx.render('index', {
        msg: 'Logged in.',
        title: 'Welcome',
        formatTopics,
        user
      })

    } catch (err) {

      render500(err as Error, ctx)

    }
  }

  static async detail(ctx: Context, next: Next) {
    try {

      const { _id } = ctx.params
      const topic = await TopicModel.findById(_id).populate('user')

      const { user } = await UserCtrl.getCurrentUser(ctx, next)
      if (!user) {
        await ctx.render('topicDetail', {
          msg: 'Topic detail query succeed.',
          title: 'Topic Detail',
          topic
        })
        return
      }

      await ctx.render('topicDetail', {
        msg: 'Topic detail query succeed.',
        title: 'Topic Detail',
        topic,
        user
      })

    } catch (err) {
      render500(err as Error, ctx)
    }
  }

  static async initiate(ctx: Context, next: Next) {
    const { user } = await UserCtrl.getCurrentUser(ctx, next)
    if (!user) {
      ctx.redirect('/login')
      return
    }

    await ctx.render('initiate', {
      title: 'Initiate a New Topic',
      msg: 'Initiate a new topic here.',
      user
    })
  }

  static async doInitiate(ctx: Context, next: Next) {
    try {

      const newTopic = new TopicModel({
        ...(ctx.request.body as Topic)
      })
      console.log('newTopic', newTopic)
      await newTopic.save()
      ctx.redirect('/')

    } catch (err) {
      render500(err as Error, ctx)
    }
  }
}
