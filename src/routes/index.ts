import { Context, Next } from 'koa'
import KoaRouter from '@koa/router'

import UserCtrl from '../controllers/user.js'

const router = new KoaRouter()

router.get('/', async (ctx: Context, next: Next) => {
  const { user } = await UserCtrl.getCurrentUser(ctx, next)
  if (!user) {
    await ctx.render('index', {
      title: 'Hello Message Board',
      msg: 'Logged out.',
    })
    return
  }

  await ctx.render('index', {
    title: 'Hello Message Board',
    msg: 'Logged in.',
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
