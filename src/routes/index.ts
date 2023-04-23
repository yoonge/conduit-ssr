import { Context, Next } from 'koa'
import KoaRouter from '@koa/router'
import jwt from 'jsonwebtoken'

import DEFAULT from '../config/default.js'

const router = new KoaRouter()

router.get('/', async (ctx: Context, next: Next) => {
  try {
    const token = ctx.cookies.get('token')
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(token as string, DEFAULT.JWT_SECRET, (err, decoded) => {
        if (err) reject(err)
        resolve(decoded)
      })
    })

    const { avatar, username } = decoded as jwt.JwtPayload
    await ctx.render('index', {
      title: 'Hello Message Board',
      msg: 'Homepage logged in.',
      user: { avatar, username }
    })
  } catch (err) {
    await ctx.render('index', {
      title: 'Hello Message Board',
      msg: 'Homepage logged out.',
    })
  }
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
