import { format } from 'timeago.js'

import { Topic } from "../types/topic"

export default (topics: any[]) => {
  const formatTopics: Topic[] = []
  topics.forEach(topic => {
    const formatTopic = {
      ...topic.toJSON(),
      _id: topic._id.toString(),
      title: topic.title.length > 160
        ? `${topic.title.slice(0, 160)} ...`
        : topic.title,
      content: topic.content.length > 200
        ? `${topic.content.slice(0, 200)} ...`
        : topic.content,
      updateTimeStr: format(topic.updateTime)
    } as Topic
    formatTopics.push(formatTopic)
  })
  return formatTopics
}
