import { Types } from 'mongoose'

import mongoose from './db.js'

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
    default: Date.now
  },
})

const CommentModel = mongoose.model('Comment', CommentSchema, 'comment')

export default CommentModel
