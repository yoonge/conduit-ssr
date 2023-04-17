import koaRouter from '@koa/router'
const router = new koaRouter()

import userCtrl from '../controllers/user.js'

router.get('/register', userCtrl.register)

router.post('/register', userCtrl.doRegister)

router.get('/login', userCtrl.login)

router.get('/user', (ctx, next) => {
  ctx.body = 'this is a users response!'
})

router.get('/bar', (ctx, next) => {
  ctx.body = 'this is a users/bar response'
})

export default router
