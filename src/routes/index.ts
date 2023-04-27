import KoaRouter from '@koa/router'

import Authorization from '../middleware/authorization.js'
import TopicCtrl from '../controllers/topic.js'

const router = new KoaRouter()

router.get('/', TopicCtrl.index)

router.get('/topicDetail/:_id', TopicCtrl.detail)

router.get('/topic/initiate', Authorization, TopicCtrl.initiate)

router.post('/topic/initiate', Authorization, TopicCtrl.doInitiate)

router.post('/topic/comment', Authorization, TopicCtrl.doComment)

export default router
