import KoaRouter from '@koa/router'

import Authorization from '../middleware/authorization.js'
import UserCtrl from '../controllers/user.js'

const router = new KoaRouter()

router.get('/register', UserCtrl.register)

router.post('/register', UserCtrl.doRegister)

router.get('/login', UserCtrl.login)

router.post('/login', UserCtrl.doLogin)

router.get('/user', Authorization, UserCtrl.getCurrentUser)

router.get('/bar', (ctx, next) => {
  ctx.body = 'this is a users/bar response'
})

export default router
