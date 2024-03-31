import KoaRouter from '@koa/router'

import Authorization from '../middleware/authorization.js'
import TopicCtrl from '../controllers/topic.js'

const router = new KoaRouter()

router.get('/api/', TopicCtrl.index)

router.get('/api/topic/:_id', TopicCtrl.detail)

router.get('/api/topic/update/:_id', Authorization, TopicCtrl.update)

// router.get('/api/topic/initiate', Authorization, TopicCtrl.initiate)

router.post('/api/topic/initiate', Authorization, TopicCtrl.doInitiate)

router.post('/api/topic/comment', Authorization, TopicCtrl.doComment)

router.post('/api/topic/update', Authorization, TopicCtrl.doUpdate)

export default router
