import KoaRouter from '@koa/router'

import Authorization from '../middleware/authorization.js'
import UserCtrl from '../controllers/user.js'

const router = new KoaRouter()

router.get('/register', UserCtrl.register)

router.post('/register', UserCtrl.doRegister)

router.get('/login', UserCtrl.login)

router.post('/login', UserCtrl.doLogin)

router.get('/myTopic', Authorization, async (ctx, next) => {
  const { user } = await UserCtrl.getCurrentUser(ctx, next)
  if (!user) {
    ctx.redirect('/login')
    return
  }

  await ctx.render('myTopic', {
    title: 'My Topics',
    msg: 'These are all my topics.',
    user
  })
})

router.get('/profile', Authorization, UserCtrl.getUserProfile)

router.post('/profile/update', Authorization, UserCtrl.updateUserProfile)

router.post('/logout', UserCtrl.logout)

export default router
