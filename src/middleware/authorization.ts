import { Context, Next } from 'koa'
import jwt from 'jsonwebtoken'

import DEFAULT from '../config/default.js'

export default async (ctx: Context, next: Next) => {
  console.log('ctx', ctx)
  const token = ctx.cookies.get('token') || null

  if (!token) {
    ctx.status = 401
    ctx.body = {
      msg: 'Unauthorized.'
    }
    return
  }

  const decoded = await new Promise((resolve, reject) => {
    jwt.verify(token, DEFAULT.JWT_SECRET, (err, decoded) => {
      if (err) reject(err)
      resolve(decoded)
    })
  })
  if (!decoded) {
    ctx.status = 401
    ctx.body = {
      msg: 'Unauthorized.'
    }
    return
  }

  console.log('decoded', decoded)
  const { currentUserId } = decoded as jwt.JwtPayload
  ctx.currentUserId = currentUserId
  await next()
}

// export default async (ctx: Context, next: Next) => {
//   console.log('ctx.headers', ctx.headers)
//   const { authorization } = ctx.headers
//   const token = authorization ? authorization.split('Bearer ')[1] : null

//   if (!token) {
//     ctx.status = 401
//     ctx.body = {
//       msg: 'Unauthorized.'
//     }
//     return
//   }

  // const decoded = await new Promise((resolve, reject) => {
  //   jwt.verify(token, DEFAULT.JWT_SECRET, (err, decoded) => {
  //     if (err) reject(err)
  //     resolve(decoded)
  //   })
  // })
  // if (!decoded) {
  //   ctx.status = 401
  //   ctx.body = {
  //     msg: 'Unauthorized.'
  //   }
  //   return
  // }

  // console.log('decoded', decoded)
  // const { currentUserId } = decoded as jwt.JwtPayload
  // ctx.currentUserId = currentUserId
  // await next()
// }
