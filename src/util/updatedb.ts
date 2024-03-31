// [
//   {
//     _id: ObjectId('644a500509fced0329f00e8d'),
//     content: 'dfgfdhghkjhkhj\r\n\r\n123445467567',
//     topic: ObjectId('6447b8d454000f464a26097b'),
//     user: ObjectId('643e636917db86e0cf75265c'),
//     status: 1,
//     createTime: ISODate('2023-04-27T10:35:49.365Z'),
//     __v: 0
//   },
//   {
//     _id: ObjectId('644a53774958e980aa723884'),
//     content: 'Hey, buddy, This is a test comment.',
//     topic: ObjectId('6447b8d454000f464a26097b'),
//     user: ObjectId('643e636917db86e0cf75265c'),
//     status: 1,
//     createTime: ISODate('2023-04-27T10:50:31.158Z'),
//     __v: 0
//   },
//   {
//     _id: ObjectId('644a58de361d4b948da4ba5b'),
//     content: 'Just a test comment.',
//     topic: ObjectId('644707c89a7250931b471036'),
//     user: ObjectId('643e636917db86e0cf75265c'),
//     status: 1,
//     createTime: ISODate('2023-04-27T11:13:34.490Z'),
//     __v: 0
//   },
//   {
//     _id: ObjectId('644a6709ce7932aba15d894a'),
//     content: 'Wo ye lai ping lun yi xia, ha ha ha ha',
//     topic: ObjectId('644708b09a7250931b47105f'),
//     user: ObjectId('6417e20e1c22d67af7e3f049'),
//     status: 1,
//     createTime: ISODate('2023-04-27T12:14:01.870Z'),
//     __v: 0
//   },
//   {
//     _id: ObjectId('645238f1f27fd171e4245e39'),
//     content: "My name is Zhang Xiaobei, I'm from Yingshan, Huanggang, Hubei.",
//     topic: ObjectId('6447b8d454000f464a26097b'),
//     user: ObjectId('643fa763950b6531500d302f'),
//     status: 1,
//     createTime: ISODate('2023-05-03T10:35:29.385Z'),
//     __v: 0
//   }
// ]

import UserModel from '../models/user.js'
import CommentModel from '../models/comment.js'
import TopicModel from '../models/topic.js'

export const updatedb = async () => {
  // =========================================================================== //

  const comments = await CommentModel.find()

  comments.forEach(async (comment: any) => {
    const newTopic = await TopicModel.findByIdAndUpdate(comment?.topic, {
      $addToSet: { comments: comment?._id }
    }, { new: true })
    console.log('new topic _id: ', newTopic?._id)
    console.log('new topic comments: ', newTopic?.comments)
  })

  // =========================================================================== //

  const newUser = await UserModel.findByIdAndUpdate('643e636917db86e0cf75265c', {
    $set: {
      email: 'one@qq.com'
    }
  })

  const newUser1 = await UserModel.findByIdAndUpdate('6448d3645c78f3ed38d4bcda', {
    $set: {
      email: 'yoonge@qq.com'
    }
  })
  console.log('new user: ', newUser, newUser1)

  // =========================================================================== //
}
