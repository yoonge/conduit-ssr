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

router.get('/myFavorites', Authorization, UserCtrl.getMyFavorites)

router.post('/favor', Authorization, UserCtrl.favor)

router.get('/settings', Authorization, UserCtrl.getUserSettings)

router.post('/settings/update', Authorization, UserCtrl.updateUserSettings)

router.get('/profile', Authorization, UserCtrl.getUserProfile)

export default router
