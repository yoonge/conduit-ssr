import { Types } from 'mongoose'
import mongoose from './db.js'
import { dateTimeFormatter } from '../util/format.js'

const TopicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  user: {
    type: Types.ObjectId,
    ref: 'User'
  },
  comment: {
    type: Number,
    default: 0
  },
  comments: [
    {
      type: Types.ObjectId,
      ref: 'Comment'
    }
  ],
  favorite: {
    type: Number,
    default: 0
  },
  status: {
    type: Number,
    default: 1,
    enum: [-1, 0, 1] // Ban, Mute，Normal
  },
  createTime: {
    type: Date,
    default: Date.now,
    get: dateTimeFormatter
  },
  updateTime: {
    type: Date,
    default: Date.now,
    get: dateTimeFormatter
  }
})

TopicSchema.set('toJSON', { getters: true })
const TopicModel = mongoose.model('Topic', TopicSchema, 'topic')

export default TopicModel
