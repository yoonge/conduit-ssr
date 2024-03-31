import { Types } from 'mongoose'
import mongoose from './db.js'
import { dateTimeFormatter } from '../util/format.js'

const CommentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true
  },
  topic: {
    type: Types.ObjectId,
    ref: 'Topic'
  },
  user: {
    type: Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: Number,
    default: 1,
    enum: [0, 1] // Ban, Normal
  },
  createTime: {
    type: Date,
    default: Date.now,
    get: (val: Date) => dateTimeFormatter(val, false)
  }
}, { toJSON: { getters: true } })

const CommentModel = mongoose.model('Comment', CommentSchema, 'comment')

export default CommentModel
