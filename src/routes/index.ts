import { Context, Next } from 'koa'
import KoaRouter from '@koa/router'

import UserCtrl from '../controllers/user.js'

const router = new KoaRouter()

router.get('/', async (ctx: Context, next: Next) => {
  const { user } = await UserCtrl.getCurrentUser(ctx, next)
  if (!user) {
    await ctx.render('index', {
      title: 'Topic List',
      msg: 'Logged out.',
    })
    return
  }

  await ctx.render('index', {
    title: 'Topic List',
    msg: 'Logged in.',
    user
  })
})

router.get('/topic/post',async (ctx: Context, next: Next) => {
  const { user } = await UserCtrl.getCurrentUser(ctx, next)
  if (!user) {
    ctx.redirect('/login')
    return
  }

  await ctx.render('post', {
    title: 'A New Topic',
    msg: 'Post a new topic here.',
    user
  })
})

router.get('/string', async (ctx: Context, next: Next) => {
  ctx.body = 'koa2 string'
})

router.get('/json', async (ctx: Context, next: Next) => {
  ctx.body = {
    title: 'koa2 json'
  }
})

export default router
