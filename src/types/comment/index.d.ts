declare type Comment = {
  _id: string
  content: string
  status?: number
  topic: Types.ObjectId
  createTime?: Date
  createTimeStr?: string
}

export { Comment }
