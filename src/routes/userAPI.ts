import KoaRouter from '@koa/router'

import Authorization from '../middleware/authorizationAPI.js'
import UserCtrl from '../controllers/userAPI.js'

const router = new KoaRouter()

router.post('/api/register', UserCtrl.doRegister)

router.post('/api/login', UserCtrl.doLogin)

router.post('/api/logout', UserCtrl.logout)

router.get('/api/my-topics', Authorization, UserCtrl.getMyTopics)

router.get('/api/my-favorites', Authorization, UserCtrl.getMyFavorites)

router.post('/api/favor', Authorization, UserCtrl.favor)

router.get('/api/settings', Authorization, UserCtrl.getUserSettings)

router.post('/api/settings/update', Authorization, UserCtrl.updateUserSettings)

router.get('/api/profile/:username', Authorization, UserCtrl.getUserProfile)

router.get('/api/profile/:username/favorites', Authorization, UserCtrl.getUserFavorites)

export default router
