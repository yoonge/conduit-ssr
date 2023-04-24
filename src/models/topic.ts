import mongoose from './db.js'

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
  userId: {
    type: String,
    required: true,
    trim: true
  },
  comment: {
    type: Number,
    default: 0,
  },
  like: {
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
    default: Date.now
  },
  updateTime: {
    type: Date,
    default: Date.now
  }
})

const TopicModel = mongoose.model('Topic', TopicSchema, 'topic')

export default TopicModel
