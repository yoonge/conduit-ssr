import { Context, Next } from 'koa'
import KoaRouter from '@koa/router'

const router = new KoaRouter()

router.get('/', async (ctx: Context, next: Next) => {
  console.log('ctx index', ctx.state)
  await ctx.render('index', {
    title: 'Hello Koa 2!'
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
