import KoaRouter from '@koa/router'

import Authorization from '../middleware/authorization.js'
import UserCtrl from '../controllers/user.js'

const router = new KoaRouter()

router.get('/register', UserCtrl.register)

router.post('/register', UserCtrl.doRegister)

router.get('/login', UserCtrl.login)

router.post('/login', UserCtrl.doLogin)

router.post('/logout', UserCtrl.logout)

router.get('/myTopics', Authorization, UserCtrl.getMyTopics)

router.get('/myFavorite', Authorization, UserCtrl.getMyFavorite)

router.post('/favor', Authorization, UserCtrl.favor)

router.get('/profile', Authorization, UserCtrl.getUserProfile)

router.post('/profile/update', Authorization, UserCtrl.updateUserProfile)

export default router
