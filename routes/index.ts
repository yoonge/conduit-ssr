import { ParameterizedContext } from 'koa'
import koaRouter from '@koa/router'
const router = new koaRouter()

router.get('/', async (ctx: ParameterizedContext, next) => {
  await ctx.render('index', {
    title: 'Hello Koa 2!'
  })
})

router.get('/signup', async (ctx: ParameterizedContext, next) => {
  await ctx.render('sign-up', {
    title: 'Sign Up Page'
  })
})

router.get('/signin', async (ctx: ParameterizedContext, next) => {
  await ctx.render('sign-in', {
    title: 'Sign In Page'
  })
})

router.get('/string', async (ctx, next) => {
  ctx.body = 'koa2 string'
})

router.get('/json', async (ctx, next) => {
  ctx.body = {
    title: 'koa2 json'
  }
})

export default router
