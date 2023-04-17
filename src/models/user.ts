import mongoose from './db.js'

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    trim: true
  },
  create_time: {
    type: Date,
    default: Date.now
  },
  last_modify_time: {
    type: Date,
    default: Date.now
  },
  gender: {
    type: Number,
    default: -1,
    enum: [-1, 0, 1] // 保密，女，男
  },
  status: {
    type: Number,
    default: 1,
    enum: [-1, 0, 1] // 封号，禁言，正常
  },
  avatar: {
    type: String,
    default: '/images/typescript.svg'
  },
  bio: {
    type: String,
    default: ''
  },
  birthday: {
    type: Date
  }
})

const UserModel = mongoose.model('User', UserSchema, 'user')

export default UserModel
