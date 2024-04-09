declare type Topic = {
  _id: string
  comment?: number
  content: string
  favorite?: number
  status?: number
  tags: Types.ObjectId[]
  title: string
  updateTime: Date
  updateTimeStr?: string
}

export { Topic }
