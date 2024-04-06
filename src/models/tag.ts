import { Types } from 'mongoose'
import mongoose from './db.js'
import { dateTimeFormatter } from '../util/format.js'

const TagSchema = new mongoose.Schema({
  tag: {
    type: String,
    min: 1,
    max: 20,
    required: true,
    trim: true
  },
  topics: [
    {
      type: Types.ObjectId,
      ref: 'Topic'
    }
  ],
  createTime: {
    type: Date,
    default: Date.now,
    get: (val: Date) => dateTimeFormatter(val, false)
  }
}, { toJSON: { getters: true } })

const TagModel = mongoose.model('Tag', TagSchema, 'tag')

export default TagModel
