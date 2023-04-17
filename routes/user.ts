import koaRouter from '@koa/router'
const router = new koaRouter()

router.prefix('/user')

router.get('/', (ctx, next) => {
  ctx.body = 'this is a users response!'
})

router.get('/bar', (ctx, next) => {
  ctx.body = 'this is a users/bar response'
})

export default router
