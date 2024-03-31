import { format } from 'timeago.js'

import { Topic } from '../types/topic'

export default (topics: any[]) => {
  const formatTopics: Topic[] = []
  topics.forEach(topic => {
    const formatTopic = {
      ...topic.toJSON(),
      _id: topic._id.toString(),
      title: topic.title.length > 160 ? `${topic.title.slice(0, 160)} ...` : topic.title,
      content: topic.content.length > 200 ? `${topic.content.slice(0, 200)} ...` : topic.content,
      updateTimeStr: format(topic.updateTime)
    } as Topic
    formatTopics.push(formatTopic)
  })
  return formatTopics
}

export const dateTimeFormatter = (d: Date) => {
  return new Intl.DateTimeFormat('zh', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Asia/Shanghai',
    timeZoneName: 'short'
  }).format(d)
}
