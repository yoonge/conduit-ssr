import mongoose from './db.js'

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    min: 6,
    max: 24,
    select: false,
    trim: true
  },
  username: {
    type: String,
    required: true,
    trim: true
  },
  nickname: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    default: '/images/typescript.svg'
  },
  gender: {
    type: Number,
    default: -1,
    enum: [-1, 0, 1] // Secret, Female, Male
  },
  birthday: {
    type: String,
    trim: true
  },
  phone: {
    type: Number,
    length: 11,
    min: 10000000000,
    max: 19999999999
  },
  job: {
    type: String,
    trim: true,
    default: ''
  },
  bio: {
    type: String,
    trim: true,
    default: ''
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

const UserModel = mongoose.model('User', UserSchema, 'user')

export default UserModel
