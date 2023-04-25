import KoaRouter from '@koa/router'

import Authorization from '../middleware/authorization.js'
import TopicCtrl from '../controllers/topic.js'

const router = new KoaRouter()

router.get('/', TopicCtrl.index)

router.get('/topicDetail/:_id', TopicCtrl.detail)

router.get('/topic/post', Authorization, TopicCtrl.post)

router.post('/topic/post', Authorization, TopicCtrl.doPost)

export default router
